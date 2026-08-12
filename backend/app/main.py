"""FastAPI application entry point.

Run locally:
    uvicorn app.main:app --reload
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, init_db
from app.rate_limit import RateLimiter
from app.routes import auth, chat, contact, voice


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup.
    await init_db()
    yield
    await engine.dispose()


app = FastAPI(title="Malik Shahzad Portfolio API", version="0.1.0", lifespan=lifespan)

# Rate limiter lives on app.state so routes can reach it without imports.
app.state.limiter = RateLimiter(limit=5, window=60)  # 5 req / min / IP for contact

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(auth.router)
app.include_router(contact.router)
app.include_router(chat.router)
app.include_router(voice.router)


@app.get("/api/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "malik-shahzad-api"}
