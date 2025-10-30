# Zwickly Local Merged - Makefile
# Quick commands for development

.PHONY: start db-seed prisma-reset install dev build clean help

# Default target
help:
	@echo "Zwickly Local Merged - Available commands:"
	@echo "  make start     - Start all services (Postgres + Next.js + WebSocket)"
	@echo "  make db-seed   - Import Supabase data into local database"
	@echo "  make prisma-reset - Reset database and run migrations"
	@echo "  make install   - Install all dependencies"
	@echo "  make dev       - Start development servers"
	@echo "  make build     - Build production version"
	@echo "  make clean     - Clean up containers and volumes"

# Start all services
start:
	@echo "Starting all services..."
	docker compose up -d
	@echo "Waiting for database to be ready..."
	sleep 5
	npm run dev

# Install dependencies
install:
	@echo "Installing Node.js dependencies..."
	npm install
	@echo "Installing Python dependencies..."
	pip install psycopg2-binary

# Development mode
dev:
	@echo "Starting development servers..."
	npm run dev

# Build production
build:
	@echo "Building production version..."
	npm run build

# Database operations
db-seed:
	@echo "Importing Supabase data..."
	python3 scripts/import_supabase.py --dir supabase_export_20251028_150354

prisma-reset:
	@echo "Resetting database..."
	npx prisma migrate reset --force
	npx prisma generate

# Clean up
clean:
	@echo "Cleaning up containers and volumes..."
	docker compose down -v
	docker system prune -f

# Quick setup for new users
setup: install
	@echo "Setting up database..."
	docker compose up -d
	sleep 10
	npx prisma generate
	npx prisma migrate dev --name init
	@echo "Setup complete! Run 'make db-seed' to import data."
