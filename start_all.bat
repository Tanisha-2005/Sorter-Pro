@echo off
echo Starting SorterPro AI Services...

start cmd /k "cd backend && npm start"
start cmd /k "cd frontend && npm run dev"

echo SorterPro AI is now running.
echo Access the command center at: http://localhost:5173
pause
