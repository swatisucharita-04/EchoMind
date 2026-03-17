from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Any


# ─── Common ─────────────────────────────────────────────────
class SuccessResponse(BaseModel):
    success: bool = True
    message: str = "OK"


# ─── Auth / User ────────────────────────────────────────────
class UserUpsertRequest(BaseModel):
    email: EmailStr
    display_name: str | None = None
    avatar_url: str | None = None


class UserResponse(BaseModel):
    id: int
    clerk_user_id: str
    email: str
    display_name: str | None
    avatar_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Mood ────────────────────────────────────────────────────
VALID_MOODS = {"happy", "sad", "stressed", "relaxed", "neutral"}


class MoodAnalysis(BaseModel):
    mood: str
    emotion: str
    confidence: float = Field(ge=0.0, le=1.0)
    mood_score: int = Field(ge=1, le=10)
    reasoning: str


class MoodEntryResponse(BaseModel):
    id: int
    mood: str
    emotion: str
    confidence: float
    mood_score: int
    source_message: str | None
    ai_insight: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Chat ────────────────────────────────────────────────────
class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str | None = None


class ChatMessageResponse(BaseModel):
    reply: str
    mood_analysis: MoodAnalysis
    session_id: str
    message_id: int


class ConversationResponse(BaseModel):
    id: int
    session_id: str
    title: str | None
    created_at: datetime
    message_count: int = 0

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    mood: str | None
    mood_score: int | None
    has_audio: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Journal ─────────────────────────────────────────────────
class JournalCreateRequest(BaseModel):
    title: str | None = Field(None, max_length=255)
    content: str = Field(..., min_length=1, max_length=10000)


class JournalUpdateRequest(BaseModel):
    title: str | None = Field(None, max_length=255)
    content: str | None = Field(None, min_length=1, max_length=10000)


class JournalEntryResponse(BaseModel):
    id: int
    title: str | None
    content: str
    mood: str | None
    mood_score: int | None
    word_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Analytics ───────────────────────────────────────────────
class WeeklyTrendPoint(BaseModel):
    date: str
    avg_score: float
    entry_count: int


class MoodDistribution(BaseModel):
    happy: int = 0
    sad: int = 0
    stressed: int = 0
    relaxed: int = 0
    neutral: int = 0


class AnalyticsStats(BaseModel):
    positive_days_pct: float
    avg_mood_score: float
    total_entries: int
    meditation_streak: int
    journal_streak: int


class AnalyticsResponse(BaseModel):
    weekly_trend: list[WeeklyTrendPoint]
    mood_distribution: MoodDistribution
    stats: AnalyticsStats
    ai_insight: str


# ─── Music ──────────────────────────────────────────────────
class MusicResponse(BaseModel):
    success: bool
    embed_url: str
    playlist_name: str
    mood: str


# ─── TTS ────────────────────────────────────────────────────
class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)
    voice_id: str | None = None


class TTSResponse(BaseModel):
    success: bool
    audio_url: str
