"""
AURA — FastAPI Main Application Entry Point
Loads NLP models on startup, configures CORS, mounts all routers.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import chat, emotion, analytics, research, voice, wellness, vision

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("aura")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: initialize DB and pre-load NLP models."""
    logger.info("AURA Backend starting...")
    await init_db()

    # Pre-load emotion model on startup to avoid cold-start delay
    logger.info("Loading NLP models into memory (this may take a moment)…")
    try:
        from services.emotion_service import emotion_service
        emotion_service._load_emotion_model()
        emotion_service._load_sentiment_model()
        logger.info("All NLP models loaded and ready")
    except Exception as e:
        logger.warning(f"Model pre-load skipped: {e} — models will lazy-load on first request")

    # Pre-load LLM (TinyLlama) — runs in background, non-blocking on failure
    try:
        import threading
        from services.llm_service import llm_service
        thread = threading.Thread(target=llm_service.initialize, daemon=True)
        thread.start()
        logger.info("LLM (TinyLlama) loading in background thread…")
    except Exception as e:
        logger.warning(f"LLM pre-load skipped: {e} — will use fallback responses")

    yield
    logger.info("AURA Backend shutting down.")


app = FastAPI(
    title="AURA — AI Mental Health Platform",
    description="Cinematic AI emotional intelligence platform with transformer-based NLP",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(chat.router,      prefix="/api/chat",      tags=["Chat"])
app.include_router(emotion.router,   prefix="/api/emotion",   tags=["Emotion"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(research.router,  prefix="/api/research",  tags=["Research"])
app.include_router(voice.router,     prefix="/api/voice",     tags=["Voice"])
app.include_router(wellness.router,  prefix="/api/wellness",  tags=["Wellness"])
app.include_router(vision.router,    prefix="/api/vision",    tags=["Vision"])

@app.get("/api/health")
async def health():
    return {
        "status": "online",
        "service": "AURA Backend",
        "version": "1.0.0",
        "models": ["j-hartmann/emotion-english-distilroberta-base", "cardiffnlp/twitter-xlm-roberta-base-sentiment"],
    }
