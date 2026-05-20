"""
AURA Chat Service
Manages conversation memory (SQLite), language detection,
emotion-aware empathetic AI response generation, and session history.
"""

import json
import logging
import random
from datetime import datetime
from typing import Dict, List, Optional

import aiosqlite

from services.emotion_service import emotion_service
from services.multilingual_service import (
    detect_language,
    get_empathetic_response,
    get_language_info,
)

logger = logging.getLogger(__name__)

DB_PATH = "aura.db"

# Extended wellness follow-up prompts by emotion
FOLLOW_UP_PROMPTS = {
    "sadness":  ["Would you like to try a gentle breathing exercise?", "Sometimes journaling helps — want a prompt?"],
    "anger":    ["Want to try a quick grounding technique?", "A short breathing exercise might help calm things down."],
    "fear":     ["Would a calming meditation help right now?", "Let's try the 5-4-3-2-1 grounding technique together."],
    "joy":      ["That's fantastic! What made this moment special?", "I'd love to hear more about what's going well!"],
    "neutral":  ["Is there anything specific on your mind today?", "How has your week been going overall?"],
    "disgust":  ["Let's talk through what's bothering you.", "Would it help to reframe this situation together?"],
    "surprise": ["How are you adjusting to this?", "Unexpected things can be exciting or stressful — which is it for you?"],
}


async def save_message(
    session_id: str,
    role: str,
    content: str,
    language: str,
    emotion_label: Optional[str] = None,
    emotion_confidence: Optional[float] = None,
    emotion_scores: Optional[Dict] = None,
):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO conversations
               (session_id, role, content, language, timestamp, emotion_label, emotion_confidence, emotion_scores)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                session_id, role, content, language,
                datetime.utcnow().isoformat(),
                emotion_label, emotion_confidence,
                json.dumps(emotion_scores) if emotion_scores else None,
            )
        )
        await db.commit()


async def get_session_history(session_id: str, limit: int = 20) -> List[Dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT role, content, language, timestamp, emotion_label, emotion_confidence
               FROM conversations WHERE session_id = ?
               ORDER BY timestamp DESC LIMIT ?""",
            (session_id, limit)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in reversed(rows)]


async def get_all_sessions() -> List[Dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT DISTINCT session_id,
               MIN(timestamp) as started_at,
               MAX(timestamp) as last_active,
               COUNT(*) as message_count
               FROM conversations GROUP BY session_id ORDER BY last_active DESC"""
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def process_chat_message(
    session_id: str,
    user_message: str,
    language_override: Optional[str] = None,
) -> Dict:
    """
    Full chat pipeline:
    1. Detect language
    2. Analyze emotion via DistilRoBERTa
    3. Generate empathetic AI response
    4. Persist to SQLite
    5. Return structured response
    """
    # Step 1: Language detection
    if language_override and language_override != "auto":
        language = language_override
        lang_confidence = 1.0
    else:
        language, lang_confidence = detect_language(user_message)

    lang_info = get_language_info(language)

    # Step 2: Emotion analysis
    emotion_result = emotion_service.analyze_emotion(user_message, language)
    primary_emotion = emotion_result["primary_emotion"]
    confidence = emotion_result["confidence"]

    # Step 3: Generate empathetic response
    # Use a random response index to ensure variety
    history = await get_session_history(session_id, limit=10)
    response_index = random.randint(0, 100)

    base_response = get_empathetic_response(primary_emotion, language, response_index)

    # Append contextual follow-up
    follow_ups = FOLLOW_UP_PROMPTS.get(primary_emotion, FOLLOW_UP_PROMPTS["neutral"])
    if len(history) > 1 and random.random() > 0.4:
        follow_up = random.choice(follow_ups)
        ai_response = f"{base_response}\n\n{follow_up}"
    else:
        ai_response = base_response

    # Add language acknowledgment for non-English
    if language != "en" and lang_info:
        lang_name = lang_info.get("name", language)
        ai_response = f"[{lang_name} detected] " + ai_response

    # Step 4: Save user message + assistant response
    await save_message(
        session_id, "user", user_message, language,
        primary_emotion, confidence, emotion_result["scores"]
    )
    await save_message(
        session_id, "assistant", ai_response, language,
        None, None, None
    )

    # Step 5: Log emotion
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO emotion_logs
               (session_id, text, language, primary_emotion, confidence, scores, sentiment, sentiment_score, timestamp)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                session_id, user_message, language,
                primary_emotion, confidence,
                json.dumps(emotion_result["scores"]),
                emotion_result.get("sentiment"),
                emotion_result.get("sentiment_score"),
                datetime.utcnow().isoformat(),
            )
        )
        await db.commit()

    return {
        "session_id": session_id,
        "user_message": user_message,
        "ai_response": ai_response,
        "language": language,
        "language_info": lang_info,
        "lang_detection_confidence": lang_confidence,
        "emotion": emotion_result,
        "timestamp": datetime.utcnow().isoformat(),
    }
