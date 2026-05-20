"""AURA — Emotion Analysis Router"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.emotion_service import emotion_service
from services.multilingual_service import detect_language
import aiosqlite, json
from datetime import datetime

router = APIRouter()


class EmotionRequest(BaseModel):
    text: str
    language: Optional[str] = "auto"


class BatchEmotionRequest(BaseModel):
    texts: List[str]


@router.post("/analyze")
async def analyze_emotion(req: EmotionRequest):
    try:
        lang = req.language if req.language != "auto" else detect_language(req.text)[0]
        result = emotion_service.analyze_emotion(req.text, lang)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch")
async def batch_analyze(req: BatchEmotionRequest):
    try:
        results = emotion_service.batch_analyze(req.texts)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/similarity")
async def text_similarity(req: BatchEmotionRequest):
    if len(req.texts) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 texts")
    score = emotion_service.emotion_similarity(req.texts[0], req.texts[1])
    return {"text1": req.texts[0], "text2": req.texts[1], "cosine_similarity": score}


@router.get("/history")
async def emotion_history(session_id: Optional[str] = None, limit: int = 100):
    async with aiosqlite.connect("aura.db") as db:
        db.row_factory = aiosqlite.Row
        if session_id:
            cursor = await db.execute(
                "SELECT * FROM emotion_logs WHERE session_id=? ORDER BY timestamp DESC LIMIT ?",
                (session_id, limit)
            )
        else:
            cursor = await db.execute(
                "SELECT * FROM emotion_logs ORDER BY timestamp DESC LIMIT ?", (limit,)
            )
        rows = await cursor.fetchall()
        records = []
        for row in rows:
            r = dict(row)
            r["scores"] = json.loads(r["scores"]) if r["scores"] else {}
            records.append(r)
        return {"records": records, "count": len(records)}


@router.get("/trajectory")
async def emotion_trajectory(session_id: Optional[str] = None, limit: int = 20):
    async with aiosqlite.connect("aura.db") as db:
        db.row_factory = aiosqlite.Row
        query = "SELECT * FROM emotion_logs ORDER BY timestamp DESC LIMIT ?"
        params = [limit]
        if session_id:
            query = "SELECT * FROM emotion_logs WHERE session_id=? ORDER BY timestamp DESC LIMIT ?"
            params = [session_id, limit]
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        history = []
        for row in rows:
            r = dict(row)
            r["scores"] = json.loads(r["scores"]) if r["scores"] else {}
            history.append(r)
    trajectory = emotion_service.get_emotion_trajectory(list(reversed(history)))
    return {"trajectory": trajectory, "data_points": len(history)}
