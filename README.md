# AURA — Cinematic AI Mental Health Platform

> A world-class, locally-running AI emotional intelligence platform powered by transformer-based NLP, Three.js visualizations, and a cinematic React UI.

---

## 🚀 Quick Start (Windows)

### 1. Double-click `start.bat`
That's it. The script will:
- Create a Python virtual environment
- Install all Python dependencies
- Start the FastAPI backend on **http://localhost:8000**
- Install Node.js dependencies
- Start the Vite frontend on **http://localhost:5173**

---

## 📦 Manual Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🏗️ Architecture

```
Browser (React + Three.js)
    │
    ▼ HTTP / Proxy
FastAPI Backend (Python)
    │
    ├── Emotion Service (DistilRoBERTa)
    ├── Sentiment Service (XLM-RoBERTa)
    ├── Chat Service (conversation memory)
    ├── Wellness Engine (rule-based)
    └── SQLite Database (local file)
```

---

## 🧠 NLP Models

| Model | Task | Params | Accuracy |
|-------|------|--------|----------|
| j-hartmann/emotion-english-distilroberta-base | Emotion (7 classes) | 82M | 93.4% |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | Multilingual Sentiment | 278M | 88.7% |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | Embeddings | 118M | — |
| openai/whisper-base | Speech-to-Text | 74M | WER ~4.2% |

> **Note:** Models download automatically on first run (~1.5 GB total). They are cached locally at `~/.cache/huggingface/`.

---

## 📄 Pages

| Route | Description |
|-------|-------------|
| `/` | Cinematic landing page with Three.js orb |
| `/chat` | Multilingual AI chat with emotion detection |
| `/dashboard` | Emotion analytics, radar chart, mood timeline |
| `/research` | NLP model benchmarks, confusion matrix, loss curves |
| `/voice` | Whisper speech-to-text + emotion detection |
| `/wellness` | Breathing exercises, journaling prompts, meditation |
| `/profile` | Emotional fingerprint and session stats |
| `/settings` | Language, visual intensity, model config |
| `/about` | Architecture, model cards, research methodology |

---

## 🎨 Tech Stack

**Frontend:** React 18 · Vite · TypeScript · Tailwind CSS · Framer Motion · Three.js (R3F) · Zustand · Recharts

**Backend:** FastAPI · Python 3.10+ · aiosqlite

**AI/NLP:** HuggingFace Transformers · Sentence Transformers · OpenAI Whisper · langdetect

**Database:** SQLite (local file: `backend/aura.db`)

---

## 🔐 Privacy

AURA runs **100% locally**. No data is sent to any external server. All NLP inference happens on your machine using locally cached HuggingFace models.

---

## ⚙️ Requirements

- Python 3.10+
- Node.js 18+
- ~4 GB RAM (8 GB recommended for smooth model loading)
- ~2 GB disk space (for model cache)
- GPU optional (CUDA accelerates inference 3-10×)
