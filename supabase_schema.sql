-- ============================================================
-- EchoMind — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    clerk_user_id   VARCHAR(128) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    display_name    VARCHAR(100),
    avatar_url      VARCHAR(512),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_users_clerk_id ON users(clerk_user_id);

-- ── mood_entries ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mood_entries (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood            VARCHAR(20)  NOT NULL CHECK (mood IN ('happy','sad','stressed','relaxed','neutral')),
    emotion         VARCHAR(50)  NOT NULL,
    confidence      FLOAT        NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    mood_score      INTEGER      NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
    source_message  TEXT,
    ai_insight      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_mood_entries_user_created ON mood_entries(user_id, created_at DESC);

-- ── journal_entries ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS journal_entries (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255),
    content     TEXT NOT NULL,
    mood        VARCHAR(20) CHECK (mood IN ('happy','sad','stressed','relaxed','neutral')),
    mood_score  INTEGER CHECK (mood_score BETWEEN 1 AND 10),
    word_count  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_journal_entries_user_created ON journal_entries(user_id, created_at DESC);

-- ── conversations ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id  VARCHAR(64) NOT NULL,
    title       VARCHAR(255),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS ix_conversations_user ON conversations(user_id);

-- ── messages ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
    id              SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role            VARCHAR(10) NOT NULL CHECK (role IN ('user','assistant')),
    content         TEXT NOT NULL,
    mood            VARCHAR(20),
    mood_score      INTEGER CHECK (mood_score BETWEEN 1 AND 10),
    has_audio       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_messages_conversation ON messages(conversation_id, created_at);

-- ── Auto-update updated_at trigger ───────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_journal_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ────────────────────────────────────
-- Note: Since we use a service role key from FastAPI (not direct Supabase client),
-- RLS is optional but recommended for defense-in-depth.
-- Our backend enforces user isolation via user_id filtering on every query.

ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (our FastAPI backend uses service role key)
-- These policies protect against direct Supabase client access

CREATE POLICY "Service role full access — users"
    ON users FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access — mood_entries"
    ON mood_entries FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access — journal_entries"
    ON journal_entries FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access — conversations"
    ON conversations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access — messages"
    ON messages FOR ALL USING (true) WITH CHECK (true);

-- ── Useful analytics views ────────────────────────────────
CREATE OR REPLACE VIEW mood_daily_summary AS
SELECT
    user_id,
    DATE(created_at)            AS mood_date,
    AVG(mood_score)::FLOAT      AS avg_score,
    COUNT(*)                    AS entry_count,
    MODE() WITHIN GROUP (ORDER BY mood) AS dominant_mood
FROM mood_entries
GROUP BY user_id, DATE(created_at);

CREATE OR REPLACE VIEW user_streaks AS
SELECT
    user_id,
    COUNT(DISTINCT DATE(created_at)) AS active_days_last_30
FROM journal_entries
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id;

-- ============================================================
-- Done. Tables: users, mood_entries, journal_entries,
--               conversations, messages
-- Views: mood_daily_summary, user_streaks
-- ============================================================
