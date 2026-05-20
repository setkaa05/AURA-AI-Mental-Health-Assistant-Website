"""
AURA Wellness Recommendation Service
Maps detected emotions to structured wellness interventions:
breathing exercises, journaling prompts, meditations, and activities.
"""

import random
from typing import Dict, List

WELLNESS_DB: Dict[str, List[Dict]] = {
    "sadness": [
        {
            "type": "breathing",
            "title": "Box Breathing",
            "description": "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 4 times.",
            "duration_minutes": 4,
            "icon": "🌬️",
            "steps": ["Inhale for 4 counts", "Hold for 4 counts", "Exhale for 4 counts", "Hold for 4 counts"],
        },
        {
            "type": "journaling",
            "title": "Gratitude Journal",
            "description": "Write 3 things you are grateful for today, no matter how small.",
            "duration_minutes": 5,
            "icon": "📔",
            "prompt": "List 3 things — however tiny — that brought you some comfort today.",
        },
        {
            "type": "activity",
            "title": "Gentle Walk",
            "description": "A 10-minute walk in nature can significantly lift your mood.",
            "duration_minutes": 10,
            "icon": "🌿",
        },
        {
            "type": "meditation",
            "title": "Body Scan Meditation",
            "description": "Slowly scan your body from head to toe, releasing tension.",
            "duration_minutes": 8,
            "icon": "🧘",
        },
    ],
    "anger": [
        {
            "type": "breathing",
            "title": "4-7-8 Breathing",
            "description": "Inhale 4s → Hold 7s → Exhale 8s. Powerful for calming anger.",
            "duration_minutes": 3,
            "icon": "🌬️",
            "steps": ["Inhale for 4 counts", "Hold for 7 counts", "Exhale slowly for 8 counts"],
        },
        {
            "type": "journaling",
            "title": "Anger Letter",
            "description": "Write an uncensored letter expressing your anger — then don't send it.",
            "duration_minutes": 10,
            "icon": "✍️",
            "prompt": "Write exactly how you feel without filtering. No one will read this.",
        },
        {
            "type": "activity",
            "title": "Physical Release",
            "description": "Do 20 jumping jacks or push-ups to release physical tension.",
            "duration_minutes": 3,
            "icon": "💪",
        },
        {
            "type": "meditation",
            "title": "Loving-Kindness Meditation",
            "description": "Send compassion to yourself and others to soften anger.",
            "duration_minutes": 7,
            "icon": "💜",
        },
    ],
    "fear": [
        {
            "type": "breathing",
            "title": "Diaphragmatic Breathing",
            "description": "Deep belly breaths activate the parasympathetic nervous system.",
            "duration_minutes": 5,
            "icon": "🌬️",
            "steps": ["Place hand on belly", "Inhale deeply for 6s", "Feel belly rise", "Exhale for 6s"],
        },
        {
            "type": "journaling",
            "title": "Fear Audit",
            "description": "Write what you fear, how likely it is, and what you'd do if it happened.",
            "duration_minutes": 8,
            "icon": "🔍",
            "prompt": "What specifically am I afraid of? How likely is it really? What's my plan if it happens?",
        },
        {
            "type": "activity",
            "title": "5-4-3-2-1 Grounding",
            "description": "Name 5 things you see, 4 you hear, 3 you touch, 2 smell, 1 taste.",
            "duration_minutes": 2,
            "icon": "🌱",
        },
        {
            "type": "meditation",
            "title": "Safe Place Visualization",
            "description": "Close your eyes and vividly imagine your perfect safe space.",
            "duration_minutes": 10,
            "icon": "🏝️",
        },
    ],
    "joy": [
        {
            "type": "journaling",
            "title": "Joy Capture",
            "description": "Document this moment in detail so you can revisit it later.",
            "duration_minutes": 5,
            "icon": "⭐",
            "prompt": "What exactly is making me feel so good? Who is part of this joy?",
        },
        {
            "type": "activity",
            "title": "Share Your Joy",
            "description": "Call or message someone you love and share this positive feeling.",
            "duration_minutes": 5,
            "icon": "📞",
        },
        {
            "type": "meditation",
            "title": "Savoring Meditation",
            "description": "Sit quietly and fully absorb this positive experience.",
            "duration_minutes": 5,
            "icon": "✨",
        },
        {
            "type": "activity",
            "title": "Creative Expression",
            "description": "Channel this energy into drawing, music, or dancing.",
            "duration_minutes": 15,
            "icon": "🎨",
        },
    ],
    "neutral": [
        {
            "type": "breathing",
            "title": "Mindful Breathing",
            "description": "Simply observe your breath for 3 minutes without changing it.",
            "duration_minutes": 3,
            "icon": "🍃",
        },
        {
            "type": "journaling",
            "title": "Stream of Consciousness",
            "description": "Write whatever comes to mind for 5 minutes without stopping.",
            "duration_minutes": 5,
            "icon": "🌊",
            "prompt": "Just write — don't think, don't edit, don't stop for 5 minutes.",
        },
        {
            "type": "meditation",
            "title": "Mindfulness Check-In",
            "description": "Pause and check in with your body, thoughts, and feelings.",
            "duration_minutes": 5,
            "icon": "🧘",
        },
    ],
    "disgust": [
        {
            "type": "breathing",
            "title": "Cleansing Breath",
            "description": "Long exhale to release what doesn't serve you.",
            "duration_minutes": 3,
            "icon": "💨",
            "steps": ["Inhale for 4", "Hold for 2", "Exhale for 8", "Imagine releasing what bothers you"],
        },
        {
            "type": "journaling",
            "title": "Reframing Exercise",
            "description": "Write the situation and then 3 alternative ways to view it.",
            "duration_minutes": 7,
            "icon": "🔄",
            "prompt": "What happened? Now write 3 different ways to interpret this situation.",
        },
    ],
    "surprise": [
        {
            "type": "journaling",
            "title": "Processing Journal",
            "description": "Write your immediate reactions and what this means for you.",
            "duration_minutes": 5,
            "icon": "💡",
            "prompt": "What just happened? How do I feel about it? What does it mean for me?",
        },
        {
            "type": "breathing",
            "title": "Centering Breath",
            "description": "3 deep breaths to ground yourself in the present moment.",
            "duration_minutes": 2,
            "icon": "🌬️",
        },
    ],
}

MOTIVATIONAL_QUOTES = [
    {"quote": "You are braver than you believe, stronger than you seem, and smarter than you think.", "author": "A.A. Milne"},
    {"quote": "The present moment is the only moment available to us, and it is the door to all moments.", "author": "Thich Nhat Hanh"},
    {"quote": "You don't have to control your thoughts. You just have to stop letting them control you.", "author": "Dan Millman"},
    {"quote": "Difficult roads often lead to beautiful destinations.", "author": "Zig Ziglar"},
    {"quote": "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", "author": "Noam Shpancer"},
    {"quote": "Recovery is not one and done. It is a lifelong journey that takes place one day, one step at a time.", "author": "Unknown"},
    {"quote": "Your feelings are valid. Your struggles are real. You are enough.", "author": "AURA"},
]


def get_recommendations(emotion: str, limit: int = 3) -> Dict:
    """Get wellness recommendations for a given emotion."""
    recommendations = WELLNESS_DB.get(emotion, WELLNESS_DB["neutral"])
    selected = random.sample(recommendations, min(limit, len(recommendations)))
    quote = random.choice(MOTIVATIONAL_QUOTES)
    return {
        "emotion": emotion,
        "recommendations": selected,
        "motivational_quote": quote,
        "total_available": len(recommendations),
    }


def get_breathing_exercise(emotion: str) -> Dict:
    """Get the most appropriate breathing exercise for an emotion."""
    recs = WELLNESS_DB.get(emotion, WELLNESS_DB["neutral"])
    breathing = [r for r in recs if r["type"] == "breathing"]
    return breathing[0] if breathing else WELLNESS_DB["neutral"][0]


def get_journaling_prompt(emotion: str) -> str:
    """Get a journaling prompt for the detected emotion."""
    recs = WELLNESS_DB.get(emotion, WELLNESS_DB["neutral"])
    journals = [r for r in recs if r["type"] == "journaling" and "prompt" in r]
    if journals:
        return journals[0]["prompt"]
    return "Write freely about how you're feeling right now."
