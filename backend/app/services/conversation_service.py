import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timedelta

from app.models.models import Conversation, Message, MoodEntry
from app.schemas.schemas import MoodAnalysis


class ConversationService:
    async def get_or_create_conversation(
        self, db: AsyncSession, user_id: int, session_id: str | None
    ) -> Conversation:
        if session_id:
            result = await db.execute(
                select(Conversation).where(
                    Conversation.session_id == session_id,
                    Conversation.user_id == user_id,
                )
            )
            conv = result.scalar_one_or_none()
            if conv:
                return conv

        conv = Conversation(
            user_id=user_id,
            session_id=session_id or uuid.uuid4().hex,
        )
        db.add(conv)
        await db.flush()
        return conv

    async def add_message(
        self,
        db: AsyncSession,
        conversation_id: int,
        role: str,
        content: str,
        mood: str | None = None,
        mood_score: int | None = None,
    ) -> Message:
        msg = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            mood=mood,
            mood_score=mood_score,
        )
        db.add(msg)
        await db.flush()
        return msg

    async def get_history(
        self, db: AsyncSession, conversation_id: int, limit: int = 10
    ) -> list[dict]:
        result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(desc(Message.created_at))
            .limit(limit)
        )
        messages = list(reversed(result.scalars().all()))
        return [{"role": m.role, "content": m.content} for m in messages]


class MoodService:
    async def record_mood(
        self,
        db: AsyncSession,
        user_id: int,
        analysis: MoodAnalysis,
        source_message: str | None = None,
        ai_insight: str | None = None,
    ) -> MoodEntry:
        entry = MoodEntry(
            user_id=user_id,
            mood=analysis.mood,
            emotion=analysis.emotion,
            confidence=analysis.confidence,
            mood_score=analysis.mood_score,
            source_message=source_message[:500] if source_message else None,
            ai_insight=ai_insight,
        )
        db.add(entry)
        await db.flush()
        return entry

    async def get_weekly_trend(self, db: AsyncSession, user_id: int) -> list[dict]:
        """Return daily average mood score for the last 7 days."""
        since = datetime.utcnow() - timedelta(days=7)
        result = await db.execute(
            select(
                func.date(MoodEntry.created_at).label("date"),
                func.avg(MoodEntry.mood_score).label("avg_score"),
                func.count(MoodEntry.id).label("entry_count"),
            )
            .where(MoodEntry.user_id == user_id, MoodEntry.created_at >= since)
            .group_by(func.date(MoodEntry.created_at))
            .order_by(func.date(MoodEntry.created_at))
        )
        return [
            {"date": str(row.date), "avg_score": round(float(row.avg_score), 1), "entry_count": row.entry_count}
            for row in result
        ]

    async def get_mood_distribution(self, db: AsyncSession, user_id: int) -> dict:
        since = datetime.utcnow() - timedelta(days=30)
        result = await db.execute(
            select(MoodEntry.mood, func.count(MoodEntry.id).label("cnt"))
            .where(MoodEntry.user_id == user_id, MoodEntry.created_at >= since)
            .group_by(MoodEntry.mood)
        )
        dist = {"happy": 0, "sad": 0, "stressed": 0, "relaxed": 0, "neutral": 0}
        for row in result:
            if row.mood in dist:
                dist[row.mood] = row.cnt
        return dist

    async def get_recent_entries(self, db: AsyncSession, user_id: int, limit: int = 20) -> list[MoodEntry]:
        result = await db.execute(
            select(MoodEntry)
            .where(MoodEntry.user_id == user_id)
            .order_by(desc(MoodEntry.created_at))
            .limit(limit)
        )
        return list(result.scalars().all())


conversation_service = ConversationService()
mood_service = MoodService()
