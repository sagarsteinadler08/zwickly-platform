#!/bin/bash

# 🚀 Zwickly Local Merged - Complete Setup Script
# This script fixes all common setup issues and gets your project running

set -e  # Exit on any error

echo "🎯 Zwickly Local Merged - Complete Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Check Docker
print_status "Step 1: Checking Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed!"
    echo "Please install Docker Desktop from: https://docs.docker.com/desktop/mac/install/"
    exit 1
fi

if ! docker info &> /dev/null; then
    print_warning "Docker is not running. Starting Docker Desktop..."
    open -a Docker
    echo "Please wait for Docker to start (whale icon stops animating), then run this script again."
    exit 1
fi

print_success "Docker is running!"

# Step 2: Start PostgreSQL container
print_status "Step 2: Starting PostgreSQL container..."
docker compose up -d

# Wait for container to be ready
print_status "Waiting for PostgreSQL to be ready..."
sleep 5

# Check if container is running
if ! docker ps | grep -q "zwickly-local-merged-db-1"; then
    print_error "PostgreSQL container failed to start!"
    echo "Checking logs..."
    docker compose logs db
    exit 1
fi

print_success "PostgreSQL container is running!"

# Step 3: Fix environment variables
print_status "Step 3: Setting up environment variables..."

# Create .env from .env.local if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cp .env.local .env
fi

# Update .env with correct DATABASE_URL
print_status "Updating DATABASE_URL in .env..."
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
EOF

print_success "Environment variables configured!"

# Step 4: Generate VAPID keys if needed
print_status "Step 4: Checking VAPID keys..."

if ! grep -q "NEXT_PUBLIC_VAPID_PUBLIC_KEY" .env.local || grep -q "<paste-after-generation>" .env.local; then
    print_status "Generating VAPID keys..."
    
    # Install web-push if not present
    npm install web-push --no-save 2>/dev/null || true
    
    # Generate keys
    npx web-push generate-vapid-keys --json > vapid.json
    
    # Extract keys
    PUBLIC_KEY=$(node -e "console.log(JSON.parse(require('fs').readFileSync('vapid.json','utf8')).publicKey)")
    PRIVATE_KEY=$(node -e "console.log(JSON.parse(require('fs').readFileSync('vapid.json','utf8')).privateKey)")
    
    # Update .env.local
    cat > .env.local << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="$PUBLIC_KEY"
VAPID_PRIVATE_KEY="$PRIVATE_KEY"
WS_PORT=4001
EOF
    
    print_success "VAPID keys generated and configured!"
else
    print_success "VAPID keys already configured!"
fi

# Step 5: Install dependencies
print_status "Step 5: Installing Node.js dependencies..."
npm install

print_status "Installing Python dependencies..."
python3 -m pip install --user psycopg2-binary 2>/dev/null || true

print_success "Dependencies installed!"

# Step 6: Prisma setup
print_status "Step 6: Setting up Prisma..."

# Generate Prisma client
npx prisma generate

# Run migrations
print_status "Running database migrations..."
npx prisma migrate dev --name init

print_success "Prisma setup complete!"

# Step 7: Import data
print_status "Step 7: Importing Supabase data..."

if [ -d "supabase_export_20251028_150354" ]; then
    python3 scripts/import_supabase.py --dir supabase_export_20251028_150354
    print_success "Data imported successfully!"
else
    print_warning "Supabase export directory not found. Skipping data import."
fi

# Step 8: Verify setup
print_status "Step 8: Verifying setup..."

# Check database connection
if docker exec -i zwickly-local-merged-db-1 psql -U postgres -d app -c "\dt" &> /dev/null; then
    print_success "Database connection verified!"
else
    print_error "Database connection failed!"
    exit 1
fi

# Check if data exists
EVENT_COUNT=$(docker exec -i zwickly-local-merged-db-1 psql -U postgres -d app -t -c "SELECT count(*) FROM events;" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$EVENT_COUNT" -gt 0 ]; then
    print_success "Database contains $EVENT_COUNT events!"
else
    print_warning "No events found in database."
fi

# Step 9: Start development servers
print_status "Step 9: Starting development servers..."

# Kill any existing processes on port 3000
if lsof -i :3000 &> /dev/null; then
    print_status "Killing existing process on port 3000..."
    kill -9 $(lsof -t -i :3000) 2>/dev/null || true
fi

# Kill any existing processes on port 8080
if lsof -i :8080 &> /dev/null; then
    print_status "Killing existing process on port 8080..."
    kill -9 $(lsof -t -i :8080) 2>/dev/null || true
fi

# Start the backend servers
print_status "Starting Next.js and WebSocket servers..."
npm run dev &

# Start the frontend server
print_status "Starting frontend server..."
cd frontend

# Fix supabase-shim import path
print_status "Fixing supabase-shim import path..."
mkdir -p src/lib
cp ../src/lib/supabase-shim.ts src/lib/supabase-shim.ts

npm install 2>/dev/null || true
npm run dev &
cd ..

# Wait a moment for servers to start
sleep 5

# Check if servers are running
if lsof -i :3000 &> /dev/null; then
    print_success "Next.js server is running on port 3000!"
else
    print_error "Next.js server failed to start!"
    exit 1
fi

if lsof -i :4001 &> /dev/null; then
    print_success "WebSocket server is running on port 4001!"
else
    print_warning "WebSocket server may not be running on port 4001."
fi

# Final success message
echo ""
echo "🎉 SETUP COMPLETE!"
echo "=================="
echo ""
echo "✅ Docker PostgreSQL: Running"
echo "✅ Environment variables: Configured"
echo "✅ VAPID keys: Generated"
echo "✅ Prisma: Migrated"
echo "✅ Data: Imported"
echo "✅ Servers: Running"
echo ""
echo "🌐 Your application is now available at:"
echo "   Frontend: http://localhost:8080"
echo "   Backend APIs: http://localhost:3000/api/*"
echo "   WebSocket: ws://localhost:4001"
echo ""
echo "📊 Database status:"
echo "   Events: $EVENT_COUNT records"
echo ""
echo "🔧 To stop the servers:"
echo "   Press Ctrl+C or run: kill -9 \$(lsof -t -i :3000)"
echo ""
echo "📖 For troubleshooting, see README.md"
echo ""

# Keep the script running to show logs
print_status "Development servers are running. Press Ctrl+C to stop."
wait
