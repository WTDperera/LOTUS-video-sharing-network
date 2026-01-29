@echo off
echo ========================================
echo   LOTUS VIDEO PLATFORM - QUICK START
echo ========================================
echo.

REM Check if MongoDB is running
echo [1/4] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB is running
) else (
    echo ⚠️  MongoDB is not running
    echo    Please start MongoDB first:
    echo    - Open a new terminal
    echo    - Run: mongod
    echo.
    pause
    exit /b 1
)

echo.
echo [2/4] Seeding database with demo data...
call node scripts\seed.js
if errorlevel 1 (
    echo ❌ Database seeding failed
    pause
    exit /b 1
)

echo.
echo [3/4] Starting backend server...
start "Lotus Backend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Starting frontend...
start "Lotus Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   🎉 LOTUS VIDEO PLATFORM STARTED!
echo ========================================
echo.
echo 📺 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:5000
echo.
echo 🔐 Demo Account:
echo    Email:    john@example.com
echo    Password: password123
echo.
echo Two terminal windows should open:
echo - Backend Server (port 5000)
echo - Frontend Dev Server (port 5173)
echo.
echo To stop: Close both terminal windows or press Ctrl+C
echo ========================================
echo.
pause
