@echo off
echo Starting all services simultaneously...

start "Frontend" cmd /k "cd repurpose-hub/ && npm run dev"
timeout /t 2 >nul
start "Backend" cmd /k "cd repurpose-hub-backend/ && uvicorn app:app --reload"
timeout /t 2 >nul
start "ML Service" cmd /k "cd repurpose-ml/ && uvicorn app:app --reload --port 3001"

echo.
echo ========================================
echo All services started in separate windows!
echo ========================================
echo.
echo Press ENTER to close all services...
pause >nul

echo.
echo Closing all services...
taskkill /fi "WindowTitle eq Frontend*" /f >nul 2>&1
taskkill /fi "WindowTitle eq Backend*" /f >nul 2>&1
taskkill /fi "WindowTitle eq ML Service*" /f >nul 2>&1

echo All services closed!
timeout /t 2 >nul
