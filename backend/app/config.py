"""Application configuration, loaded from environment variables / backend/.env.

Every setting has a sensible default so the app imports cleanly even before
`.env` exists; real values come from `backend/.env` (git-ignored) or the
process environment.
"""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ (the folder containing this package) — used to resolve .env
# relative to the code rather than the current working directory.
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- PostgreSQL (Neon) ---
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/portfolio"

    # --- Gemini (RAG embeddings) ---
    # https://aistudio.google.com/apikey
    GEMINI_API_KEY: str = ""
    # Gemini embedding model → 3072-dimension vectors. text-embedding-004 is
    # not exposed on all keys; gemini-embedding-2 is a stable 3072-dim model.
    GEMINI_EMBEDDING_MODEL: str = "models/gemini-embedding-2"
    EMBEDDING_DIMENSIONS: int = 3072

    # --- Qdrant (vector database) ---
    # Cloud cluster endpoint + API key (see https://cloud.qdrant.io).
    QDRANT_API_KEY: str = ""
    QDRANT_CLUSTER_ENDPOINT: str = ""
    QDRANT_COLLECTION: str = "portfolio_knowledge"

    # --- OpenRouter (LLM provider for chat answers) ---
    # https://openrouter.ai/settings/keys
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    # Cost-effective default; override with any OpenRouter model slug, e.g.
    # anthropic/claude-sonnet-4.5.
    OPENROUTER_MODEL: str = "google/gemini-2.5-flash"

    # --- CORS ---
    # Comma-separated list of frontend origins allowed to call this API.
    CORS_ORIGINS: str = "http://localhost:3000"

    # --- Auth / JWT ---
    # Long random string used to sign session JWTs. Generate one with:
    #   python -c "import secrets; print(secrets.token_hex(32))"
    SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # --- RAG retrieval ---
    RAG_TOP_K: int = 4

    # --- Chat ---
    CHAT_MAX_TOKENS: int = 1024

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
