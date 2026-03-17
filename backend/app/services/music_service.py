"""
Spotify Service
- Client credentials flow (no user OAuth needed for embed)
- Token cached in memory with TTL
- Mood → curated search query mapping
"""
import base64
import time
import random
import httpx
from loguru import logger

from app.config import get_settings
from app.core.exceptions import AIServiceError

settings = get_settings()

MOOD_QUERIES: dict[str, list[str]] = {
    "happy":   ["upbeat feel-good happy pop", "positive energy morning playlist", "joyful indie pop"],
    "sad":     ["soothing melancholic acoustic", "comforting sad songs", "gentle healing music"],
    "stressed":["stress relief calm focus", "meditation relaxation music", "peaceful ambient chill"],
    "relaxed": ["lofi chill study beats", "relaxing evening jazz", "peaceful acoustic guitar"],
    "neutral": ["focus background instrumental", "indie chill ambient", "light background music"],
}


class SpotifyService:
    def __init__(self):
        self._token: str | None = None
        self._token_expiry: float = 0.0

    async def _get_token(self) -> str:
        """Get a valid Spotify client-credentials token, refreshing if expired."""
        if self._token and time.time() < self._token_expiry - 60:
            return self._token

        b64 = base64.b64encode(
            f"{settings.SPOTIFY_CLIENT_ID}:{settings.SPOTIFY_CLIENT_SECRET}".encode()
        ).decode()

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                "https://accounts.spotify.com/api/token",
                headers={"Authorization": f"Basic {b64}"},
                data={"grant_type": "client_credentials"},
            )

        if resp.status_code != 200:
            raise AIServiceError("Spotify", f"Token request failed: {resp.text[:200]}")

        data = resp.json()
        self._token = data["access_token"]
        self._token_expiry = time.time() + data.get("expires_in", 3600)
        return self._token

    async def get_playlist_for_mood(self, mood: str) -> dict:
        """
        Search Spotify for a playlist matching the mood.
        Returns { embed_url, playlist_name, mood }
        """
        queries = MOOD_QUERIES.get(mood, MOOD_QUERIES["neutral"])
        query = random.choice(queries)

        token = await self._get_token()
        headers = {"Authorization": f"Bearer {token}"}

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://api.spotify.com/v1/search",
                headers=headers,
                params={"q": query, "type": "playlist", "limit": 10},
            )

        if resp.status_code != 200:
            raise AIServiceError("Spotify", f"Search failed: {resp.text[:200]}")

        items = [i for i in resp.json().get("playlists", {}).get("items", []) if i and "id" in i]
        if not items:
            raise AIServiceError("Spotify", f"No playlists found for mood '{mood}'")

        playlist = random.choice(items[:5])
        return {
            "embed_url": f"https://open.spotify.com/embed/playlist/{playlist['id']}",
            "playlist_name": playlist.get("name", "EchoMind Playlist"),
            "mood": mood,
        }


spotify_service = SpotifyService()
