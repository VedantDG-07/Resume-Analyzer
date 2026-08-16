@echo off

start "Backend" powershell -NoExit -Command "cd backend;  .\venv\Scripts\python.exe -m uvicorn main:app --reload"
start "Frontend" powershell -NoExit -Command "cd frontend; npm run dev"

echo Project started!