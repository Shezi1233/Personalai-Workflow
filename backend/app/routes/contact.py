"""POST /api/contact — save a contact-form submission with rate limiting."""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.contact import ContactMessage
from app.schemas import ContactCreate, ContactResponse

router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("", response_model=ContactResponse, status_code=201)
async def create_contact(
    payload: ContactCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> ContactMessage:
    # Per-IP rate limit (e.g. 5 messages / minute) to deter spam.
    limiter = request.app.state.limiter
    if limiter is not None:
        limiter.check_rate_limit("contact_submit", request)

    message = ContactMessage(
        name=payload.name.strip(),
        email=payload.email,
        message=payload.message.strip(),
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)

    # Rebuild a plain response (ContactResponse doesn't include created_at).
    return ContactResponse(
        id=message.id,
        name=message.name,
        email=message.email,
        message=message.message,
    )


@router.get("", response_model=list[ContactResponse])
async def list_contacts(db: AsyncSession = Depends(get_db)) -> list[ContactMessage]:
    """Return recent submissions (dev convenience — remove before deploying)."""
    result = await db.execute(
        select(ContactMessage).order_by(ContactMessage.created_at.desc()).limit(50)
    )
    return list(result.scalars().all())
