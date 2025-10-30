# 🎓 Zwickly Local Merged - Complete Student Life Platform

A complete local implementation of the Zwickly student life platform, combining the Lovable UI frontend with a local Next.js backend, PostgreSQL database, and all necessary services.

## 🎯 What This Project Provides

- ✅ **Complete Lovable UI** - Unchanged React frontend with all features
- ✅ **Local Backend** - Next.js API with Prisma ORM
- ✅ **PostgreSQL Database** - Docker containerized database
- ✅ **Data Import** - Python script to import Supabase exports
- ✅ **Push Notifications** - VAPID keys for web push
- ✅ **WebSocket Server** - Real-time features
- ✅ **Zero External Dependencies** - Everything runs locally

## 🚀 Quick Start (Automated Setup)

### Prerequisites
- **Docker Desktop** - [Download here](https://docs.docker.com/desktop/mac/install/)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Python 3** - Usually pre-installed on macOS

### One-Command Setup
```bash
# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

This script will:
1. ✅ Check Docker and start PostgreSQL container
2. ✅ Fix environment variables
3. ✅ Generate VAPID keys for push notifications
4. ✅ Install all dependencies
5. ✅ Run Prisma migrations
6. ✅ Import Supabase data
7. ✅ Start development servers

**After setup completes, open: http://localhost:8080**

---

## 🔧 Manual Setup (Step by Step)

If you prefer to run each step manually:

### Step 1: Start Docker & Database
```bash
# Start Docker Desktop (GUI)
open -a Docker

# Wait for Docker to be ready, then start PostgreSQL
docker compose up -d

# Verify container is running
docker ps
```

### Step 2: Environment Setup
```bash
# Create .env file for Prisma
cp .env.local .env

# Verify DATABASE_URL is set
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

### Step 3: Generate VAPID Keys
```bash
# Install web-push
npm install web-push --no-save

# Generate keys
npx web-push generate-vapid-keys --json > vapid.json

# Extract and update .env.local
PUBLIC=$(node -e "console.log(JSON.parse(require('fs').readFileSync('vapid.json','utf8')).publicKey)")
PRIVATE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('vapid.json','utf8')).privateKey)")

cat > .env.local << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="$PUBLIC"
VAPID_PRIVATE_KEY="$PRIVATE"
WS_PORT=4001
EOF
```

### Step 4: Install Dependencies
```bash
# Node.js dependencies
npm install

# Python dependencies
python3 -m pip install --user psycopg2-binary
```

### Step 5: Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### Step 6: Import Data
```bash
# Import Supabase export data
python3 scripts/import_supabase.py --dir supabase_export_20251028_150354
```

### Step 7: Start Servers
```bash
# Start Next.js + WebSocket servers
npm run dev
```

---

## 📊 Project Structure

```
zwickly-local-merged/
├── frontend/                    # Lovable UI (unchanged)
│   ├── src/
│   │   ├── pages/              # React pages
│   │   ├── components/         # UI components
│   │   └── integrations/       # Supabase client (uses shim)
│   └── package.json
├── src/                        # Next.js Backend
│   ├── pages/api/              # API routes
│   │   ├── events/             # Events API
│   │   ├── timetable/          # Timetable API
│   │   ├── news/               # News API
│   │   ├── exams/              # Exams API
│   │   ├── german/             # German culture API
│   │   ├── mensa/              # Mensa menu API
│   │   ├── items/              # Items API
│   │   ├── push/               # Push notification API
│   │   ├── functions/          # Function endpoints
│   │   └── auth/               # Auth endpoints
│   └── lib/
│       ├── db.ts               # Prisma client
│       └── supabase-shim.ts    # Supabase replacement
├── prisma/
│   └── schema.prisma           # Database schema
├── scripts/
│   └── import_supabase.py      # Data import script
├── supabase_export_20251028_150354/  # Your Supabase data
├── docker-compose.yml          # Postgres container
├── setup.sh                    # Automated setup script
├── package.json                # Node.js dependencies
└── README.md                   # This file
```

---

## 🔌 API Endpoints

The backend provides these API routes:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/events` | GET, POST | Events with filtering and ordering |
| `/api/timetable` | GET | Class schedules |
| `/api/news` | GET | University news |
| `/api/exams` | GET | Exam schedules |
| `/api/german` | GET | German culture content |
| `/api/mensa` | GET | Cafeteria menu |
| `/api/items` | GET, POST | Generic items (realtime testing) |
| `/api/push/subscribe` | POST | Subscribe to push notifications |
| `/api/functions/chat-assistant` | POST | Local chat assistant |
| `/api/auth/signup` | POST | User registration (dev only) |
| `/api/auth/signin` | POST | User login (dev only) |

---

## 🗄️ Database Schema

The Prisma schema includes these tables:

- **Event** - Event listings with details, categories, likes
- **Timetable** - Class schedules and room assignments  
- **WhzNews** - University news and announcements
- **MensaMenu** - Cafeteria menu items and pricing
- **Exam** - Exam schedules and locations
- **GermanCultureInteraction** - Cultural learning content
- **Item** - Generic items for testing realtime features
- **PushSubscription** - Web push notification subscriptions
- **Profile** - User profiles for auth (dev only)

---

## 🛠️ Development Commands

### Using the Setup Script (Recommended)
```bash
./setup.sh                    # Complete automated setup
```

### Manual Commands
```bash
# Docker
docker compose up -d          # Start PostgreSQL
docker compose down           # Stop PostgreSQL
docker ps                     # Check running containers

# Database
npx prisma generate           # Generate Prisma client
npx prisma migrate dev        # Run migrations
npx prisma studio             # Open Prisma Studio
npx prisma migrate reset      # Reset database

# Development
npm run dev                   # Start Next.js + WebSocket
npm run build                 # Build production
npm run start                 # Start production

# Data Import
python3 scripts/import_supabase.py --dir supabase_export_20251028_150354
```

---

## 🔍 Troubleshooting

### Docker Issues
```bash
# Check Docker status
docker info

# If Docker not running
open -a Docker

# Check container logs
docker compose logs db

# Reset container if corrupted
docker compose down
docker volume rm zwickly-local-merged_pgdata
docker compose up -d
```

### Environment Issues
```bash
# Check if .env exists
ls -la .env

# Verify DATABASE_URL
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"

# If missing, create it
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"' > .env
```

### Prisma Issues
```bash
# Check if schema exists
ls prisma/schema.prisma

# Regenerate client
npx prisma generate

# Check database connection
docker exec -i zwickly-local-merged-db-1 psql -U postgres -d app -c "\dt"
```

### Port Conflicts
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process if needed
kill -9 $(lsof -t -i :3000)

# Or start on different port
PORT=3001 npm run dev
```

### Data Import Issues
```bash
# Check if export directory exists
ls -la supabase_export_20251028_150354/

# Run import manually
python3 scripts/import_supabase.py --dir supabase_export_20251028_150354

# Check data in database
docker exec -i zwickly-local-merged-db-1 psql -U postgres -d app -c "SELECT count(*) FROM events;"
```

---

## 🧪 Testing Your Setup

### 1. Check Database
```bash
# List tables
docker exec -i zwickly-local-merged-db-1 psql -U postgres -d app -c "\dt"

# Check event count
docker exec -i zwickly-local-merged-db-1 psql -U postgres -d app -c "SELECT count(*) FROM events;"
```

### 2. Test API Endpoints
```bash
# Test events API
curl http://localhost:3000/api/events

# Test timetable API
curl http://localhost:3000/api/timetable

# Test news API
curl http://localhost:3000/api/news
```

### 3. Test Frontend
- Open http://localhost:3000
- Check if events are displayed
- Test navigation between pages
- Try the chat assistant

### 4. Test Push Notifications
- Allow notifications in browser
- Test push subscription
- Send test notification

---

## 🔒 Security Notes

- **VAPID keys** are generated locally and should not be committed to public repos
- **Database credentials** are in `.env.local` (not committed)
- **Auth endpoints** are for development only (not secure for production)
- **CORS** is configured for local development only

---

## 🚀 Production Deployment

To deploy to production:

1. **Update environment variables** for production database
2. **Configure CORS** for your domain
3. **Set up HTTPS** for push notifications
4. **Update VAPID keys** for your domain
5. **Implement proper authentication** (NextAuth, Supabase Auth, or JWT)
6. **Build and deploy** using `npm run build` and `npm run start`

---

## 📞 Need Help?

If you encounter issues:

1. **Run the setup script**: `./setup.sh`
2. **Check Docker status**: `docker ps`
3. **Verify environment**: `cat .env`
4. **Check database**: `docker exec -i zwickly-local-merged-db-1 psql -U postgres -d app -c "\dt"`
5. **Test API**: `curl http://localhost:3000/api/events`

For detailed troubleshooting, see the troubleshooting section above.

---

## 🎉 Success Indicators

Your setup is working correctly when you see:

- ✅ Docker container running: `docker ps` shows postgres container
- ✅ Database connected: Prisma migrations run successfully
- ✅ Data imported: `SELECT count(*) FROM events;` returns > 0
- ✅ API responding: `curl http://localhost:3000/api/events` returns JSON
- ✅ Frontend loading: http://localhost:3000 shows the app
- ✅ WebSocket running: Port 4001 is listening

**🎊 Enjoy your fully local Zwickly student life platform!**

---

## Zwickly design tokens (local UI theme)

We added a small design token & helper CSS system to match the mobile prototype.

**Files:**
- `frontend/src/styles/zwickly-tokens.css` — color, radius, gap, shadow tokens
- `frontend/src/styles/zwickly-components.css` — helper classes (zw-card, zw-btn, zw-input, etc.)

**Usage:**
- Shared UI primitives were updated to use these classes: Card, Button, Input, Header, Modal, Badge, Avatar.
- To revert: remove the two CSS files and restore previous component classNames from your Git history.

**Notes:**
- This change is purely visual — no API, routing, or database logic changed.