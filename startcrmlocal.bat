@echo off
setlocal

:: Customize these paths
set BACKEND_DIR=C:\Humble CRM\backend
set FRONTEND_DIR=C:\Humble CRM\frontend

:: Start backend
echo 🚀 Launching FastAPI backend at http://localhost:8000 ...
start "FastAPI Backend" cmd /k "cd /d %BACKEND_DIR% && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: Start frontend
echo 💻 Launching React frontend at http://localhost:5173 ...
start "React Frontend" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"

endlocal
