#!/bin/bash

# Dokan - Quick Start Script
# This script helps you get started quickly

set -e

echo "🚀 Dokan Inventory Management System"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://www.docker.com/get-started"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    if [ -f env.example ]; then
        cp env.example .env
        echo "✅ .env file created. Please review and update if needed."
    else
        echo "⚠️  env.example not found. Creating basic .env file..."
        cat > .env << EOF
NODE_ENV=development
PORT=3040
POSTGRES_USER=dokan_user
POSTGRES_PASSWORD=dokan_password
POSTGRES_DB=dokan_db
DATABASE_URL=postgresql://dokan_user:dokan_password@postgres:5432/dokan_db
EOF
    fi
fi

echo ""
echo "🐳 Starting Docker containers..."
echo ""

# Start containers
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Containers are running!"
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📍 Services:"
    echo "   • Application:  http://localhost:3040"
    echo "   • Health Check: http://localhost:3040/health"
    echo "   • API:          http://localhost:3040/api/v1"
    echo "   • pgAdmin:      http://localhost:5050"
    echo ""
    echo "🔐 Default Credentials:"
    echo "   • Database User: dokan_user"
    echo "   • Database Pass: dokan_password"
    echo "   • pgAdmin Email: admin@dokan.com"
    echo "   • pgAdmin Pass:  admin"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 Useful Commands:"
    echo "   • View logs:      docker-compose logs -f"
    echo "   • Stop services:  docker-compose down"
    echo "   • Restart:        docker-compose restart"
    echo ""
else
    echo "❌ Failed to start containers. Check logs:"
    echo "   docker-compose logs"
    exit 1
fi

