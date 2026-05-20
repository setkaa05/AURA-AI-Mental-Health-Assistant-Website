"""
AURA Emotion Service — Deep NLP Engine
Uses DistilRoBERTa for multi-class emotion detection (7 emotions)
and XLM-RoBERTa for multilingual sentiment analysis.

Models:
  - j-hartmann/emotion-english-distilroberta-base  (English emotion, 7 classes)
  - cardiffnlp/twitter-xlm-roberta-base-sentiment   (Multilingual sentiment)
  - sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (embeddings)
"""

import json
import time
import logging
from typing import Dict, List, Optional
from datetime import datetime

import torch
import numpy as np
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

# ── Emotion label mapping ─────────────────────────────────────────────────────
EMOTION_LABELS = ["anger", "disgust", "fear", "joy", "neutral", "sadness", "surprise"]

EMOTION_META = {
    "anger":    {"color": "#ef4444", "glow": "#ff000055", "intensity": "high",   "valence": -1},
    "disgust":  {"color": "#a855f7", "glow": "#a855f755", "intensity": "medium", "valence": -1},
    "fear":     {"color": "#f97316", "glow": "#f9731655", "intensity": "high",   "valence": -1},
    "joy":      {"color": "#22c55e", "glow": "#22c55e55", "intensity": "high",   "valence":  1},
    "neutral":  {"color": "#64748b", "glow": "#64748b55", "intensity": "low",    "valence":  0},
    "sadness":  {"color": "#3b82f6", "glow": "#3b82f655", "intensity": "medium", "valence": -1},
    "surprise": {"color": "#eab308", "glow": "#eab30855", "intensity": "medium", "valence":  0},
}

AMBIENT_THEMES = {
    "anger":    {"bg": "#1a0505", "accent": "#ef4444", "particle": "fast-sharp"},
    "disgust":  {"bg": "#0f0a1a", "accent": "#a855f7", "particle": "slow-swirl"},
    "fear":     {"bg": "#0f0f0a", "accent": "#f97316", "particle": "erratic"},
    "joy":      {"bg": "#051a0a", "accent": "#22c55e", "particle": "fast-float"},
    "neutral":  {"bg": "#0a0a0f", "accent": "#7c3aed", "particle": "drift"},
    "sadness":  {"bg": "#05080f", "accent": "#3b82f6", "particle": "slow-fall"},
    "surprise": {"bg": "#0f0f05", "accent": "#eab308", "particle": "burst"},
}


class EmotionService:
    """
    Core NLP emotion detection engine using transformer-based models.
    Lazy-loads models on first use to reduce startup time.
    """

    def __init__(self):
        self._emotion_pipeline = None
        self._sentiment_pipeline = None
        self._embedder = None
        self._device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"EmotionService initialized — device: {self._device}")

    # ── Model Loading ─────────────────────────────────────────────────────────

    def _load_emotion_model(self):
        if self._emotion_pipeline is None:
            logger.info("Loading DistilRoBERTa emotion model…")
            self._emotion_pipeline = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                top_k=None,          # Return all class scores
                device=0 if self._device == "cuda" else -1,
                truncation=True,
                max_length=512,
            )
            logger.info("✅ Emotion model loaded")

    def _load_sentiment_model(self):
        if self._sentiment_pipeline is None:
            logger.info("Loading XLM-RoBERTa multilingual sentiment model…")
            self._sentiment_pipeline = pipeline(
                "text-classification",
                model="cardiffnlp/twitter-xlm-roberta-base-sentiment",
                top_k=None,
                device=0 if self._device == "cuda" else -1,
                truncation=True,
                max_length=512,
            )
            logger.info("✅ Multilingual sentiment model loaded")

    def _load_embedder(self):
        if self._embedder is None:
            logger.info("Loading multilingual sentence embedder…")
            self._embedder = SentenceTransformer(
                "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
            )
            logger.info("✅ Sentence embedder loaded")

    # ── Core Analysis ─────────────────────────────────────────────────────────

    def analyze_emotion(self, text: str, language: str = "en") -> Dict:
        """
        Full emotion analysis pipeline.
        Returns emotion scores, sentiment, ambient theme, and metadata.
        """
        start_time = time.time()

        # Run emotion classification
        self._load_emotion_model()
        raw_scores = self._emotion_pipeline(text)[0]

        # Normalize to dict {label: score}
        scores = {item["label"].lower(): round(float(item["score"]), 4) for item in raw_scores}

        # Ensure all 7 labels present (fill missing with 0)
        for label in EMOTION_LABELS:
            scores.setdefault(label, 0.0)

        # Dominant emotion
        primary_emotion = max(scores, key=scores.get)
        confidence = scores[primary_emotion]

        # Sentiment analysis (multilingual)
        self._load_sentiment_model()
        sentiment_raw = self._sentiment_pipeline(text)[0]
        sentiment_map = {s["label"].lower(): s["score"] for s in sentiment_raw}

        # Map sentiment labels (model uses Positive/Negative/Neutral)
        sentiment_label = max(sentiment_map, key=sentiment_map.get)
        sentiment_score = sentiment_map[sentiment_label]

        # Compute valence score (-1 to +1)
        pos = sentiment_map.get("positive", 0)
        neg = sentiment_map.get("negative", 0)
        valence = round(pos - neg, 4)

        # Arousal score (proxy: anger+fear+surprise = high arousal)
        arousal = round(
            scores.get("anger", 0) * 0.9 +
            scores.get("fear", 0) * 0.85 +
            scores.get("surprise", 0) * 0.7 +
            scores.get("joy", 0) * 0.6 -
            scores.get("sadness", 0) * 0.3 -
            scores.get("neutral", 0) * 0.5,
            4
        )

        inference_time = round((time.time() - start_time) * 1000, 2)  # ms

        return {
            "primary_emotion": primary_emotion,
            "confidence": confidence,
            "scores": scores,
            "sentiment": sentiment_label,
            "sentiment_score": round(sentiment_score, 4),
            "valence": valence,
            "arousal": arousal,
            "ambient_theme": AMBIENT_THEMES.get(primary_emotion, AMBIENT_THEMES["neutral"]),
            "emotion_meta": EMOTION_META.get(primary_emotion, {}),
            "inference_time_ms": inference_time,
            "model": "j-hartmann/emotion-english-distilroberta-base",
            "device": self._device,
            "timestamp": datetime.utcnow().isoformat(),
        }

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Get multilingual sentence embeddings for semantic similarity."""
        self._load_embedder()
        embeddings = self._embedder.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()

    def emotion_similarity(self, text1: str, text2: str) -> float:
        """Cosine similarity between two texts' embeddings."""
        self._load_embedder()
        embs = self._embedder.encode([text1, text2], convert_to_numpy=True)
        cos_sim = float(np.dot(embs[0], embs[1]) / (np.linalg.norm(embs[0]) * np.linalg.norm(embs[1])))
        return round(cos_sim, 4)

    def batch_analyze(self, texts: List[str]) -> List[Dict]:
        """Batch emotion analysis for analytics dashboard."""
        self._load_emotion_model()
        results = []
        for text in texts:
            try:
                result = self.analyze_emotion(text)
                results.append(result)
            except Exception as e:
                logger.error(f"Batch analysis error: {e}")
                results.append({"error": str(e), "primary_emotion": "neutral", "confidence": 0.0})
        return results

    def get_emotion_trajectory(self, emotion_history: List[Dict]) -> Dict:
        """
        Compute emotional trajectory from a list of emotion records.
        Returns trend direction, volatility, and dominant emotion over period.
        """
        if not emotion_history:
            return {"trajectory": "stable", "volatility": 0.0, "dominant": "neutral"}

        scores_over_time = [h.get("scores", {}) for h in emotion_history]
        emotions = EMOTION_LABELS

        # Compute mean scores per emotion
        mean_scores = {}
        for emotion in emotions:
            vals = [s.get(emotion, 0) for s in scores_over_time]
            mean_scores[emotion] = round(np.mean(vals), 4)

        dominant = max(mean_scores, key=mean_scores.get)

        # Volatility: std dev of primary emotion confidence
        confidences = [h.get("confidence", 0) for h in emotion_history]
        volatility = round(float(np.std(confidences)), 4)

        # Trend: compare first half vs second half
        mid = len(emotion_history) // 2
        first_half_valence = np.mean([
            EMOTION_META.get(h.get("primary_emotion", "neutral"), {}).get("valence", 0)
            for h in emotion_history[:mid]
        ]) if mid > 0 else 0
        second_half_valence = np.mean([
            EMOTION_META.get(h.get("primary_emotion", "neutral"), {}).get("valence", 0)
            for h in emotion_history[mid:]
        ]) if mid > 0 else 0

        delta = second_half_valence - first_half_valence
        if delta > 0.15:
            trajectory = "improving"
        elif delta < -0.15:
            trajectory = "declining"
        else:
            trajectory = "stable"

        return {
            "trajectory": trajectory,
            "volatility": volatility,
            "dominant": dominant,
            "mean_scores": mean_scores,
            "valence_delta": round(float(delta), 4),
        }


# Singleton instance
emotion_service = EmotionService()
