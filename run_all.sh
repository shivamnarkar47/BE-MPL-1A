#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if we're in the correct environment
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "Activating virtual environment..."
    source "$SCRIPT_DIR/.venv/bin/activate" 2>/dev/null || {
        echo "Warning: No virtual environment found at $SCRIPT_DIR/.venv"
        echo "Please ensure virtual environments are set up for backend and ML services"
    }
fi

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

echo "Starting all services..."

# Frontend
echo "Starting Frontend..."
cd "$SCRIPT_DIR/repurpose-hub" && pnpm run dev &
FRONTEND_PID=$!

# Backend
echo "Starting Backend..."
cd "$SCRIPT_DIR/repurpose-hub-backend" && source .venv/bin/activate && uvicorn app:app --reload &
BACKEND_PID=$!

# ML Service
echo "Starting ML Service..."
cd "$SCRIPT_DIR/repurpose-ml" && source .venv/bin/activate && uvicorn app:app --reload --port 3001 &
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
