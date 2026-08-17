@echo off

start "Backend (Express / Node.js)" powershell -NoExit -Command "cd backend; npm run dev"
start "Frontend (Next.js / React)" powershell -NoExit -Command "cd frontend; npm run dev"

echo MERN AI Resume Analyzer started!