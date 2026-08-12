"""LLM calls via OpenRouter (httpx).

Kept separate from the retriever so the chat route only concerns itself with
orchestration. Model is configured through OPENROUTER_MODEL.
"""
import asyncio

import httpx

from app.config import settings

OPENROUTER_URL = f"{settings.OPENROUTER_BASE_URL.rstrip('/')}/chat/completions"

# Retry transient provider failures (rate limits, 5xx, network blips).
MAX_RETRIES = 3


async def generate_answer(
    system_prompt: str,
    user_content: str,
    max_tokens: int | None = None,
) -> str:
    """Call the OpenRouter chat-completions endpoint and return the text."""
    payload = {
        "model": settings.OPENROUTER_MODEL,
        "max_tokens": max_tokens or settings.CHAT_MAX_TOKENS,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
    }
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60) as client:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = await client.post(
                    OPENROUTER_URL, json=payload, headers=headers
                )
                if response.status_code in (429, 500, 502, 503, 504) and attempt < MAX_RETRIES:
                    await asyncio.sleep(0.5 * attempt)
                    continue
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"].strip()
            except (httpx.ConnectError, httpx.ReadTimeout, httpx.RemoteProtocolError):
                if attempt == MAX_RETRIES:
                    raise
                await asyncio.sleep(0.5 * attempt)
