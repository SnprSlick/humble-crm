@echo off
setlocal

:: Navigate to backend
cd /d "%~dp0backend"

:: Activate Python virtual environment
call venv\Scripts\activate

:: Start FastAPI backend with Railway env
start "Backend" cmd /k "railway run uvicorn app.main:app --reload"

:: Wait a moment to avoid race condition
timeout /t 2 >nul

:: Navigate to frontend
cd /d "%~dp0frontend"

:: Start React frontend
start "Frontend" cmd /k "npm run dev"

endlocal
