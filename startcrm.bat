@echo off
cd /d "C:\Humble CRM\backend"

:: Activate Python virtual environment
call venv\Scripts\activate

:: Start backend
start "Backend" cmd /k uvicorn app.main:app --reload

:: Move to frontend and start React app
cd /d "C:\Humble CRM\frontend"
start "Frontend" cmd /k npm run dev
