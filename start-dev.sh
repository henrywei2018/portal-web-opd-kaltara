#!/bin/bash

# Start Full Stack Development Server
# This script starts both backend and frontend development servers

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================"
echo -e "Starting Dinkes App Full Stack Dev Server"
echo -e "========================================${NC}"

# Check if directories exist
if [ ! -d "backend" ]; then
    echo -e "${RED}Error: backend directory not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo -e "${RED}Error: frontend directory not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo -e "${YELLOW}Stopping servers...${NC}"
    pkill -f "php artisan serve" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    echo -e "${GREEN}Servers stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend Server
echo -e "${BLUE}Starting Backend Server...${NC}"
cd backend
php artisan serve --host=0.0.0.0 --port=8000 > /dev/null 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Check if backend started successfully
if ! curl -s http://localhost:8000/api/public/berita > /dev/null; then
    echo -e "${RED}Failed to start backend server${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Backend running:${NC} http://localhost:8000"

# Start Frontend Development Server
echo -e "${BLUE}Starting Frontend Development Server...${NC}"
cd frontend
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 3

# Check if frontend started successfully
if ! curl -s http://localhost:5173/ > /dev/null; then
    echo -e "${RED}Failed to start frontend server${NC}"
    cleanup
    exit 1
fi

echo -e "${GREEN}✓ Frontend running:${NC} http://localhost:5173"

echo ""
echo -e "${BLUE}========================================"
echo -e "${GREEN}Both Servers Started Successfully!${NC}"
echo -e "========================================${NC}"
echo ""
echo -e "${GREEN}Application Access:${NC}"
echo "  • Frontend (Public):  http://localhost:5173"
echo "  • Frontend (Admin):   http://localhost:5173/admin/dashboard"
echo "  • Backend API:        http://localhost:8000/api"
echo ""
echo -e "${YELLOW}Admin Login:${NC}"
echo "  • URL:  http://localhost:5173/login"
echo "  • Username: admin"
echo "  • Password: admin123"
echo ""
echo -e "${YELLOW}Note:${NC}"
echo "  • Admin panel is in React frontend"
echo "  • Login at http://localhost:5173/login first"
echo "  • Then access admin dashboard at http://localhost:5173/admin/dashboard"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop both servers${NC}"
echo "========================================"

# Keep script running
wait