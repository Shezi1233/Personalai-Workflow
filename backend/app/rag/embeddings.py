"""Embedding helpers using Google Gemini's text-embedding-004.

Used both at ingestion time (documents) and query time (questions), so both
sides embed with the same model/dimensions (768-dim vectors).
"""
import google.generativeai as genai

from app.config import settings

_configured = False


def _ensure_configured() -> None:
    global _configured
    if not _configured:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _configured = True


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Return a list of embeddings, one per input string.

    gemini-embedding-2 returns the batch as a flat list of vectors (each a
    list of floats) — but to be safe we normalize the shape either way.
    """
    if not texts:
        return []
    _ensure_configured()
    result = await genai.embed_content_async(
        model=settings.GEMINI_EMBEDDING_MODEL,
        content=texts,
    )
    emb = result["embedding"]
    # Batch call: emb is a list of vectors → return as-is.
    if isinstance(emb, list) and emb and isinstance(emb[0], list):
        return [list(vec) for vec in emb]
    # Single call: emb is a flat vector → wrap once.
    return [list(emb)]


async def embed_text(text: str) -> list[float]:
    """Embed a single string (used at query time)."""
    return (await embed_texts([text]))[0]
