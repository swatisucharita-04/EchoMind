"""
mood.py — Mood tracking routes
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.auth import CurrentUser
from app.db.base import get_db
from app.models.models import MoodEntry
from app.schemas.schemas import MoodEntryResponse
from app.services.user_service import user_service

router = APIRouter(prefix="/mood")


@router.get("/history", response_model=list[MoodEntryResponse])
async def get_mood_history(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(30, le=100),
    offset: int = 0,
):
    user = await user_service.require_user(db, current_user["clerk_user_id"])
    result = await db.execute(
        select(MoodEntry)
        .where(MoodEntry.user_id == user.id)
        .order_by(desc(MoodEntry.created_at))
        .offset(offset).limit(limit)
    )
    return list(result.scalars().all())
