#!/bin/bash

# 🔍 Zwickly Local Merged - Verification Script
# This script verifies that all components are working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo "🔍 Zwickly Local Merged - System Verification"
echo "============================================="

# Check 1: Docker
print_status "Checking Docker..."
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        print_success "Docker is running"
    else
        print_error "Docker is not running"
        exit 1
    fi
else
    print_error "Docker is not installed"
    exit 1
fi

# Check 2: PostgreSQL Container
print_status "Checking PostgreSQL container..."
if docker ps | grep -q "zwickly-local-merged-db-1"; then
    print_success "PostgreSQL container is running"
else
    print_error "PostgreSQL container is not running"
    echo "Run: docker compose up -d"
    exit 1
fi

# Check 3: Database Connection
print_status "Checking database connection..."
if docker exec -i zwickly-local-merged-db-1 psql -U postgres -d app -c "\dt" &> /dev/null; then
    print_success "Database connection working"
else
    print_error "Database connection failed"
    exit 1
fi

# Check 4: Environment Variables
print_status "Checking environment variables..."
if [ -f .env ]; then
    if grep -q "DATABASE_URL" .env; then
        print_success "DATABASE_URL found in .env"
    else
        print_error "DATABASE_URL not found in .env"
        exit 1
    fi
else
    print_error ".env file not found"
    exit 1
fi

if [ -f .env.local ]; then
    if grep -q "NEXT_PUBLIC_VAPID_PUBLIC_KEY" .env.local && ! grep -q "<paste-after-generation>" .env.local; then
        print_success "VAPID keys configured in .env.local"
    else
        print_warning "VAPID keys not properly configured"
    fi
else
    print_error ".env.local file not found"
    exit 1
fi

# Check 5: Prisma
print_status "Checking Prisma setup..."
if [ -f "prisma/schema.prisma" ]; then
    print_success "Prisma schema found"
else
    print_error "Prisma schema not found"
    exit 1
fi

# Check 6: Database Tables
print_status "Checking database tables..."
TABLE_COUNT=$(docker exec -i zwickly-local-merged-db-1 psql -U postgres -d app -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$TABLE_COUNT" -gt 0 ]; then
    print_success "Database has $TABLE_COUNT tables"
else
    print_error "No tables found in database"
    echo "Run: npx prisma migrate dev --name init"
    exit 1
fi

# Check 7: Data Import
print_status "Checking data import..."
EVENT_COUNT=$(docker exec -i zwickly-local-merged-db-1 psql -U postgres -d app -t -c "SELECT count(*) FROM events;" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$EVENT_COUNT" -gt 0 ]; then
    print_success "Database contains $EVENT_COUNT events"
else
    print_warning "No events found in database"
    echo "Run: python3 scripts/import_supabase.py --dir supabase_export_20251028_150354"
fi

# Check 8: Node.js Dependencies
print_status "Checking Node.js dependencies..."
if [ -d "node_modules" ]; then
    print_success "Node.js dependencies installed"
else
    print_error "Node.js dependencies not installed"
    echo "Run: npm install"
    exit 1
fi

# Check 9: API Endpoints (if server is running)
print_status "Checking API endpoints..."
if lsof -i :3000 &> /dev/null; then
    if curl -s http://localhost:3000/api/events &> /dev/null; then
        print_success "API endpoints responding"
    else
        print_error "API endpoints not responding"
    fi
else
    print_warning "Next.js server not running on port 3000"
    echo "Run: npm run dev"
fi

# Check 10: Frontend (if server is running)
print_status "Checking frontend..."
if lsof -i :8080 &> /dev/null; then
    if curl -s http://localhost:8080 &> /dev/null; then
        print_success "Frontend server running on port 8080"
    else
        print_error "Frontend server not responding"
    fi
else
    print_warning "Frontend server not running on port 8080"
    echo "Run: cd frontend && npm run dev"
fi

# Check 11: Frontend Code
print_status "Checking frontend code..."
if [ -d "frontend/src" ]; then
    print_success "Frontend code found"
else
    print_error "Frontend code not found"
    exit 1
fi

# Summary
echo ""
echo "📊 VERIFICATION SUMMARY"
echo "======================="

if [ "$EVENT_COUNT" -gt 0 ]; then
    echo "✅ Database: $EVENT_COUNT events imported"
else
    echo "⚠️  Database: No events found"
fi

if lsof -i :3000 &> /dev/null; then
    echo "✅ Server: Running on port 3000"
else
    echo "⚠️  Server: Not running"
fi

if lsof -i :4001 &> /dev/null; then
    echo "✅ WebSocket: Running on port 4001"
else
    echo "⚠️  WebSocket: Not running"
fi

echo ""
echo "🌐 Access your application at:"
echo "   Frontend: http://localhost:8080"
echo "   Backend APIs: http://localhost:3000/api/*"
echo "📖 For setup help, see README.md"
echo "🔧 For automated setup, run: ./setup.sh"
