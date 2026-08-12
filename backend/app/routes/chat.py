"""POST /api/chat — RAG chatbot.

Retrieves the most relevant profile chunks for the visitor's question, hands
them to the OpenRouter LLM with a strict "answer only from context" system
prompt, and logs the turn to the chat_logs table.
"""
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.chat import ChatLog
from app.rag.llm import generate_answer
from app.rag.retriever import retrieve
from app.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/chat", tags=["chat"])


SYSTEM_PROMPT = """You are a helpful AI assistant for Malik Shahzad's portfolio website.
You have access to Malik's complete profile including his skills, experience, education,
projects, and contact information.

Instructions:
1. First, try to answer using Malik's profile context if the question is related to him.
2. If the question is NOT about Malik, you may use your general knowledge to answer naturally.
3. If you're unsure or the context doesn't fully cover the question, politely say you don't
   have that specific information about Malik and suggest they reach out via the contact form.
4. Keep responses conversational and professional, not robotic.
5. Always be helpful - even for general questions, provide a useful response while being
   clear about what you know from Malik's profile vs. general knowledge."""

# When context is limited or unavailable, you may still use your base knowledge to provide
# helpful responses while being transparent about what comes from Malik's profile.


async def _generate_answer(question: str, context_chunks: list[str]) -> str:
    context_block = "\n\n---\n\n".join(context_chunks)
    user_content = (
        f"Context about Malik Shahzad:\n\n{context_block}\n\n"
        f"Visitor question: {question}"
    )
    return await generate_answer(SYSTEM_PROMPT, user_content)


@router.post("", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    try:
        chunks = await retrieve(payload.message)
        if not chunks:
            answer = (
                "I don't have that information yet, but I can tell you about "
                "Malik's skills, projects, experience, or how to contact him."
            )
        else:
            answer = await _generate_answer(
                payload.message, [text for text, _score in chunks]
            )
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (401, 403):
            raise HTTPException(
                status_code=503,
                detail="Chatbot is not configured (missing OPENROUTER_API_KEY).",
            ) from exc
        if exc.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Chatbot is busy. Try again shortly.") from exc
        raise HTTPException(
            status_code=502,
            detail=f"Chatbot provider error: {exc.response.status_code}",
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Chatbot provider is unreachable.") from exc
    except Exception:
        # Embedding / retrieval failures should not leak internals to visitors.
        raise HTTPException(status_code=500, detail="Could not generate an answer.") from None

    session_id = payload.session_id or "anon"

    # Log the turn (best-effort — a logging failure shouldn't fail the request).
    try:
        db.add(
            ChatLog(
                session_id=session_id,
                user_message=payload.message,
                bot_response=answer,
            )
        )
        await db.commit()
    except Exception:
        await db.rollback()

    return ChatResponse(session_id=session_id, answer=answer)
