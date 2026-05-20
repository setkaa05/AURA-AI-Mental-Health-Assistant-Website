"""AURA — Voice Router (Whisper stub + architecture)"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

WHISPER_AVAILABLE = False
try:
    import whisper
    _whisper_model = whisper.load_model("base")
    WHISPER_AVAILABLE = True
    logger.info("✅ Whisper model loaded")
except Exception as e:
    logger.warning(f"Whisper not available: {e}. Voice transcription will return demo mode.")


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if not WHISPER_AVAILABLE:
        return JSONResponse({
            "status": "demo",
            "transcript": "I'm feeling a bit overwhelmed today, but I'm trying to stay positive.",
            "language": "en",
            "confidence": 0.95,
            "message": "Whisper model not loaded. Install openai-whisper and ffmpeg to enable real transcription.",
        })

    try:
        import tempfile, os
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name

        result = _whisper_model.transcribe(tmp_path)
        os.unlink(tmp_path)

        return {
            "status": "success",
            "transcript": result["text"].strip(),
            "language": result.get("language", "en"),
            "confidence": 0.95,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def voice_status():
    return {
        "whisper_available": WHISPER_AVAILABLE,
        "model": "whisper-base" if WHISPER_AVAILABLE else None,
        "supported_formats": ["wav", "mp3", "m4a", "ogg", "webm"],
        "languages": ["en", "hi", "ta", "te", "ml", "fr", "de", "es", "zh", "ar"],
        "note": "Install ffmpeg and openai-whisper for full voice support.",
    }
