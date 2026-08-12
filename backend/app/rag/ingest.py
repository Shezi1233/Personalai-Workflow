"""Ingestion: split profile_knowledge.md into semantic chunks, embed them
with Gemini, and upsert into the Qdrant `portfolio_knowledge` collection.

Run once (or whenever profile_knowledge.md changes) to (re)build the index:

    python -m app.rag.ingest            # ingest
    python -m app.rag.ingest --verify   # ingest, then re-query a few test
                                        # questions and print the top hits

Idempotent: chunks are upserted by stable, hash-based point IDs, so re-running
replaces existing points instead of duplicating them. The collection is created
once if it doesn't exist (vector size must match the embedding model — 768).
"""
import argparse
import asyncio
import hashlib
import uuid
from pathlib import Path

from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from app.config import settings
from app.rag.embeddings import embed_text, embed_texts

# Qdrant cloud rate-limits frequent writes; upsert in small batches and retry
# transient failures with backoff so a burst never kills an ingestion run.
UPSERT_BATCH_SIZE = 2
UPSERT_MAX_RETRIES = 4

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "profile_knowledge.md"

# Headings we never index as retrievable content (used to split sections).
SKIP_SECTIONS = {"# About Malik Shahzad"}

# Rough target for a chunk (~200-400 tokens). Keep sections small enough that
# retrieval returns focused context.
MAX_CHARS = 1600


def split_by_headings(markdown: str) -> list[tuple[str, str]]:
    """Return [(section_label, body), ...].

    A section starts at a line beginning with '# '. The label is the heading
    text; the body is everything up to the next heading. Top-level "# About"
    is treated as a header, not retrievable content.
    """
    sections: list[tuple[str, str]] = []
    current_heading: str | None = None
    current_lines: list[str] = []

    def flush() -> None:
        nonlocal current_lines
        if current_heading and current_heading not in SKIP_SECTIONS and current_lines:
            sections.append((current_heading, "\n".join(current_lines).strip()))
        current_lines = []

    for line in markdown.splitlines():
        stripped = line.strip()
        if stripped.startswith("# "):
            flush()
            current_heading = stripped[2:].strip()
        else:
            current_lines.append(line)
    flush()
    return sections


def chunk_paragraphs(body: str, section: str) -> list[tuple[str, str]]:
    """Split a section's body into chunks of ~MAX_CHARS with ~15% overlap.

    Paragraphs (blank-line separated) are accumulated until they reach the
    budget; the last paragraph is then repeated as the start of the next chunk
    so long context stays retrievable across chunk boundaries. Returns
    [(section, chunk_text), ...].
    """
    paragraphs = [p.strip() for p in body.split("\n\n") if p.strip()]
    if not paragraphs:
        return []

    chunks: list[tuple[str, str]] = []
    current: list[str] = []
    current_len = 0
    last_para: str | None = None

    for para in paragraphs:
        if current and current_len + len(para) > MAX_CHARS:
            chunks.append((section, "\n\n".join(current).strip()))
            current = [last_para] if last_para else []
            current_len = len(last_para) if last_para else 0
        current.append(para)
        current_len += len(para)
        last_para = para

    if current:
        chunks.append((section, "\n\n".join(current).strip()))
    return chunks


def stable_id(text: str) -> uuid.UUID:
    """Deterministic UUID point ID so re-runs replace, not duplicate, points.

    Qdrant accepts only unsigned ints or UUIDs as point IDs — a raw SHA-1 hex
    string is rejected. Deriving a UUID from the hash keeps IDs stable.
    """
    digest = hashlib.sha1(text.encode("utf-8")).digest()[:16]
    return uuid.UUID(bytes=digest)


async def _ensure_collection(
    client: AsyncQdrantClient, reset: bool = False
) -> None:
    collections = await client.get_collections()
    names = {c.name for c in collections.collections}
    exists = settings.QDRANT_COLLECTION in names
    if exists and reset:
        await client.delete_collection(collection_name=settings.QDRANT_COLLECTION)
        print(f"Dropped existing collection '{settings.QDRANT_COLLECTION}'.")
        exists = False
    if not exists:
        await client.create_collection(
            collection_name=settings.QDRANT_COLLECTION,
            vectors_config=VectorParams(
                size=settings.EMBEDDING_DIMENSIONS,
                distance=Distance.COSINE,
            ),
        )
        print(f"Created collection '{settings.QDRANT_COLLECTION}'.")


async def ingest(reset: bool = False) -> int:
    client = AsyncQdrantClient(
        url=settings.QDRANT_CLUSTER_ENDPOINT,
        api_key=settings.QDRANT_API_KEY,
    )
    try:
        await _ensure_collection(client, reset=reset)

        markdown = DATA_FILE.read_text(encoding="utf-8")
        # [(section, chunk_text), ...]
        chunks = []
        for section, body in split_by_headings(markdown):
            chunks.extend(chunk_paragraphs(body, section))
        if not chunks:
            print("No chunks found; nothing to ingest.")
            return 0

        print(f"Embedding {len(chunks)} chunks...")
        vectors = await embed_texts([text for _, text in chunks])

        points = [
            PointStruct(
                id=stable_id(text),
                vector=vector,
                payload={"section": section, "text": text},
            )
            for (section, text), vector in zip(chunks, vectors)
        ]
        # Small batches + retries (Qdrant cloud rate-limits bursts).
        upserted = 0
        for i in range(0, len(points), UPSERT_BATCH_SIZE):
            batch = points[i : i + UPSERT_BATCH_SIZE]
            for attempt in range(1, UPSERT_MAX_RETRIES + 1):
                try:
                    await client.upsert(
                        collection_name=settings.QDRANT_COLLECTION,
                        points=batch,
                    )
                    upserted += len(batch)
                    break
                except Exception as exc:  # noqa: BLE001 — transient failures retried
                    if attempt == UPSERT_MAX_RETRIES:
                        raise
                    await asyncio.sleep(0.5 * attempt)
                    print(
                        f"  retry {attempt} for batch {i // UPSERT_BATCH_SIZE} "
                        f"({type(exc).__name__})"
                    )
        print(f"Upserted {upserted} chunks into '{settings.QDRANT_COLLECTION}'.")
        return upserted
    finally:
        await client.close()


async def verify(top_k: int = 3) -> None:
    """Embed a few test questions and print the top matches per question."""
    client = AsyncQdrantClient(
        url=settings.QDRANT_CLUSTER_ENDPOINT,
        api_key=settings.QDRANT_API_KEY,
    )
    try:
        questions = [
            "What skills does Malik have?",
            "Tell me about Malik's work experience.",
            "What projects has Malik built?",
            "How can I contact Malik?",
        ]
        for question in questions:
            vector = await embed_text(question)
            hits = await client.query_points(
                collection_name=settings.QDRANT_COLLECTION,
                query=vector,
                limit=top_k,
                with_payload=True,
            )
            print(f"\nQ: {question}")
            for hit in hits.points:
                score = round(hit.score or 0, 4)
                section = (hit.payload or {}).get("section", "?")
                text = (hit.payload or {}).get("text", "")
                preview = text[:80].replace("\n", " ")
                print(f"  [{score}] ({section}) {preview}...")
    finally:
        await client.close()


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify", action="store_true", help="ingest then query test questions")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="drop and recreate the collection first (use when vector size changed)",
    )
    args = parser.parse_args()

    count = await ingest(reset=args.reset)
    print(f"Done. {count} chunks in Qdrant.")
    if args.verify:
        await verify()


if __name__ == "__main__":
    asyncio.run(main())
