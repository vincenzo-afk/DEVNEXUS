"""
DevNexus – Auth & Rate-Limiting Middleware
Verifies GitHub OAuth tokens, injects user state, and enforces per-user rate limits via Redis.
"""

from __future__ import annotations

import logging
import time
from typing import Optional

import httpx
import redis.asyncio as aioredis
from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

from config import settings

logger = logging.getLogger("devnexus.auth")

GITHUB_API_BASE = "https://api.github.com"

# Routes that don't require auth
_PUBLIC_PATHS: set[str] = {
    "/health",
    "/",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/github/trending",
}

# ---------------------------------------------------------------------------
# Redis singleton (lazy)
# ---------------------------------------------------------------------------

_redis_client: Optional[aioredis.Redis] = None


async def _get_redis() -> Optional[aioredis.Redis]:
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
            )
            await _redis_client.ping()
        except Exception as exc:
            logger.warning("Redis unavailable, rate limiting disabled: %s", exc)
            _redis_client = None
    return _redis_client


# ---------------------------------------------------------------------------
# Token verification
# ---------------------------------------------------------------------------


async def _verify_github_token(token: str) -> Optional[dict]:
    """
    Call GitHub /user with the supplied token.
    Returns user dict on success, None on failure.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{GITHUB_API_BASE}/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github.v3+json",
                },
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception as exc:
        logger.warning("GitHub token verification error: %s", exc)
    return None


# ---------------------------------------------------------------------------
# Rate limiting helper
# ---------------------------------------------------------------------------


async def _check_rate_limit(user_id: str) -> bool:
    """
    Sliding window rate limit: RATE_LIMIT_REQUESTS per RATE_LIMIT_WINDOW_SECONDS.
    Returns True if request is allowed, False if rate-limited.
    """
    redis = await _get_redis()
    if redis is None:
        return True  # fail-open when Redis is unavailable

    key = f"rl:{user_id}"
    now = time.time()
    window = settings.RATE_LIMIT_WINDOW_SECONDS
    limit = settings.RATE_LIMIT_REQUESTS

    try:
        pipe = redis.pipeline()
        pipe.zremrangebyscore(key, 0, now - window)
        pipe.zadd(key, {str(now): now})
        pipe.zcard(key)
        pipe.expire(key, window)
        results = await pipe.execute()
        count = results[2]
        return count <= limit
    except Exception as exc:
        logger.warning("Rate limit check failed: %s", exc)
        return True  # fail-open


# ---------------------------------------------------------------------------
# Middleware class
# ---------------------------------------------------------------------------


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Starlette middleware that:
    1. Skips public paths
    2. Extracts Bearer token from Authorization header
    3. Verifies it against GitHub API
    4. Injects github user dict into request.state
    5. Enforces per-user rate limits
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        # Always allow OPTIONS (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)

        # Skip auth for public paths
        if request.url.path in _PUBLIC_PATHS:
            request.state.user = None
            request.state.github_token = None
            return await call_next(request)

        # Extract token
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "error": "unauthorized",
                    "message": "Authorization header with Bearer token is required.",
                },
            )

        token = auth_header[len("Bearer "):]

        # Check Redis cache for already-verified tokens
        redis = await _get_redis()
        cached_user = None
        cache_key = f"auth:{token[:16]}"  # use prefix as cache key

        if redis:
            try:
                import json
                cached = await redis.get(cache_key)
                if cached:
                    cached_user = json.loads(cached)
            except Exception:
                pass

        if cached_user is None:
            github_user = await _verify_github_token(token)
            if github_user is None:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={
                        "error": "invalid_token",
                        "message": "GitHub token is invalid or expired.",
                    },
                )
            cached_user = {
                "id": str(github_user.get("id")),
                "login": github_user.get("login"),
                "name": github_user.get("name"),
                "avatar_url": github_user.get("avatar_url"),
                "email": github_user.get("email"),
            }
            if redis:
                try:
                    import json
                    await redis.set(cache_key, json.dumps(cached_user), ex=300)
                except Exception:
                    pass

        # Rate limit check
        user_id = cached_user["id"]
        allowed = await _check_rate_limit(user_id)
        if not allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "rate_limited",
                    "message": (
                        f"Too many requests. Limit: {settings.RATE_LIMIT_REQUESTS} "
                        f"per {settings.RATE_LIMIT_WINDOW_SECONDS}s."
                    ),
                },
                headers={
                    "Retry-After": str(settings.RATE_LIMIT_WINDOW_SECONDS),
                    "X-RateLimit-Limit": str(settings.RATE_LIMIT_REQUESTS),
                },
            )

        # Inject into request state
        request.state.user = cached_user
        request.state.github_token = token

        response = await call_next(request)
        response.headers["X-User-ID"] = user_id
        return response


# ---------------------------------------------------------------------------
# Dependency helpers
# ---------------------------------------------------------------------------


def get_current_user(request: Request) -> dict:
    """FastAPI dependency to extract the authenticated user from request state."""
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    return user


def get_github_token(request: Request) -> str:
    """FastAPI dependency to extract the GitHub token from request state."""
    token = getattr(request.state, "github_token", None)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="GitHub token required.",
        )
    return token
