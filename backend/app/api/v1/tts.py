"""tts.py"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser
from app.db.base import get_db
from app.schemas.schemas import TTSRequest, TTSResponse
from app.services.tts_service import tts_service

router = APIRouter(prefix="/tts")


@router.post("/", response_model=TTSResponse)
async def generate_tts(
    body: TTSRequest,
    current_user: CurrentUser,
):
    audio_url = await tts_service.generate_speech(body.text, body.voice_id)
    return TTSResponse(success=True, audio_url=audio_url)
