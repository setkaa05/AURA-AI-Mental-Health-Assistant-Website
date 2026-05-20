@echo off
title AURA — AI Mental Health Platform
color 0D

echo.
echo  ╔═══════════════════════════════════════╗
echo  ║   AURA — AI Mental Health Platform    ║
echo  ║   Starting local development servers  ║
echo  ╚═══════════════════════════════════════╝
echo.

:: ── Backend Setup ─────────────────────────────────────────────────────────
cd /d "%~dp0backend"

if not exist "venv\Scripts\activate" (
    echo [1/4] Creating Python virtual environment...
    python -m venv venv
)

echo [2/4] Activating virtual environment...
call venv\Scripts\activate

echo [3/4] Installing Python dependencies...
pip install -r requirements.txt --quiet

echo [4/4] Starting FastAPI backend on http://localhost:8000 ...
start "AURA Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

:: Wait for backend to start
ping -n 5 127.0.0.1 >nul

:: ── Frontend Setup ─────────────────────────────────────────────────────────
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [5/5] Installing Node.js dependencies - first run only...
    call npm install
)

echo Starting Vite frontend on http://localhost:5173 ...
start "AURA Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Wait for frontend to start
ping -n 4 127.0.0.1 >nul

:: Open browser
echo.
echo  ✅ AURA is running!
echo  🌐 Open: http://localhost:5173
echo.
start "" "http://localhost:5173"
