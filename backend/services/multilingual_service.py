"""
AURA Multilingual Service
Language detection + routing to appropriate NLP models.
Supports: English, Hindi, Tamil, Telugu, Malayalam + auto-detect.
"""

import logging
from typing import Dict, Tuple
from langdetect import detect, detect_langs, LangDetectException

logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = {
    "en": {"name": "English",   "native": "English",    "flag": "🇬🇧"},
    "hi": {"name": "Hindi",     "native": "हिन्दी",      "flag": "🇮🇳"},
    "ta": {"name": "Tamil",     "native": "தமிழ்",       "flag": "🇮🇳"},
    "te": {"name": "Telugu",    "native": "తెలుగు",      "flag": "🇮🇳"},
    "ml": {"name": "Malayalam", "native": "മലയാളം",     "flag": "🇮🇳"},
    "fr": {"name": "French",    "native": "Français",   "flag": "🇫🇷"},
    "de": {"name": "German",    "native": "Deutsch",    "flag": "🇩🇪"},
    "es": {"name": "Spanish",   "native": "Español",    "flag": "🇪🇸"},
    "zh": {"name": "Chinese",   "native": "中文",        "flag": "🇨🇳"},
    "ar": {"name": "Arabic",    "native": "العربية",    "flag": "🇸🇦"},
}

# Empathetic response templates per emotion per language
RESPONSE_TEMPLATES = {
    "en": {
        "sadness":  [
            "I can hear the weight in your words, and I want you to know — you're not alone in this. 💙",
            "What you're feeling is real and valid. It's okay to not be okay sometimes.",
            "I'm here with you in this moment. Would you like to talk more about what's on your mind?",
        ],
        "anger":    [
            "Your feelings are completely valid. It sounds like something really frustrated you.",
            "I understand — sometimes things feel overwhelming and unfair. What happened?",
            "I hear you. It's okay to feel angry. Let's explore this together.",
        ],
        "fear":     [
            "It's brave of you to share what's frightening you. You're safe here.",
            "Fear can feel overwhelming, but you've faced challenges before. I believe in you.",
            "Let's breathe through this together. What's worrying you most right now?",
        ],
        "joy":      [
            "That's wonderful! Your happiness is genuinely contagious — tell me more! ✨",
            "I love seeing you in such high spirits! What's making you feel so great?",
            "This is amazing! Cherish this feeling — you deserve every bit of it. 🌟",
        ],
        "neutral":  [
            "I'm listening. Tell me more about what's on your mind.",
            "I'm here for you. What would you like to talk about today?",
            "How are you really doing? I'm all ears.",
        ],
        "disgust":  [
            "That sounds really unpleasant. It's natural to feel that way.",
            "I understand — some situations can feel genuinely revolting. You're valid.",
            "Let's talk through what's bothering you. I'm here.",
        ],
        "surprise": [
            "Oh wow, that does sound unexpected! How are you processing that?",
            "Life can throw some real curveballs. How are you feeling about this surprise?",
            "That's quite a turn of events! Tell me more.",
        ],
    },
    "hi": {
        "sadness":  [
            "मैं समझता/समझती हूं कि आप अभी कठिन समय से गुज़र रहे हैं। आप अकेले नहीं हैं। 💙",
            "मुझे खेद है कि आप ऐसा महसूस कर रहे हैं। मैं आपके साथ हूँ।",
            "कभी-कभी चीज़ें भारी लग सकती हैं, लेकिन याद रखें कि यह समय भी बीत जाएगा।"
        ],
        "anger":    [
            "आपकी भावनाएं बिल्कुल सही हैं। कभी-कभी चीज़ें बहुत निराशाजनक हो जाती हैं।",
            "आपका गुस्सा स्वाभाविक है। क्या आप बताना चाहेंगे कि ऐसा क्यों हुआ?",
            "मैं समझ सकता हूँ कि आप कितने क्रोधित हैं। गहरी सांस लें, मैं सुन रहा हूँ।"
        ],
        "fear":     [
            "डर महसूस करना स्वाभाविक है। आप यहां सुरक्षित हैं। साथ मिलकर इसका सामना करें।",
            "यह डरावना लग सकता है, लेकिन आप इससे मजबूत हैं।",
            "घबराहट होना आम बात है। क्या कोई खास बात आपको परेशान कर रही है?"
        ],
        "joy":      [
            "यह सुनकर बहुत खुशी हुई! आपकी खुशी संक्रामक है! ✨",
            "क्या बात है! आपकी सफलता और खुशी जानकर बहुत अच्छा लगा। 🌟",
            "बहुत बढ़िया! ऐसे ही मुस्कुराते रहें।"
        ],
        "neutral":  [
            "मैं सुन रहा/रही हूं। आप क्या बात करना चाहते हैं?",
            "आपका दिन कैसा चल रहा है?",
            "मैं यहाँ हूँ। आप जो भी साझा करना चाहें, कर सकते हैं।"
        ],
        "disgust":  [
            "यह वाकई अप्रिय लगता है। आपकी भावनाएं मान्य हैं।",
            "ऐसी स्थिति से निपटना मुश्किल हो सकता है।",
            "मैं समझ सकता हूँ कि आपको यह कितना बुरा लगा होगा।"
        ],
        "surprise": [
            "यह तो अप्रत्याशित है! आप इसे कैसे महसूस कर रहे हैं?",
            "ओह! यह वाकई चौंकाने वाला है।",
            "क्या आप इस नई स्थिति के बारे में और बताना चाहेंगे?"
        ],
    },
    "ta": {
        "sadness":  ["நீங்கள் தனியாக இல்லை. உங்கள் உணர்வுகள் உண்மையானவை. 💙"],
        "anger":    ["உங்கள் கோபம் புரிகிறது. சில நேரங்களில் விஷயங்கள் மிகவும் கஷ்டமாக இருக்கும்."],
        "fear":     ["பயம் இயல்பானது. நீங்கள் இங்கே பாதுகாப்பாக இருக்கிறீர்கள்."],
        "joy":      ["அருமை! உங்கள் மகிழ்ச்சி தொற்றுகிறது! ✨"],
        "neutral":  ["நான் கேட்கிறேன். என்ன பேச விரும்புகிறீர்கள்?"],
        "disgust":  ["இது மிகவும் விரும்பத்தகாதது. உங்கள் உணர்வுகள் செல்லுபடியாகும்."],
        "surprise": ["இது எதிர்பாராதது! நீங்கள் எப்படி உணர்கிறீர்கள்?"],
    },
    "te": {
        "sadness":  ["మీరు ఒంటరిగా లేరు. మీ భావాలు నిజమైనవి. 💙"],
        "anger":    ["మీ కోపం అర్థమవుతుంది. కొన్నిసార్లు విషయాలు చాలా నిరాశగా ఉంటాయి."],
        "fear":     ["భయం సహజం. మీరు ఇక్కడ సురక్షితంగా ఉన్నారు."],
        "joy":      ["అద్భుతం! మీ సంతోషం అంటువ్యాధి లాంటిది! ✨"],
        "neutral":  ["నేను వింటున్నాను. మీరు ఏమి మాట్లాడాలనుకుంటున్నారు?"],
        "disgust":  ["ఇది చాలా అసహ్యంగా అనిపిస్తోంది. మీ భావాలు చెల్లుబాటు అవుతాయి."],
        "surprise": ["ఇది ఆశ్చర్యంగా ఉంది! మీరు ఎలా భావిస్తున్నారు?"],
    },
    "ml": {
        "sadness":  ["നിങ്ങൾ ഒറ്റയ്ക്കല്ല. നിങ്ങളുടെ വികാരങ്ങൾ യഥാർത്ഥമാണ്. 💙"],
        "anger":    ["നിങ്ങളുടെ ദേഷ്യം മനസ്സിലാകുന്നു. ചിലപ്പോൾ കാര്യങ്ങൾ വളരെ നിരാശാജനകമാകാം."],
        "fear":     ["ഭയം സ്വാഭാവികമാണ്. നിങ്ങൾ ഇവിടെ സുരക്ഷിതരാണ്."],
        "joy":      ["അത്ഭുതം! നിങ്ങളുടെ സന്തോഷം പകർച്ചവ്യാധി പോലെ! ✨"],
        "neutral":  ["ഞാൻ കേൾക്കുന്നു. നിങ്ങൾ എന്ത് സംസാരിക്കാൻ ആഗ്രഹിക്കുന്നു?"],
        "disgust":  ["ഇത് വളരെ അസുഖകരമാണ്. നിങ്ങളുടെ വികാരങ്ങൾ സാധുവാണ്."],
        "surprise": ["ഇത് അപ്രതീക്ഷിതമാണ്! നിങ്ങൾ എങ്ങനെ അനുഭവിക്കുന്നു?"],
    },
}


def detect_language(text: str) -> Tuple[str, float]:
    """Detect language of input text. Returns (lang_code, confidence)."""
    try:
        langs = detect_langs(text)
        if langs:
            best = langs[0]
            lang_code = best.lang
            confidence = round(best.prob, 4)
            # Map detected code to supported; fallback to 'en'
            if lang_code not in SUPPORTED_LANGUAGES:
                lang_code = "en"
            return lang_code, confidence
    except LangDetectException:
        pass
    return "en", 1.0


def get_language_info(lang_code: str) -> Dict:
    """Get metadata for a language code."""
    return SUPPORTED_LANGUAGES.get(lang_code, SUPPORTED_LANGUAGES["en"])


def get_empathetic_response(emotion: str, language: str, index: int = 0) -> str:
    """Get a language-appropriate empathetic response for an emotion."""
    lang_templates = RESPONSE_TEMPLATES.get(language, RESPONSE_TEMPLATES["en"])
    emotion_responses = lang_templates.get(emotion, lang_templates.get("neutral", ["I'm here for you."]))
    return emotion_responses[index % len(emotion_responses)]
