"""Password hashing + JWT helpers for auth.

bcrypt is used directly (not via passlib) — passlib 1.7.x reads the bcrypt
__about__ module that bcrypt ≥ 4.1 removed, which breaks hashing at runtime.
"""
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt

from app.config import settings


def hash_password(password: str) -> str:
    """Hash a plaintext password (bcrypt, cost factor 12)."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """Constant-time check of a password against its stored hash."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        # Malformed hash (bad salt/encoding) — never treat as a match.
        return False


def create_access_token(subject: int) -> str:
    """Sign a JWT for a user id, expiring after TOKEN_EXPIRE_MINUTES."""
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=settings.TOKEN_EXPIRE_MINUTES
    )
    claims = {"sub": str(subject), "exp": expires}
    return jwt.encode(claims, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
