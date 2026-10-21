@echo off
REM Dokan - Quick Start Script for Windows
REM This script helps you get started quickly

echo.
echo 🚀 Dokan Inventory Management System
echo ======================================
echo.

REM Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo    Visit: https://www.docker.com/get-started
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    if exist env.example (
        copy env.example .env >nul
        echo ✅ .env file created. Please review and update if needed.
    ) else (
        echo ⚠️  env.example not found. Creating basic .env file...
        (
            echo NODE_ENV=development
            echo PORT=3040
            echo POSTGRES_USER=dokan_user
            echo POSTGRES_PASSWORD=dokan_password
            echo POSTGRES_DB=dokan_db
            echo DATABASE_URL=postgresql://dokan_user:dokan_password@postgres:5432/dokan_db
        ) > .env
    )
)

echo.
echo 🐳 Starting Docker containers...
echo.

REM Start containers
docker-compose up -d

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to start containers.
    pause
    exit /b 1
)

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 5 /nobreak >nul

echo.
echo ✅ Containers are running!
echo.
echo 📊 Service Status:
docker-compose ps
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📍 Services:
echo    • Application:  http://localhost:3040
echo    • Health Check: http://localhost:3040/health
echo    • API:          http://localhost:3040/api/v1
echo    • pgAdmin:      http://localhost:5050
echo.
echo 🔐 Default Credentials:
echo    • Database User: dokan_user
echo    • Database Pass: dokan_password
echo    • pgAdmin Email: admin@dokan.com
echo    • pgAdmin Pass:  admin
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📋 Useful Commands:
echo    • View logs:      docker-compose logs -f
echo    • Stop services:  docker-compose down
echo    • Restart:        docker-compose restart
echo.
pause

