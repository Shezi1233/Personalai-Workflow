"""Async SQLAlchemy engine/session + table creation.

Simple approach for now: create tables on startup. Swap for Alembic
migrations once the schema stabilizes.
"""
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


class Base(DeclarativeBase):
    """Declarative base shared by all ORM models."""


def _async_url(url: str) -> str:
    """Coerce a plain postgres URL to use the asyncpg driver.

    asyncpg doesn't accept the `sslmode` query param that Neon connection
    strings carry (it uses the `ssl` connect arg instead), so we strip it.
    asyncpg negotiates SSL automatically for remote hosts.
    """
    from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

    if not (url.startswith("postgresql://") or url.startswith("postgres://")):
        raise ValueError("DATABASE_URL must be a postgres:// or postgresql:// URL")

    parts = urlsplit(url)
    query = [
        (k, v)
        for k, v in parse_qsl(parts.query, keep_blank_values=True)
        if k != "sslmode"
    ]
    scheme = "postgresql+asyncpg"  # force the asyncpg driver
    clean = urlunsplit(
        (scheme, parts.netloc, parts.path, urlencode(query), parts.fragment)
    )
    return clean


engine = create_async_engine(_async_url(settings.DATABASE_URL), pool_pre_ping=True)

SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    """FastAPI dependency that yields a database session per request."""
    async with SessionLocal() as session:
        yield session


async def init_db() -> None:
    """Create all tables. Runs once at app startup."""
    from app import models  # noqa: F401  (registers every model with Base)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
