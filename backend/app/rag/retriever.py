"""Retriever: embed a visitor's question and find the most relevant chunks in
Qdrant by cosine similarity.
"""
from qdrant_client import AsyncQdrantClient

from app.config import settings
from app.rag.embeddings import embed_text

_client: AsyncQdrantClient | None = None


def get_client() -> AsyncQdrantClient:
    global _client
    if _client is None:
        _client = AsyncQdrantClient(
            url=settings.QDRANT_CLUSTER_ENDPOINT,
            api_key=settings.QDRANT_API_KEY,
        )
    return _client


async def retrieve(
    question: str,
    top_k: int | None = None,
) -> list[tuple[str, float]]:
    """Return the top-k most relevant chunks as [(text, score), ...]."""
    k = top_k or settings.RAG_TOP_K
    query_embedding = await embed_text(question)

    client = get_client()
    hits = await client.query_points(
        collection_name=settings.QDRANT_COLLECTION,
        query=query_embedding,
        limit=k,
        with_payload=True,
    )
    results: list[tuple[str, float]] = []
    for hit in hits.points:
        text = (hit.payload or {}).get("text", "")
        if text:
            results.append((text, hit.score or 0.0))
    return results
