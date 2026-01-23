#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Killing existing processes on backend and ML ports..."

# Kill processes on backend port (8000)
BACKEND_PORT=8000
if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Killing process on port $BACKEND_PORT..."
    kill -9 $(lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t) 2>/dev/null
fi

# Kill processes on ML port (3001)
ML_PORT=3001
if lsof -Pi :$ML_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Killing process on port $ML_PORT..."
    kill -9 $(lsof -Pi :$ML_PORT -sTCP:LISTEN -t) 2>/dev/null
fi

# Ensure MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    mkdir -p /tmp/mongodb
    mongod --dbpath /tmp/mongodb --fork --logpath /tmp/mongodb.log
    sleep 2
else
    echo "MongoDB already running"
fi

echo "Starting all services..."

# Frontend
echo "Starting Frontend..."
cd "$SCRIPT_DIR/repurpose-hub" && pnpm run dev &
FRONTEND_PID=$!

# Backend
echo "Starting Backend..."
cd "$SCRIPT_DIR/repurpose-hub-backend" && uvicorn app:app --reload &
BACKEND_PID=$!

# ML Service
echo "Starting ML Service..."
cd "$SCRIPT_DIR/repurpose-ml" && uvicorn app:app --reload --port 3001 &
ML_PID=$!

echo ""
echo "========================================"
echo "All services started!"
echo "========================================"
echo "Frontend PID: $FRONTEND_PID"
echo "Backend PID: $BACKEND_PID"
echo "ML Service PID: $ML_PID"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for all background processes
wait $FRONTEND_PID $BACKEND_PID $ML_PID
