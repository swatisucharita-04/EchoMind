"""
Murf TTS Service
- SHA-256 deduplication: same text+voice = cached file, no re-generation
- Async HTTP (httpx)
- Audio saved to static/audio/
"""
import hashlib
import os
import httpx
from loguru import logger

from app.config import get_settings
from app.core.exceptions import AIServiceError

settings = get_settings()
AUDIO_DIR = "static/audio"


class TTSService:
    def __init__(self):
        self.api_key = settings.MURF_API_KEY
        self.default_voice = settings.MURF_VOICE_ID
        self.url = "https://api.murf.ai/v1/speech/generate"

    def _cache_key(self, text: str, voice_id: str) -> str:
        return hashlib.sha256(f"{voice_id}:{text}".encode()).hexdigest()

    def _cached_path(self, cache_key: str) -> str:
        return os.path.join(AUDIO_DIR, f"{cache_key}.mp3")

    async def generate_speech(self, text: str, voice_id: str | None = None) -> str:
        """
        Generate speech for text. Returns a URL path like /static/audio/xxx.mp3
        Uses SHA-256 deduplication — identical text+voice returns cached file.
        """
        voice = voice_id or self.default_voice
        cache_key = self._cache_key(text, voice)
        cached_path = self._cached_path(cache_key)

        # Return cached file if it exists
        if os.path.exists(cached_path):
            logger.debug(f"TTS cache hit: {cache_key[:12]}…")
            return f"/static/audio/{cache_key}.mp3"

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Step 1: Request audio generation from Murf
                resp = await client.post(
                    self.url,
                    json={"text": text, "voice_id": voice, "format": "MP3"},
                    headers={"Content-Type": "application/json", "api-key": self.api_key},
                )
                if resp.status_code != 200:
                    raise AIServiceError("Murf", f"Generation failed: {resp.text[:200]}")

                audio_url = resp.json().get("audioFile")
                if not audio_url:
                    raise AIServiceError("Murf", "No audioFile in response")

                # Step 2: Download the audio file
                audio_resp = await client.get(audio_url)
                if audio_resp.status_code != 200:
                    raise AIServiceError("Murf", "Failed to download audio file")

            # Step 3: Save to disk
            os.makedirs(AUDIO_DIR, exist_ok=True)
            with open(cached_path, "wb") as f:
                f.write(audio_resp.content)

            logger.info(f"TTS generated and cached: {cache_key[:12]}…")
            return f"/static/audio/{cache_key}.mp3"

        except AIServiceError:
            raise
        except Exception as e:
            logger.exception(f"TTS generation error: {e}")
            raise AIServiceError("Murf", str(e))


tts_service = TTSService()
