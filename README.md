# 🎓 Zwickly Platform - AI-Powered Student Life Super App

**Version 1.0** - Complete Social Wall Implementation

An AI-powered student super app for campus life — built with Next.js, Prisma, and Socket.IO. Includes real-time chat, polls, event management, notifications, and Pixi AI assistant.

## ✨ Features

### Student Portal
- 📊 **Dashboard** - Events, timetable, mensa menu, and more
- 💬 **Social Wall** - Real-time chat channels
- 📝 **Polls** - Create and vote on polls
- 📸 **Media Sharing** - Upload and share images
- 🤖 **Pixi AI Assistant** - Campus information chat bot
- 🔔 **Notifications** - Real-time updates

### Admin Portal (KommPakt)
- 📈 **Analytics Dashboard** - User and event statistics
- 🎉 **Event Management** - Create, edit, delete events
- 💬 **Social Admin** - Channel management
- ✅ **Approval System** - Channel request approvals
- 📢 **Broadcasting** - Message broadcasting to channels
- 📊 **Event Publishing** - Publish to social wall or banner

### Technical Features
- ⚡ **Real-time Communication** - Socket.IO WebSocket
- 🔔 **Push Notifications** - Web Push API with VAPID
- 📱 **Responsive Design** - Mobile-first approach
- 🎨 **Modern UI** - Glassmorphism design theme
- 🔒 **Secure** - Local database, no external dependencies

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Node.js 18+
- Python 3

### Setup

```bash
# Clone repository
git clone https://github.com/sagarsteinadler08/zwickly-platform.git
cd zwickly-platform

# Start database
docker-compose up -d

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Setup database
npx prisma generate
npx prisma migrate deploy

# Start development servers
npm run dev
```

**Access:**
- Frontend: http://localhost:8080
- Admin: http://localhost:8080/admin/social
- API: http://localhost:3000

## 📊 Tech Stack

- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS
- **Backend:** Next.js 14 (Pages Router)
- **Database:** PostgreSQL 16 + Prisma ORM
- **Real-time:** Socket.IO
- **Notifications:** Web Push (VAPID)

## 📁 Project Structure

```
zwickly-platform/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/# UI components
│   │   └── lib/       # Utilities
├── pages/             # Next.js API routes
│   └── api/           # REST APIs
├── prisma/            # Database schema
├── scripts/           # Utility scripts
└── docker-compose.yml # Database setup
```

## 🔌 API Endpoints

### Social Wall
- `GET /api/chat/channels` - List channels
- `POST /api/chat/channels` - Create channel
- `DELETE /api/chat/channels/:id` - Delete channel
- `GET /api/chat/channels/:id/messages` - Get messages
- `POST /api/chat/channels/:id/messages` - Send message
- `POST /api/chat/channels/:id/images` - Upload image
- `POST /api/chat/channels/:id/polls` - Create poll

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## 🗄️ Database

PostgreSQL database with Prisma ORM:

- **Channel** - Chat channels
- **Message** - Channel messages
- **Poll** - Poll questions
- **Image** - Uploaded images
- **Event** - Campus events
- **Profile** - User profiles

## 📝 Documentation

- `VERSION_1.0_README.md` - Version 1.0 details
- `FINAL_STATUS_UP.md` - Current status
- `COMPLETE_FIX_SUMMARY.md` - Fixes applied
- `GIT_PUSH_INSTRUCTIONS.md` - Git workflow

## 🔧 Development

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Start database
docker-compose up -d

# Run migrations
npx prisma migrate deploy

# Start dev servers
npm run dev

# View database
npx prisma studio
```

## 📦 Releases

### v1.0.0 (October 30, 2025)
- ✨ Complete social wall implementation
- ✨ Admin control panel
- ✨ Real-time messaging
- ✨ Poll and image features
- ✨ Event publishing integration
- ✨ Production-ready setup

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

All rights reserved.

## 👨‍💻 Author

**Sagar Bhadravathi Ravi**

- GitHub: [@sagarsteinadler08](https://github.com/sagarsteinadler08)
- Repository: https://github.com/sagarsteinadler08/zwickly-platform

## 🙏 Acknowledgments

Built for WHZ students with ❤️
