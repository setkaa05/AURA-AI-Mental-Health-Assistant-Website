import base64
import time
import logging
from typing import Dict
from datetime import datetime
import numpy as np
import cv2

logger = logging.getLogger(__name__)

# Attempt to import DeepFace, allow failure for environments without it
try:
    from deepface import DeepFace
except ImportError:
    logger.warning("DeepFace not installed. Vision service will fail.")

# Map DeepFace emotions to AURA emotions
DEEPFACE_TO_AURA_MAP = {
    "angry": "anger",
    "disgust": "disgust",
    "fear": "fear",
    "happy": "joy",
    "sad": "sadness",
    "surprise": "surprise",
    "neutral": "neutral",
}

# Standard AURA emotions list
EMOTION_LABELS = ["anger", "disgust", "fear", "joy", "neutral", "sadness", "surprise"]

from services.emotion_service import EMOTION_META, AMBIENT_THEMES

class VisionService:
    def __init__(self):
        self._device = "cpu" # DeepFace typically uses CPU by default unless TF-GPU is setup
        logger.info(f"VisionService initialized — device: {self._device}")

    def analyze_frame(self, base64_image: str) -> Dict:
        """
        Analyzes a base64 encoded image frame for facial emotion using DeepFace.
        Returns a dictionary formatted similarly to EmotionService.analyze_emotion.
        """
        start_time = time.time()

        try:
            # 1. Decode base64 to OpenCV image
            if "," in base64_image:
                base64_image = base64_image.split(",")[1]
            
            img_data = base64.b64decode(base64_image)
            np_arr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if img is None:
                raise ValueError("Could not decode image.")

            # 2. Run DeepFace emotion analysis
            # enforce_detection=False so it doesn't crash if no face is perfectly aligned
            result = DeepFace.analyze(
                img_path=img,
                actions=['emotion'],
                enforce_detection=False,
                silent=True
            )
            
            # DeepFace can return a list if multiple faces are detected, we take the first one
            if isinstance(result, list):
                result = result[0]

            deepface_scores = result.get('emotion', {})
            
            # 3. Map DeepFace emotions to AURA emotions
            scores = {}
            for df_emo, val in deepface_scores.items():
                # Convert percentage (0-100) to 0.0 - 1.0 confidence
                aura_emo = DEEPFACE_TO_AURA_MAP.get(df_emo, "neutral")
                scores[aura_emo] = float(round(val / 100.0, 4))
            
            # Fill missing with 0
            for label in EMOTION_LABELS:
                scores.setdefault(label, 0.0)
            
            primary_emotion = max(scores, key=scores.get)
            confidence = float(scores[primary_emotion])

            # 4. Synthesize other metadata (valence, arousal) similarly to text
            # Valence
            valence = EMOTION_META.get(primary_emotion, {}).get("valence", 0)
            
            # Arousal (proxy)
            arousal = float(round(
                scores.get("anger", 0) * 0.9 +
                scores.get("fear", 0) * 0.85 +
                scores.get("surprise", 0) * 0.7 +
                scores.get("joy", 0) * 0.6 -
                scores.get("sadness", 0) * 0.3 -
                scores.get("neutral", 0) * 0.5,
                4
            ))

            inference_time = round((time.time() - start_time) * 1000, 2)

            return {
                "primary_emotion": primary_emotion,
                "confidence": confidence,
                "scores": scores,
                "sentiment": "neutral", # Facial expression doesn't map perfectly to NLP sentiment
                "sentiment_score": 0.0,
                "valence": valence,
                "arousal": arousal,
                "ambient_theme": AMBIENT_THEMES.get(primary_emotion, AMBIENT_THEMES["neutral"]),
                "emotion_meta": EMOTION_META.get(primary_emotion, {}),
                "inference_time_ms": inference_time,
                "model": "deepface-resnet50-emotion",
                "device": self._device,
                "timestamp": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Error in facial emotion analysis: {e}")
            raise e

vision_service = VisionService()
