#!/bin/bash
# setup.sh - Triage Medical Local Environment Builder

echo "==========================================="
echo "   Starting AI Health Triage Docker Setup"
echo "==========================================="

echo "[1/4] Checking environment configurations..."
if [ ! -f .env ]; then
    echo "Creating generic root .env file for Docker Compose..."
    echo "GEMINI_API_KEY=" > .env
    echo "OPENAI_API_KEY=" >> .env
    echo "Done."
fi

echo "[2/4] Building and spinning up Docker containers..."
if command -v docker-compose &> /dev/null
then
    docker-compose up --build -d
elif command -v docker compose &> /dev/null
then
    docker compose up --build -d
else
    echo "❌ Docker Compose not found. Please install Docker."
    exit 1
fi

echo "[3/4] Waiting 10 seconds for MongoDB to initialize securely..."
sleep 10

echo "[4/4] Applying database migrations and seeding inside backend container..."
docker exec -it triage-backend npm run migrate

echo "==========================================="
echo "✅ Setup Complete!"
echo "• Frontend Dashboard is running at: http://localhost:3000"
echo "• AI / Backend API is running at:   http://localhost:5000"
echo "• MongoDB database mounted at:      localhost:27017"
echo ""
echo "Reminder: Assign GEMINI_API_KEY inside the .env file to activate the AI Medical Analyzer NLP."
echo "==========================================="
