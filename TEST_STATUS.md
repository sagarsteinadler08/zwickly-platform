# 🧪 Zwickly Platform - Ready for Testing

## ✅ Services Status

**Database:** ✅ Running (PostgreSQL on port 5432)  
**Backend API:** ✅ Running (Next.js on port 3000)  
**Socket.IO:** ✅ Running (WebSocket on port 4001)  
**Frontend:** 🔄 Starting (Vite on port 8080/8081)

---

## 🌐 Access URLs

### Student Portal
- **Home:** http://localhost:8080 or http://localhost:8081
- **Social Wall:** http://localhost:8080/social or http://localhost:8081/social
- **Events:** http://localhost:8080/events or http://localhost:8081/events
- **Chatbot:** http://localhost:8080/chatbot or http://localhost:8081/chatbot

### Admin Portal (KommPakt)
- **Dashboard:** http://localhost:8080/admin/home or http://localhost:8081/admin/home
- **Events Manager:** http://localhost:8080/admin/events or http://localhost:8081/admin/events
- **Social Admin:** http://localhost:8080/admin/social or http://localhost:8081/admin/social

### API Endpoints
- **Base API:** http://localhost:3000/api
- **Channels:** http://localhost:3000/api/chat/channels
- **Events:** http://localhost:3000/api/events
- **WebSocket:** ws://localhost:4001

---

## 📋 Test Checklist

### ✅ Basic Functionality
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Events display correctly
- [ ] Timetable shows
- [ ] Mensa menu loads

### ✅ Social Wall (Student)
- [ ] Channels list loads
- [ ] Can select channel
- [ ] Can send message
- [ ] Messages appear in real-time
- [ ] Can create poll
- [ ] Can vote on poll
- [ ] Can upload image
- [ ] Can request new channel

### ✅ Social Admin
- [ ] Can view all channels
- [ ] Can create channel
- [ ] Can delete channel
- [ ] Can approve requests
- [ ] Can decline requests
- [ ] Can send broadcast message
- [ ] Can create poll as admin
- [ ] Can upload image as admin
- [ ] Can close polls

### ✅ Events Admin
- [ ] Events list loads
- [ ] Can create event
- [ ] Can edit event
- [ ] Can delete event
- [ ] Publishing options visible
- [ ] Can publish to banner
- [ ] Can publish to social wall
- [ ] Channel dropdown works

---

## 🐛 Known Issues (Fixed)

- ✅ process.env error → Fixed (using import.meta.env)
- ✅ API imports → Fixed (PrismaClient)
- ✅ Image model → Added to schema
- ✅ Polls API → Added createdBy field
- ✅ Database connection → Fixed

---

## 🔍 Quick Tests

### Test Database
```bash
curl http://localhost:3000/api/chat/channels
```

### Test Events
```bash
curl http://localhost:3000/api/events
```

### Check Ports
```bash
lsof -i :8080 -i :8081 -i :3000 -i :4001
```

---

## 📝 Logs

- **Full logs:** `/tmp/zwickly-full-test.log`
- **Frontend logs:** `/tmp/frontend-test.log`
- **Backend logs:** `/tmp/backend.log`

---

**Everything is ready for testing!** 🎉

