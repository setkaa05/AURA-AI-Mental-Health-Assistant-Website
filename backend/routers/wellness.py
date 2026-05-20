"""AURA — Wellness Router"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.wellness_service import get_recommendations, get_breathing_exercise, get_journaling_prompt
import aiosqlite
from datetime import datetime

router = APIRouter()


class WellnessRequest(BaseModel):
    emotion: str
    session_id: Optional[str] = None
    limit: int = 3


@router.post("/recommendations")
async def recommendations(req: WellnessRequest):
    result = get_recommendations(req.emotion, req.limit)
    if req.session_id:
        async with aiosqlite.connect("aura.db") as db:
            for rec in result["recommendations"]:
                await db.execute(
                    "INSERT INTO wellness_logs (session_id, emotion, recommendation_type, recommendation_title, timestamp) VALUES (?,?,?,?,?)",
                    (req.session_id, req.emotion, rec["type"], rec["title"], datetime.utcnow().isoformat())
                )
            await db.commit()
    return result


@router.get("/breathing/{emotion}")
async def breathing(emotion: str):
    return get_breathing_exercise(emotion)


@router.get("/journal-prompt/{emotion}")
async def journal_prompt(emotion: str):
    return {"emotion": emotion, "prompt": get_journaling_prompt(emotion)}


@router.get("/history/{session_id}")
async def wellness_history(session_id: str):
    async with aiosqlite.connect("aura.db") as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM wellness_logs WHERE session_id=? ORDER BY timestamp DESC", (session_id,)
        )
        rows = await cursor.fetchall()
    return {"history": [dict(r) for r in rows]}
