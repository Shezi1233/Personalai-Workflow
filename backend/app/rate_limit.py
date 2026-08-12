"""Thin wrapper around slowapi so routes can rate-limit without decorators.

We use a manual `check_rate_limit` on the current request rather than the
decorator form, so rate limiting stays visible and easy to tweak per route.
"""
from collections import defaultdict
from threading import Lock
from time import monotonic

from fastapi import HTTPException, Request

DEFAULT_LIMIT = 10
DEFAULT_WINDOW = 60  # seconds


class RateLimiter:
    """Simple in-process sliding-window limiter keyed by (key, request).

    In-process is fine for a single uvicorn worker. For multiple workers /
    production, swap this for a Redis-backed limiter (e.g. slowapi with the
    redis storage backend) — the route call sites stay the same.
    """

    def __init__(self, limit: int = DEFAULT_LIMIT, window: float = DEFAULT_WINDOW):
        self.limit = limit
        self.window = window
        self._hits: dict[tuple[str, str], list[float]] = defaultdict(list)
        self._lock = Lock()

    def check_rate_limit(self, key: str, request: Request) -> None:
        ident = f"{key}:{request.client.host if request.client else 'unknown'}"
        now = monotonic()
        with self._lock:
            stamps = self._hits[ident]
            stamps[:] = [t for t in stamps if now - t < self.window]
            if len(stamps) >= self.limit:
                retry = int(self.window - (now - stamps[0])) + 1
                raise HTTPException(
                    status_code=429,
                    detail=f"Too many requests. Try again in {retry}s.",
                    headers={"Retry-After": str(retry)},
                )
            stamps.append(now)
