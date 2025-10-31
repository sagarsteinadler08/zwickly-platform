# ⚡ Quick Start Commands

## 🚀 First Time Setup (Run Once)

```bash
cd /Users/sagar/sagarneoprojects/zwickly-local-merged
./start.sh
```

---

## 📋 Manual Startup (Copy-Paste These)

### Step 1: Start Docker Desktop
- Open Docker Desktop app
- Wait for whale icon in menu bar to be active

### Step 2: Open 4 Terminal Windows

Copy-paste these commands into each terminal:

#### **Terminal 1: Database**
```bash
cd /Users/sagar/sagarneoprojects/zwickly-local-merged && docker-compose up -d && echo "✅ Database running on port 5432"
```

#### **Terminal 2: Backend API**
```bash
cd /Users/sagar/sagarneoprojects/zwickly-local-merged && npm run dev
```
- Access: http://localhost:3000
- Wait for: "ready - started server on 0.0.0.0:3000"

#### **Terminal 3: Socket Server + Reminders**
```bash
cd /Users/sagar/sagarneoprojects/zwickly-local-merged && npx tsx scripts/socket-server.ts
```
- Access: ws://localhost:4001
- Wait for: "Socket.IO server running on port 4001"

#### **Terminal 4: Frontend**
```bash
cd /Users/sagar/sagarneoprojects/zwickly-local-merged/frontend && npm run dev
```
- Access: http://localhost:8080
- Wait for: "Local: http://localhost:8080/"

---

## 🔗 Access the Platform

Once all 4 services are running:

### **Student Portal** (Main App)
```
http://localhost:8080
```

### **Admin Portal** (KommPakt)
```
http://localhost:8080/admin/home
```

### **Social Wall**
```
http://localhost:8080/social
```

### **Chatbot** (Pixie AI)
```
http://localhost:8080/chatbot
```

---

## ✅ Verify All Services Running

Run this to check:
```bash
echo "=== Service Status ===" && \
lsof -ti:5432 >/dev/null 2>&1 && echo "✅ Database (5432)" || echo "❌ Database (5432)" && \
lsof -ti:3000 >/dev/null 2>&1 && echo "✅ Backend (3000)" || echo "❌ Backend (3000)" && \
lsof -ti:4001 >/dev/null 2>&1 && echo "✅ Socket (4001)" || echo "❌ Socket (4001)" && \
lsof -ti:8080 >/dev/null 2>&1 && echo "✅ Frontend (8080)" || echo "❌ Frontend (8080)"
```

---

## 🛑 Stop All Services

```bash
# Stop database
cd /Users/sagar/sagarneoprojects/zwickly-local-merged && docker-compose down

# Press Ctrl+C in each terminal window for the other services
```

---

## 🧪 Test Features Manually

### 1. **Theme Toggle**
- Go to http://localhost:8080
- Click sun/moon icon in navbar
- Verify theme switches (dark ↔ light)

### 2. **Notifications** (5 Channels)
- Go to Social Wall
- Post: "Hello @admin"
- Should trigger:
  - 🔊 Sound alert
  - 💻 Desktop notification
  - 🔴 Red toast (bottom-right)
  - 📋 Activity feed entry
  - 📱 Push notification

### 3. **Reminders**
- Go to Home page
- Scroll to Reminder Widget
- Create a reminder for 1 minute from now
- Wait and observe all 5 notification channels

### 4. **Social Features**
- Post messages
- Create poll
- Upload image
- Type "@pixi what's the weather?" (AI bot)
- Type "@admin help needed" (ticket system)

### 5. **Admin Features**
- Go to http://localhost:8080/admin/home
- Create an event
- Check "Publish to Social"
- Verify it appears in Social Wall
- Check ticket system for @admin mentions

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill specific port
lsof -ti:3000 | xargs kill -9   # Backend
lsof -ti:4001 | xargs kill -9   # Socket
lsof -ti:8080 | xargs kill -9   # Frontend
```

### Database Issues
```bash
# Restart database
cd /Users/sagar/sagarneoprojects/zwickly-local-merged
docker-compose down
docker-compose up -d

# View logs
docker-compose logs -f
```

### Frontend Not Loading
```bash
cd /Users/sagar/sagarneoprojects/zwickly-local-merged/frontend
rm -rf node_modules .vite
npm install
npm run dev
```

### Backend Errors
```bash
cd /Users/sagar/sagarneoprojects/zwickly-local-merged
rm -rf node_modules .next
npm install
npm run dev
```

---

## 💡 Pro Tips

1. **Save these commands as aliases** in `~/.zshrc`:
   ```bash
   alias zwickly-start="cd /Users/sagar/sagarneoprojects/zwickly-local-merged && ./start.sh"
   alias zwickly-backend="cd /Users/sagar/sagarneoprojects/zwickly-local-merged && npm run dev"
   alias zwickly-socket="cd /Users/sagar/sagarneoprojects/zwickly-local-merged && npx tsx scripts/socket-server.ts"
   alias zwickly-frontend="cd /Users/sagar/sagarneoprojects/zwickly-local-merged/frontend && npm run dev"
   alias zwickly-stop="cd /Users/sagar/sagarneoprojects/zwickly-local-merged && docker-compose down && pkill -f node"
   ```

2. **Use VS Code split terminals** - Open 4 terminal panes in VS Code

3. **Keep terminals visible** to see real-time logs

---

## 📊 Expected Output

### Terminal 2 (Backend) - Success:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
info  - Loaded env from /path/to/.env.local
```

### Terminal 3 (Socket) - Success:
```
Socket.IO server running on port 4001
Reminder scheduler started - checking every 60 seconds
Connected to database
```

### Terminal 4 (Frontend) - Success:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:8080/
➜  Network: use --host to expose
```

---

## ✅ You're Ready When:

- ✅ No errors in any terminal
- ✅ All 4 services show "ready" or "running"
- ✅ http://localhost:8080 loads without errors
- ✅ Theme toggle works
- ✅ Navigation between pages works

---

**Platform:** Zwickly MVP
**Version:** 1.0.0
**Status:** Production-Ready
**Date:** October 31, 2025

