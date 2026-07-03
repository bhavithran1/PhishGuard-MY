#!/bin/bash
echo "Starting PhishGuard MY..."

echo "[1/3] Installing backend dependencies..."
cd backend && pip install -r requirements.txt -q

echo "[2/3] Training ML model..."
python ml/train.py

echo "[3/3] Starting servers..."
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ../frontend && npm install -q && npm run dev &
FRONTEND_PID=$!

echo ""
echo "PhishGuard MY is running!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
