// ─── Auth ─────────────────────────────────────────────────
export interface AppUser {
  id: number
  clerk_user_id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

// ─── Mood ─────────────────────────────────────────────────
export type MoodLabel = 'happy' | 'sad' | 'stressed' | 'relaxed' | 'neutral'

export interface MoodAnalysis {
  mood: MoodLabel
  emotion: string
  confidence: number
  mood_score: number
  reasoning: string
}

export interface MoodEntry {
  id: number
  mood: MoodLabel
  emotion: string
  confidence: number
  mood_score: number
  source_message: string | null
  ai_insight: string | null
  created_at: string
}

// ─── Chat ─────────────────────────────────────────────────
export interface ChatMessage {
  id: string            // local UUID for React key
  role: 'user' | 'assistant'
  content: string
  mood?: MoodLabel
  mood_score?: number
  has_audio?: boolean
  audio_url?: string
  created_at: string
}

export interface Conversation {
  id: number
  session_id: string
  title: string | null
  created_at: string
  message_count: number
}

export interface ChatResponse {
  reply: string
  mood_analysis: MoodAnalysis
  session_id: string
  message_id: number
}

// ─── Journal ─────────────────────────────────────────────
export interface JournalEntry {
  id: number
  title: string | null
  content: string
  mood: MoodLabel | null
  mood_score: number | null
  word_count: number
  created_at: string
  updated_at: string
}

// ─── Analytics ───────────────────────────────────────────
export interface WeeklyTrendPoint {
  date: string
  avg_score: number
  entry_count: number
}

export interface MoodDistribution {
  happy: number
  sad: number
  stressed: number
  relaxed: number
  neutral: number
}

export interface AnalyticsStats {
  positive_days_pct: number
  avg_mood_score: number
  total_entries: number
  meditation_streak: number
  journal_streak: number
}

export interface AnalyticsDashboard {
  weekly_trend: WeeklyTrendPoint[]
  mood_distribution: MoodDistribution
  stats: AnalyticsStats
  ai_insight: string
}

// ─── Music ───────────────────────────────────────────────
export interface MusicPlaylist {
  success: boolean
  embed_url: string
  playlist_name: string
  mood: string
}

// ─── WebSocket ──────────────────────────────────────────
export type WSMessageType = 'message' | 'typing' | 'error'

export interface WSServerMessage {
  type: WSMessageType
  data: {
    reply?: string
    mood?: MoodLabel
    mood_score?: number
    emotion?: string
    session_id?: string
    message_id?: number
    message?: string    // error message
  }
}
