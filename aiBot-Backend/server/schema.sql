-- ============================================================
--  Multi-Bot AI Chat Platform — Database Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    role        VARCHAR(10) NOT NULL DEFAULT 'user'
                CHECK (role IN ('admin', 'user')),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ─── Bots ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bots (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name              VARCHAR(255) NOT NULL,
    personality_prompt TEXT,
    namespace         VARCHAR(255) NOT NULL,
    avatar_color      VARCHAR(30),
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Chat Messages ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bot_id      UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    role        VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    message     TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_user_bot   ON chat_messages (user_id, bot_id);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_messages (created_at);
