# 🎓 Zwickly Platform

**The Complete Campus Experience Platform for WHZ University**

Zwickly is a comprehensive digital platform designed for students at West Saxon University of Zwickau (WHZ), integrating academic tools, social features, event management, and administrative controls into a unified, modern web application.

---

## 🌟 Overview

Zwickly Platform combines three distinct products:
- **Zwickly Student** - Student dashboard with timetables, events, social wall, and productivity tools
- **Pixie** - AI-powered campus assistant chatbot
- **KommPakt** - Administrative portal for event management and social moderation

**Live URLs:**
- Student Portal: `http://localhost:8080`
- Admin Portal: `http://localhost:8080/admin/home`
- Social Wall: `http://localhost:8080/social`

---

## ✨ Key Features

### 📚 Student Portal

**Academic Tools:**
- 📅 **Interactive Timetable** - Daily class schedules with room numbers and instructors
- 📝 **Exam Planner** - Upcoming exam tracker with dates and locations
- 🍽️ **Mensa Menu** - Daily cafeteria menu with prices and dietary options
- 📰 **Campus News** - Latest university announcements and updates

**Productivity Suite:**
- ⏰ **Smart Reminders** - Multi-channel notifications (sound, desktop, toast, push)
  - One-time, daily, and weekday recurrence
  - Auto-created from assignments and events
  - Snooze and complete actions
  - Integration with Calendar and Study Planner
- 📝 **Note Taker** - Quick capture with pin, mark done, and delete features
- ⏱️ **Study Planner** - Pomodoro timer (25min/5min) with assignment tracker
- 📰 **Activity Feed** - Real-time updates (announcements, events, polls, messages)

**Social Features:**
- 💬 **Social Wall** - WhatsApp-style chat with channels
  - Real-time messaging via Socket.IO
  - @mentions with notifications
  - @pixi bot integration (timetable, exams queries)
  - Image uploads and polls
  - Public and private channels
- 🎫 **Ticket System** - @admin mentions create support tickets
- 🔔 **Notification Center** - Centralized notification hub

**Campus Life:**
- 🎉 **Events Discovery** - Browse and register for campus events
  - Category filtering (Career, Tech, Music, Sports, Social)
  - Like and Prost reactions
  - Event registration with reminder auto-creation
- 🚌 **Transport Schedule** - VMS bus/tram timings
- 💳 **Student Wallet** - Campus card balance and top-up
- 📅 **Calendar Widget** - Monthly view with event markers

### 🔧 Admin Portal (KommPakt)

**Event Management:**
- Create, edit, delete events
- Publish to social wall
- Publish to banner carousel
- Event analytics and registration tracking

**Social Wall Administration:**
- Create and manage channels
- Approve/decline channel requests
- Send messages and polls
- Upload images to channels
- View message history
- Support ticket management
- Bulk channel operations

**Analytics Dashboard:**
- Event registration metrics
- User engagement tracking
- Channel activity monitoring

### 🤖 Pixie AI Assistant

- Natural language campus queries
- Timetable information
- Exam schedules
- Event listings
- Mensa menu
- Transport times
- Context-aware responses

---

## 🎨 Design System

**Dark Neo Gradient Theme:**
- Base colors: `#0F172A` (dark) / `#F8F9FB` (light)
- Primary gradient: Purple (`#7B5CFA`) → Teal (`#48E0E4`)
- Glassmorphism effects with backdrop blur
- Smooth transitions and animations
- WCAG AA+ accessible contrast ratios

**Light Theme Support:**
- Soft slate color palette
- Comfortable reading experience
- Reduced eye strain
- Professional appearance
- Toggle via navbar (☀️/🌙)

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite (development server)
- TailwindCSS + Shadcn UI
- React Router v6
- React Query (data fetching)
- Socket.IO Client (real-time)

**Backend:**
- Next.js 14 (API routes)
- Node.js 18+
- TypeScript
- Prisma ORM
- PostgreSQL database

**Real-time:**
- Socket.IO Server
- WebSocket connections
- Event-driven architecture
- Auto-reconnection logic

**Infrastructure:**
- Docker (PostgreSQL)
- Docker Compose
- Environment-based configuration
- Modular service architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Vite Dev   │  │  React App   │  │  Socket.IO   │  │
│  │   :8080      │  │  (Frontend)  │  │   Client     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │                    │
                           ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend Services                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Next.js    │  │  Socket.IO   │  │   Reminder   │  │
│  │   API :3000  │  │  Server      │  │  Scheduler   │  │
│  │              │  │  :4001       │  │  (60s loop)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                   │                 │         │
│         └───────────────────┴─────────────────┘         │
│                           │                              │
└───────────────────────────┼──────────────────────────────┘
                            ▼
                  ┌──────────────────┐
                  │   PostgreSQL     │
                  │   Database       │
                  │   :5432          │
                  └──────────────────┘
```

**Database Schema:**
- Events, Timetable, Exams, Mensa Menu
- Channels, Messages, Polls, Mentions
- Notifications, Tickets, Reminders
- Push Subscriptions, Profiles

**API Structure:**
- `/api/chat/*` - Social wall (channels, messages, polls)
- `/api/events/*` - Event CRUD and reminders
- `/api/notifications` - User notifications
- `/api/tickets` - Support ticket system
- `/api/reminders/*` - Reminder CRUD and snooze
- `/api/pixi` - Chatbot queries

**Socket Events:**
- `message:new` - New chat message
- `poll:created`, `poll:updated` - Poll lifecycle
- `mention` - User mentioned
- `reminder:triggered` - Reminder due
- `ticket:new` - Support ticket created
- `auto_join_channels` - Auto-join all channels

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker Desktop
- PostgreSQL (via Docker)
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/sagarsteinadler08/zwickly-platform.git
cd zwickly-platform

# Install dependencies
npm install

# Setup environment
cp env.local.example .env.local
cp frontend/.env.example frontend/.env

# Start PostgreSQL
docker-compose up -d

# Run database migrations
npx prisma db push
npx prisma generate

# Seed initial data (optional)
psql -U postgres -d app < prisma/seed_4_groups.sql
```

### Running the Application

**Terminal 1 - Backend API:**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Socket.IO Server:**
```bash
npx tsx scripts/socket-server.ts
# Runs on ws://localhost:4001
# Includes reminder scheduler (60s intervals)
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:8080
```

### Access Points

- **Student Portal:** http://localhost:8080
- **Admin Portal:** http://localhost:8080/admin/home
- **Social Wall:** http://localhost:8080/social
- **Chatbot:** http://localhost:8080/chatbot
- **Events:** http://localhost:8080/events
- **Products:** http://localhost:8080/users

---

## 📖 Documentation

- **[Technical Documentation](./TECHNICAL_DOCUMENTATION.md)** - Detailed architecture and API specs
- **[Feature Guide](./FEATURE_GUIDE.md)** - Complete feature descriptions and usage
- **[One-Pager](./ZWICKLY_ONE_PAGER.md)** - Executive summary
- **[System Design](./SYSTEM_DESIGN.md)** - Architecture diagrams and design decisions

---

## 🔑 Key Technologies

| Category | Technologies |
|----------|-------------|
| **Frontend** | React, TypeScript, Vite, TailwindCSS, Shadcn UI |
| **Backend** | Next.js, Node.js, Prisma ORM |
| **Database** | PostgreSQL, Docker |
| **Real-time** | Socket.IO, WebSockets |
| **Auth** | Supabase Auth (JWT) |
| **Notifications** | Web Push (VAPID), Sonner Toasts |
| **State** | React Context, React Query |
| **Routing** | React Router v6 |
| **Build** | Vite, TypeScript, ESBuild |

---

## 🎯 Feature Highlights

### Real-time Capabilities
- ✅ Live chat messaging
- ✅ Instant poll updates
- ✅ Real-time activity feed
- ✅ Auto-join channels
- ✅ @mention notifications
- ✅ Reminder triggers
- ✅ Ticket alerts

### Automation
- ✅ Auto-reminders for assignments (1 day before, 9 AM)
- ✅ Auto-reminders for events (24h before registration)
- ✅ Recurring reminders (daily, weekdays)
- ✅ Auto-join all channels for students
- ✅ @pixi bot auto-responses

### Accessibility
- ✅ WCAG AA+ compliant
- ✅ Dark/Light theme toggle
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ High contrast ratios
- ✅ Semantic HTML

### Performance
- ✅ Lazy loading components
- ✅ Code splitting
- ✅ Optimized images
- ✅ Database indexing
- ✅ Connection pooling
- ✅ Caching strategies

---

## 👥 User Roles

### Student
- View timetables and exams
- Participate in social channels
- Register for events
- Create notes and reminders
- Use Pomodoro timer
- Chat with Pixie bot

### Admin (KommPakt)
- Create and manage events
- Moderate social channels
- Approve channel requests
- Handle support tickets
- Send announcements
- View analytics

### System
- Reminder scheduler (automated)
- Push notification service
- Socket.IO event broker
- Database maintenance

---

## 🛠️ Development

### Project Structure

```
zwickly-local-merged/
├── frontend/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Route pages
│   │   ├── lib/           # Utilities
│   │   ├── contexts/      # React contexts
│   │   └── styles/        # CSS files
│   └── public/            # Static assets
├── pages/                 # Next.js API routes
│   └── api/
│       ├── chat/          # Social wall APIs
│       ├── events/        # Event APIs
│       ├── notifications/ # Notification APIs
│       ├── reminders/     # Reminder APIs
│       └── tickets/       # Ticket APIs
├── scripts/               # Backend services
│   └── socket-server.ts   # Socket.IO + Scheduler
├── prisma/                # Database schema
│   ├── schema.prisma      # Data models
│   └── migrations/        # DB migrations
└── public/                # Backend static files
```

### Environment Variables

**Backend (.env.local):**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app"
VAPID_PUBLIC="your-vapid-public-key"
VAPID_PRIVATE="your-vapid-private-key"
NEXT_PUBLIC_SOCKET_URL="ws://localhost:4001"
```

**Frontend (frontend/.env):**
```env
VITE_API_URL="http://localhost:3000"
VITE_SOCKET_URL="ws://localhost:4001"
VITE_SOCIAL_WALL_ENABLED="true"
```

### Scripts

```bash
# Backend development
npm run dev              # Start Next.js API server

# Socket.IO server
npx tsx scripts/socket-server.ts

# Database
npx prisma studio        # Database GUI
npx prisma db push       # Sync schema
npx prisma generate      # Generate client

# Frontend
cd frontend && npm run dev
```

---

## 📊 Database Models

**Core Entities:**
- Events (title, date, location, category, image)
- Timetable (day, time, course, room, instructor)
- Exams (course, date, space, lecturer)
- Channels (name, slug, description, public/private)
- Messages (user, channel, body, mentions, images)
- Polls (question, options, votes, closed status)
- Reminders (time, recurrence, source, completed)
- Tickets (user, title, status, priority, admin reply)
- Notifications (user, type, payload, read status)

**Indexes:**
- User-based queries (userId + status)
- Time-based queries (reminderTime, createdAt)
- Channel relationships (channelId)

---

## 🔐 Security

- CORS configured for API endpoints
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (React auto-escaping)
- Input validation on all forms
- Rate limiting on message sending
- Authenticated socket connections
- Secure WebSocket (wss:// in production)

---

## 🎨 UI/UX Features

**Design Highlights:**
- Dark Neo Gradient theme (purple-teal)
- Soft light theme (slate palette)
- Glassmorphism effects
- Smooth animations (300ms transitions)
- Responsive grid layouts (mobile, tablet, desktop)
- Loading skeletons
- Empty states with helpful messages
- Error boundaries

**Interactive Elements:**
- Gradient buttons with glow effects
- Hover states on all clickables
- Focus rings for accessibility
- Toast notifications with actions
- Modal dialogs
- Dropdown menus
- Tab navigation

---

## 🔄 Real-time Features

**Socket.IO Integration:**
- Bi-directional event communication
- Auto-join channels on connect
- Room-based message broadcasting
- Presence tracking
- Reconnection handling
- Fallback to REST polling

**Live Updates:**
- Chat messages appear instantly
- Poll votes update in real-time
- Activity feed refreshes automatically
- Reminders trigger with 60s precision
- Notification bell updates live

---

## 📱 Progressive Web App (PWA)

- Push notifications support
- VAPID key setup for web push
- Service worker ready
- Offline-first architecture (planned)
- Add to home screen (planned)

---

## 🧪 Testing

**Manual Testing Checklist:**
- [ ] Theme toggle works on all pages
- [ ] Forms readable in both themes
- [ ] Chat messages send and receive
- [ ] Polls can be voted on
- [ ] Events can be registered
- [ ] Reminders trigger with notifications
- [ ] Notes persist after refresh
- [ ] Pomodoro timer counts down
- [ ] Activity feed updates
- [ ] Admin can create channels
- [ ] Tickets created on @admin mention

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 👨‍💻 Development Team

**Platform:** Zwickly
**Institution:** West Saxon University of Zwickau (WHZ)
**Version:** 1.0.0
**Last Updated:** October 2025

---

## 🆘 Support

For technical issues or feature requests:
- Create a ticket via @admin mention in Social Wall
- Contact KommPakt admin team
- Check documentation in `/docs` folder

---

## 🗺️ Roadmap

**Upcoming Features:**
- Mobile app (React Native)
- Offline mode
- Advanced analytics
- Calendar sync (Google, Outlook)
- File sharing in chat
- Video/voice calls
- Study group matching
- Peer tutoring marketplace

---

**Built with ❤️ for WHZ Students**
