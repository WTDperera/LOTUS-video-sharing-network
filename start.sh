#!/bin/bash

echo "========================================"
echo "  LOTUS VIDEO PLATFORM - QUICK START"
echo "========================================"
echo ""

# Check if MongoDB is running
echo "[1/4] Checking MongoDB..."
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "⚠️  MongoDB is not running"
    echo "   Please start MongoDB first:"
    echo "   - Run: sudo systemctl start mongodb"
    echo "   - Or: mongod"
    echo ""
    exit 1
fi

echo ""
echo "[2/4] Seeding database with demo data..."
node scripts/seed.js
if [ $? -ne 0 ]; then
    echo "❌ Database seeding failed"
    exit 1
fi

echo ""
echo "[3/4] Starting backend server..."
npm run dev &
BACKEND_PID=$!
sleep 3

echo ""
echo "[4/4] Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "  🎉 LOTUS VIDEO PLATFORM STARTED!"
echo "========================================"
echo ""
echo "📺 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "🔐 Demo Account:"
echo "   Email:    john@example.com"
echo "   Password: password123"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "========================================"
echo ""

# Wait for user to press Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
