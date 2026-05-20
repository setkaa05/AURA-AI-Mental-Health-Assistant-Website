"""AURA — Chat Router"""

import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.chat_service import process_chat_message, get_session_history, get_all_sessions

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: Optional[str] = "auto"


class ChatResponse(BaseModel):
    session_id: str
    user_message: str
    ai_response: str
    language: str
    language_info: dict
    lang_detection_confidence: float
    emotion: dict
    timestamp: str


@router.post("/message", response_model=ChatResponse)
async def send_message(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())
    try:
        result = await process_chat_message(session_id, req.message, req.language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{session_id}")
async def get_history(session_id: str, limit: int = 50):
    history = await get_session_history(session_id, limit)
    return {"session_id": session_id, "messages": history, "count": len(history)}


@router.get("/sessions")
async def list_sessions():
    sessions = await get_all_sessions()
    return {"sessions": sessions, "total": len(sessions)}


@router.delete("/history/{session_id}")
async def clear_history(session_id: str):
    import aiosqlite
    async with aiosqlite.connect("aura.db") as db:
        await db.execute("DELETE FROM conversations WHERE session_id = ?", (session_id,))
        await db.commit()
    return {"status": "cleared", "session_id": session_id}
