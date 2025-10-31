# 🚀 How to Start Zwickly Platform

## Quick Start (All Services)

You need **4 terminal windows** to run all services:

---

## Terminal 1: Database (PostgreSQL)
```bash
cd /Users/sagar/sagarneoprojects/zwickly-local-merged
docker-compose up -d
```

**Check status:**
```bash
docker-compose ps
```

**Stop database:**
```bash
docker-compose down
```

---

## Terminal 2: Backend API (Next.js - Port 3000)
```bash
cd /Users/sagar/sagarneoprojects/zwickly-local-merged
npm run dev
```

**Access:** http://localhost:3000
**Stop:** Press `Ctrl+C`

---

## Terminal 3: Socket.IO Server + Reminder Scheduler (Port 4001)
```bash
cd /Users/sagar/sagarneoprojects/zwickly-local-merged
npx tsx scripts/socket-server.ts
```

**Access:** ws://localhost:4001
**Stop:** Press `Ctrl+C`

---

## Terminal 4: Frontend (Vite - Port 8080)
```bash
cd /Users/sagar/sagarneoprojects/zwickly-local-merged
cd frontend
npm run dev
```

**Access:** http://localhost:8080
**Stop:** Press `Ctrl+C`

---

## 🔗 Application URLs

### Student Portal
```
http://localhost:8080
```

### Admin Portal (KommPakt)
```
http://localhost:8080/admin/home
```

### Social Wall
```
http://localhost:8080/social
```

### Chatbot (Pixie)
```
http://localhost:8080/chatbot
```

---

## 📋 Startup Checklist

Before starting, ensure:
- ✅ Docker is running
- ✅ PostgreSQL container is up
- ✅ Node.js 18+ installed
- ✅ Dependencies installed (`npm install` in root and `frontend/`)
- ✅ `.env.local` file configured

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Find process using port 8080
lsof -ti:8080 | xargs kill -9

# Find process using port 4001
lsof -ti:4001 | xargs kill -9

# Find process using port 5432 (PostgreSQL)
lsof -ti:5432 | xargs kill -9
```

### Database Issues
```bash
# Restart database
docker-compose down
docker-compose up -d

# View database logs
docker-compose logs -f

# Run migrations
npx prisma migrate dev

# Seed database
psql $DATABASE_URL < prisma/seed_4_groups.sql
```

### Frontend Build Issues
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Backend Issues
```bash
rm -rf node_modules .next
npm install
npm run dev
```

---

## 🚦 Check All Services Running

Run this command to check all ports:
```bash
echo "=== Checking Zwickly Services ==="
echo ""
echo "📊 Database (5432):"
lsof -ti:5432 && echo "✅ Running" || echo "❌ Not running"
echo ""
echo "🔧 Backend API (3000):"
lsof -ti:3000 && echo "✅ Running" || echo "❌ Not running"
echo ""
echo "🔌 Socket Server (4001):"
lsof -ti:4001 && echo "✅ Running" || echo "❌ Not running"
echo ""
echo "🎨 Frontend (8080):"
lsof -ti:8080 && echo "✅ Running" || echo "❌ Not running"
```

---

## 🛑 Stop All Services

```bash
# Stop Docker database
docker-compose down

# Kill all Node processes (use with caution!)
pkill -f "node"
pkill -f "tsx"

# Or kill specific ports
lsof -ti:3000 | xargs kill -9
lsof -ti:4001 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

---

## 🔄 Restart All Services

```bash
# 1. Stop everything
docker-compose down
pkill -f "node"
pkill -f "tsx"

# 2. Start database
docker-compose up -d

# 3. Wait 5 seconds
sleep 5

# 4. Start backend (in new terminal)
npm run dev

# 5. Start socket server (in new terminal)
npx tsx scripts/socket-server.ts

# 6. Start frontend (in new terminal)
cd frontend && npm run dev
```

---

## 📝 Environment Variables

Ensure `.env.local` contains:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/zwickly"
NEXT_PUBLIC_SOCKET_URL="http://localhost:4001"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## 🧪 Test Manual Features

### 1. Theme Toggle
- Go to http://localhost:8080
- Click sun/moon icon in navbar
- Verify theme switches

### 2. Notifications
- Go to Social Wall
- Post a message with @mention
- Check notification bell
- Listen for notification sound

### 3. Reminders
- Go to Home page
- Create a reminder
- Wait for notification (5 channels)

### 4. Social Features
- Post messages
- Create polls
- Upload images
- Use @pixi bot
- Create @admin ticket

### 5. Admin Portal
- Go to http://localhost:8080/admin/home
- Create event
- Moderate channels
- View tickets

---

## 📊 Service Status Dashboard

Create a simple status check:
```bash
curl -s http://localhost:3000/api/health || echo "Backend: ❌"
curl -s http://localhost:8080 || echo "Frontend: ❌"
curl -s http://localhost:4001 || echo "Socket: ❌"
docker-compose ps | grep postgres || echo "Database: ❌"
```

---

## 💡 Pro Tips

1. **Use tmux/screen** for managing multiple terminals
2. **Create aliases** in your `.zshrc`:
   ```bash
   alias zwickly-db="cd /Users/sagar/sagarneoprojects/zwickly-local-merged && docker-compose up -d"
   alias zwickly-backend="cd /Users/sagar/sagarneoprojects/zwickly-local-merged && npm run dev"
   alias zwickly-socket="cd /Users/sagar/sagarneoprojects/zwickly-local-merged && npx tsx scripts/socket-server.ts"
   alias zwickly-frontend="cd /Users/sagar/sagarneoprojects/zwickly-local-merged/frontend && npm run dev"
   ```
3. **Use VS Code integrated terminal** - split into 4 panes
4. **Keep logs visible** to see real-time activity

---

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ No error messages in any terminal
- ✅ Frontend loads at http://localhost:8080
- ✅ You can navigate between pages
- ✅ Theme toggle works
- ✅ Notifications work
- ✅ Real-time features update

---

**Last Updated:** October 31, 2025
**Platform:** Zwickly MVP
**Status:** Production-Ready

