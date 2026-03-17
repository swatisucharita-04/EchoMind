"""
music.py — Spotify playlist endpoint.
Returns a graceful fallback embed when Spotify credentials are missing/invalid
instead of crashing with a 502 that blocks the whole page.
"""
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from app.core.auth import CurrentUser
from app.services.music_service import spotify_service
from loguru import logger

router = APIRouter(prefix="/music")

# Curated public Spotify playlist IDs (fallbacks, no auth needed to embed)
FALLBACK_PLAYLISTS = {
    "happy":    "37i9dQZF1DXdPec7aLTmlC",  # Happy Hits
    "sad":      "37i9dQZF1DX7gIoKXt0gmx",  # Sad Songs
    "stressed": "37i9dQZF1DWXe9gFZP0gtP",  # Anti-Anxiety
    "relaxed":  "37i9dQZF1DX4sWSpwq3LiO",  # Peaceful Meditation
    "neutral":  "37i9dQZF1DX4WYpdgoIcn6",  # Chill Hits
}


@router.get("/")
async def get_playlist(
    current_user: CurrentUser,
    mood: str = Query(..., pattern="^(happy|sad|stressed|relaxed|neutral)$"),
):
    try:
        result = await spotify_service.get_playlist_for_mood(mood)
        return {"success": True, **result}
    except Exception as e:
        logger.warning(f"Spotify API failed for mood={mood}: {e} — using fallback")
        playlist_id = FALLBACK_PLAYLISTS.get(mood, FALLBACK_PLAYLISTS["neutral"])
        return {
            "success": True,
            "embed_url": f"https://open.spotify.com/embed/playlist/{playlist_id}",
            "playlist_name": f"{mood.capitalize()} Playlist",
            "mood": mood,
        }
