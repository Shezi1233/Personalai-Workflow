"""Voice agent placeholder — structure is ready, implementation comes later."""
from fastapi import APIRouter

from app.schemas import VoiceStatus

router = APIRouter(prefix="/api/voice", tags=["voice"])


@router.get("/status", response_model=VoiceStatus)
async def voice_status() -> VoiceStatus:
    """Placeholder endpoint so the voice agent's route exists."""
    return VoiceStatus(status="coming soon")
