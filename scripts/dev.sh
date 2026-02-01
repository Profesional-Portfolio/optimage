#!/bin/bash

echo "🚀 Starting App in Development Mode"
echo "================================================"

# Check if .env.dev exists
if [ ! -f .env.dev ]; then
    echo "❌ Error: .env.dev file not found!"
    echo "   Please copy .env.dev from the template and update with your credentials."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

# Build and start the development environment

echo "📦 Building and starting development containers..."
echo "   - Application will run with hot reload enabled"
echo ""

# Start development environment
docker compose --env-file .env.dev -f compose.dev.yml up --build

echo ""
echo "🎉 Development environment started!"
echo ""
echo "To stop the environment, press Ctrl+C or run: docker compose down"