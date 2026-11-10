@echo off
title StockFlow Server Launcher
echo ===================================================
echo           Starting StockFlow Full Stack
echo ===================================================

echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "StockFlow Backend (FastAPI)" cmd /k "cd /d ""%~dp0stockflow-master\backend"" && .\venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo [2/3] Starting Next.js Frontend on http://localhost:3000 ...
start "StockFlow Frontend (Next.js)" cmd /k "cd /d ""%~dp0stockflow-master\frontend"" && npm run dev"

echo [3/3] Starting Cloudflare Live Tunnel ...
start "StockFlow Cloudflare Tunnel" cmd /k "cd /d ""%~dp0"" && .\cloudflared.exe tunnel --url http://localhost:3000"

echo ===================================================
echo All services started in dedicated background windows!
echo - Local UI: http://localhost:3000
echo - API Docs: http://127.0.0.1:8000/docs
echo - Public URL: Displayed in the Cloudflare window
echo ===================================================
timeout /t 5
