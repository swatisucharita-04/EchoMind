"""
Clerk JWT verification for FastAPI.

Clerk issues RS256 JWTs. We fetch the JWKS from Clerk's endpoint,
verify the token signature, and extract the user's Clerk user_id (sub claim).
"""
from typing import Annotated
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from jose.backends import RSAKey
import json

from app.config import get_settings
from loguru import logger

settings = get_settings()
bearer_scheme = HTTPBearer()

# Simple in-memory JWKS cache (refreshed on decode failure)
_jwks_cache: dict | None = None


async def _fetch_jwks() -> dict:
    global _jwks_cache
    async with httpx.AsyncClient() as client:
        resp = await client.get(settings.CLERK_JWKS_URL)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        return _jwks_cache


async def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache is None:
        return await _fetch_jwks()
    return _jwks_cache


def _get_rsa_key(jwks: dict, kid: str) -> dict | None:
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return key
    return None


async def verify_clerk_token(token: str) -> dict:
    """Verify a Clerk-issued JWT and return its claims."""
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token header: {e}")

    kid = unverified_header.get("kid")
    jwks = await _get_jwks()
    rsa_key = _get_rsa_key(jwks, kid)

    # Retry once with fresh JWKS if key not found (key rotation)
    if rsa_key is None:
        jwks = await _fetch_jwks()
        rsa_key = _get_rsa_key(jwks, kid)

    if rsa_key is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unable to find matching signing key")

    try:
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            options={"verify_aud": False},  # Clerk tokens don't always include aud
        )
        return payload
    except JWTError as e:
        logger.warning(f"JWT decode failed: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token verification failed")


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)]
) -> dict:
    """FastAPI dependency — returns the verified Clerk JWT payload."""
    payload = await verify_clerk_token(credentials.credentials)
    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing sub claim")
    return {"clerk_user_id": clerk_user_id, "payload": payload}


# Type alias for cleaner route signatures
CurrentUser = Annotated[dict, Depends(get_current_user)]
