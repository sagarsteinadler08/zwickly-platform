#!/bin/bash

# 🚀 Zwickly Platform Startup Script
# This script helps you start all required services

set -e

PROJECT_DIR="/Users/sagar/sagarneoprojects/zwickly-local-merged"
cd "$PROJECT_DIR"

echo "🚀 Starting Zwickly Platform..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
echo "📦 Checking Docker..."
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo ""
    echo "Please start Docker Desktop first:"
    echo "  1. Open Docker Desktop app"
    echo "  2. Wait for it to start (whale icon in menu bar)"
    echo "  3. Run this script again"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Check Node.js
echo "📦 Checking Node.js..."
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"

# Check dependencies
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installing root dependencies...${NC}"
    npm install
fi
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Check .env.local
echo "📦 Checking environment..."
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local not found!${NC}"
    echo "Creating from example..."
    cp env.local.example .env.local
fi
echo -e "${GREEN}✅ Environment configured${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start Database
echo "🗄️  Starting PostgreSQL database..."
docker-compose up -d
sleep 3
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Database started${NC}"
else
    echo -e "${RED}❌ Database failed to start${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Setup complete!"
echo ""
echo "Now open 3 MORE terminal windows and run:"
echo ""
echo -e "${YELLOW}Terminal 2 - Backend API:${NC}"
echo "  cd $PROJECT_DIR"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}Terminal 3 - Socket Server:${NC}"
echo "  cd $PROJECT_DIR"
echo "  npx tsx scripts/socket-server.ts"
echo ""
echo -e "${YELLOW}Terminal 4 - Frontend:${NC}"
echo "  cd $PROJECT_DIR/frontend"
echo "  npm run dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 Once all services are running, access:"
echo ""
echo "  Student Portal:  http://localhost:8080"
echo "  Admin Portal:    http://localhost:8080/admin/home"
echo "  Social Wall:     http://localhost:8080/social"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

