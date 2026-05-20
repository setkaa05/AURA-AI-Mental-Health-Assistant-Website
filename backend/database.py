"""
AURA — Database Layer
Async SQLite via aiosqlite. Stores conversations, emotion logs, user settings.
"""

import aiosqlite
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "aura.db")


async def get_db():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db


async def init_db():
    """Initialize all database tables."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
                content TEXT NOT NULL,
                language TEXT DEFAULT 'en',
                timestamp TEXT NOT NULL,
                emotion_label TEXT,
                emotion_confidence REAL,
                emotion_scores TEXT  -- JSON blob of all emotion scores
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS emotion_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                text TEXT NOT NULL,
                language TEXT DEFAULT 'en',
                primary_emotion TEXT NOT NULL,
                confidence REAL NOT NULL,
                scores TEXT NOT NULL,  -- JSON blob
                sentiment TEXT,
                sentiment_score REAL,
                timestamp TEXT NOT NULL
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS user_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS wellness_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                emotion TEXT NOT NULL,
                recommendation_type TEXT NOT NULL,
                recommendation_title TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)

        # Seed default settings
        defaults = [
            ("language", "auto", datetime.utcnow().isoformat()),
            ("theme", "dark", datetime.utcnow().isoformat()),
            ("visual_intensity", "high", datetime.utcnow().isoformat()),
            ("voice_enabled", "false", datetime.utcnow().isoformat()),
        ]
        for key, value, ts in defaults:
            await db.execute(
                "INSERT OR IGNORE INTO user_settings (key, value, updated_at) VALUES (?, ?, ?)",
                (key, value, ts)
            )

        await db.commit()
    print("AURA Database initialized at", DB_PATH)
