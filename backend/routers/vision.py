import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.vision_service import vision_service

logger = logging.getLogger(__name__)

router = APIRouter()

class FrameRequest(BaseModel):
    image: str  # Base64 encoded image string

@router.post("/emotion")
async def analyze_facial_emotion(request: FrameRequest):
    """
    Analyze facial expressions in a base64 encoded image and return 
    the dominant emotion, scores, and associated AURA UI metadata.
    """
    try:
        result = vision_service.analyze_frame(request.image)
        return result
    except Exception as e:
        logger.error(f"Vision analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process image frame.")
