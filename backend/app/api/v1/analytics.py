"""
analytics.py — Dashboard analytics
GET /api/v1/analytics/dashboard
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from collections import Counter

from app.core.auth import CurrentUser
from app.db.base import get_db
from app.schemas.schemas import AnalyticsResponse, AnalyticsStats, MoodDistribution, WeeklyTrendPoint
from app.services.user_service import user_service
from app.services.conversation_service import mood_service
from app.services.ai_service import ai_service

router = APIRouter(prefix="/analytics")


@router.get("/dashboard", response_model=AnalyticsResponse)
async def get_dashboard(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.require_user(db, current_user["clerk_user_id"])

    # Fetch all analytics data concurrently
    import asyncio
    weekly_trend_raw, mood_dist_raw, recent_entries = await asyncio.gather(
        mood_service.get_weekly_trend(db, user.id),
        mood_service.get_mood_distribution(db, user.id),
        mood_service.get_recent_entries(db, user.id, limit=30),
    )

    # Weekly trend
    weekly_trend = [WeeklyTrendPoint(**row) for row in weekly_trend_raw]

    # Mood distribution
    mood_distribution = MoodDistribution(**mood_dist_raw)

    # Stats
    total = sum(mood_dist_raw.values())
    positive_count = mood_dist_raw.get("happy", 0) + mood_dist_raw.get("relaxed", 0)
    positive_pct = round((positive_count / total * 100), 1) if total > 0 else 0.0

    all_scores = [e.mood_score for e in recent_entries]
    avg_score = round(sum(all_scores) / len(all_scores), 1) if all_scores else 0.0

    stats = AnalyticsStats(
        positive_days_pct=positive_pct,
        avg_mood_score=avg_score,
        total_entries=total,
        meditation_streak=0,   # extend when meditation feature added
        journal_streak=0,
    )

    # AI-generated weekly summary
    dominant_mood = Counter(e.mood for e in recent_entries).most_common(1)
    dominant = dominant_mood[0][0] if dominant_mood else "neutral"
    entries_data = [{"mood": e.mood, "mood_score": e.mood_score} for e in recent_entries]
    ai_insight = await ai_service.generate_weekly_summary(entries_data, dominant)

    return AnalyticsResponse(
        weekly_trend=weekly_trend,
        mood_distribution=mood_distribution,
        stats=stats,
        ai_insight=ai_insight,
    )
