#!/usr/bin/env zsh

# Get the directory of the script
SCRIPT_DIR="${0:A:h}"

echo "Stopping existing processes..."

# Kill processes on relevant ports
PORTS=(8000 3001 5173)
for port in $PORTS; do
    PID=$(lsof -ti :$port)
    if [ -n "$PID" ]; then
        echo "Killing process on port $port (PID: $PID)..."
        kill -9 $PID 2>/dev/null
    fi
done

# Ensure MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    # Using local path for mongodb data if /tmp/mongodb is not accessible or preferred
    mkdir -p "$SCRIPT_DIR/data/db"
    mongod --dbpath "$SCRIPT_DIR/data/db" --fork --logpath "$SCRIPT_DIR/data/mongodb.log"
    sleep 2
else
    echo "MongoDB already running"
fi

echo "Starting all services..."

# Cleanup function
cleanup() {
    echo "\nStopping services..."
    kill $FRONTEND_PID $BACKEND_PID $ML_PID 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

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

echo "\n========================================"
echo "All services started!"
echo "========================================"
echo "Frontend PID: $FRONTEND_PID"
echo "Backend PID: $BACKEND_PID"
echo "ML Service PID: $ML_PID"
echo "========================================"
echo "Press Ctrl+C to stop all services..."

# Wait for background processes
wait
