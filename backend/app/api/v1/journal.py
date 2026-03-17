"""
journal.py — Journal CRUD routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.auth import CurrentUser
from app.db.base import get_db
from app.models.models import JournalEntry
from app.schemas.schemas import JournalCreateRequest, JournalUpdateRequest, JournalEntryResponse
from app.services.user_service import user_service
from app.services.ai_service import ai_service
from app.services.conversation_service import mood_service

router = APIRouter(prefix="/journal")


@router.get("/", response_model=list[JournalEntryResponse])
async def list_entries(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, le=100),
    offset: int = 0,
):
    user = await user_service.require_user(db, current_user["clerk_user_id"])
    result = await db.execute(
        select(JournalEntry)
        .where(JournalEntry.user_id == user.id)
        .order_by(desc(JournalEntry.created_at))
        .offset(offset).limit(limit)
    )
    return list(result.scalars().all())


@router.post("/", response_model=JournalEntryResponse, status_code=201)
async def create_entry(
    body: JournalCreateRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.require_user(db, current_user["clerk_user_id"])

    # Run mood analysis on journal content
    from app.schemas.schemas import MoodAnalysis
    mood_analysis = await ai_service.classify_mood(body.content[:500])

    entry = JournalEntry(
        user_id=user.id,
        title=body.title,
        content=body.content,
        mood=mood_analysis.mood,
        mood_score=mood_analysis.mood_score,
        word_count=len(body.content.split()),
    )
    db.add(entry)
    await db.flush()

    # Record mood from journal entry
    await mood_service.record_mood(db, user.id, mood_analysis, source_message=body.content[:200])

    return entry


@router.get("/{entry_id}", response_model=JournalEntryResponse)
async def get_entry(
    entry_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.require_user(db, current_user["clerk_user_id"])
    result = await db.execute(
        select(JournalEntry).where(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == user.id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry


@router.patch("/{entry_id}", response_model=JournalEntryResponse)
async def update_entry(
    entry_id: int,
    body: JournalUpdateRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.require_user(db, current_user["clerk_user_id"])
    result = await db.execute(
        select(JournalEntry).where(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == user.id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    if body.title is not None:
        entry.title = body.title
    if body.content is not None:
        entry.content = body.content
        entry.word_count = len(body.content.split())
        mood_analysis = await ai_service.classify_mood(body.content[:500])
        entry.mood = mood_analysis.mood
        entry.mood_score = mood_analysis.mood_score

    return entry


@router.delete("/{entry_id}", status_code=204)
async def delete_entry(
    entry_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.require_user(db, current_user["clerk_user_id"])
    result = await db.execute(
        select(JournalEntry).where(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == user.id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    await db.delete(entry)


@router.get("/{entry_id}/insight")
async def get_ai_insight(
    entry_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Generate an AI insight for a journal entry on demand."""
    user = await user_service.require_user(db, current_user["clerk_user_id"])
    result = await db.execute(
        select(JournalEntry).where(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == user.id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    insight = await ai_service.generate_journal_insight(entry.content)
    return {"insight": insight}
