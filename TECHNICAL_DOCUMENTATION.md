# 🔧 Zwickly Platform - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [API Reference](#api-reference)
4. [Database Schema](#database-schema)
5. [Socket.IO Events](#socketio-events)
6. [Authentication & Authorization](#authentication--authorization)
7. [Notification System](#notification-system)
8. [Deployment](#deployment)
9. [Performance Optimization](#performance-optimization)
10. [Security](#security)

---

## Architecture Overview

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Client Layer                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  React SPA     │  │  Socket.IO     │  │  Service Worker│    │
│  │  (Vite)        │  │  Client        │  │  (PWA)         │    │
│  │  Port: 8080    │  │  ws://4001     │  │                │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WS
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Application Layer                            │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  Next.js API   │  │  Socket Server │  │  Scheduler     │    │
│  │  REST Routes   │  │  Event Broker  │  │  Cron Jobs     │    │
│  │  Port: 3000    │  │  Port: 4001    │  │  60s loop      │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│           │                   │                   │               │
│           └───────────────────┴───────────────────┘               │
│                              │                                    │
└──────────────────────────────┼────────────────────────────────────┘
                               │
                               │ Prisma ORM
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Data Layer                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  PostgreSQL Database (Port: 5432)                        │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │ Events   │ │ Channels │ │ Messages │ │ Reminders│  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │ Users    │ │ Tickets  │ │ Polls    │ │ Notifs   │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
Frontend (React + Vite)
├── Pages (Route Components)
│   ├── Index (Home)
│   ├── Events
│   ├── Social
│   ├── Chatbot
│   └── Admin/*
├── Components
│   ├── Layout (Navbar, Sidebar)
│   ├── Cards (Event, Timetable)
│   ├── Widgets (Reminder, Notes, Study)
│   ├── Social (Channels, Messages, Polls)
│   └── UI (Shadcn components)
├── Contexts
│   ├── ThemeContext
│   └── SocketContext
├── Hooks
│   ├── useSocket
│   └── useNotifications
└── Lib
    ├── API clients
    └── Utilities

Backend (Next.js + Node)
├── API Routes
│   ├── /api/chat/*
│   ├── /api/events/*
│   ├── /api/reminders/*
│   ├── /api/notifications
│   └── /api/tickets/*
├── Services
│   ├── Socket.IO Server
│   ├── Reminder Scheduler
│   └── Push Notification Service
└── Database
    └── Prisma ORM
```

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI library |
| TypeScript | 5.5.3 | Type safety |
| Vite | 5.3.4 | Build tool & dev server |
| React Router | 6.26.0 | Client-side routing |
| TailwindCSS | 3.4.1 | Utility-first CSS |
| Shadcn UI | Latest | Component library |
| Socket.IO Client | 4.7.2 | Real-time communication |
| React Query | 5.51.23 | Data fetching & caching |
| Sonner | 1.5.0 | Toast notifications |
| Lucide React | 0.428.0 | Icon library |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.5 | API framework |
| Node.js | 18+ | Runtime |
| TypeScript | 5.5.3 | Type safety |
| Prisma | 5.18.0 | ORM |
| PostgreSQL | 15+ | Database |
| Socket.IO | 4.7.2 | WebSocket server |
| Web Push | 3.6.7 | Push notifications |
| Formidable | 3.5.1 | File upload handling |

### Infrastructure

| Tool | Purpose |
|------|---------|
| Docker | PostgreSQL containerization |
| Docker Compose | Multi-container orchestration |
| Git | Version control |
| GitHub | Repository hosting |
| npm | Package management |

---

## API Reference

### Base URLs
- **API:** `http://localhost:3000/api`
- **Socket:** `ws://localhost:4001`

### Authentication
All requests include `userId` in query params or body (simplified auth for MVP).

```typescript
// Example request
fetch('/api/events', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
```

---

### Chat API

#### `GET /api/chat/channels`
Fetch all channels.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Tivoli General",
    "slug": "tivoli-general",
    "description": "General discussion",
    "is_public": true,
    "member_count": 42,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

#### `POST /api/chat/channels`
Create a new channel (admin only).

**Request:**
```json
{
  "name": "Study Group AI",
  "description": "AI course study group",
  "is_public": true
}
```

#### `GET /api/chat/channels/:id/messages`
Fetch messages for a channel.

**Query Params:**
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "user-123",
    "body": "Hello everyone!",
    "mentions": ["@admin", "@pixi"],
    "images": [],
    "createdAt": "2025-01-01T12:00:00Z"
  }
]
```

#### `POST /api/chat/channels/:id/messages`
Send a message to a channel.

**Request:**
```json
{
  "userId": "user-123",
  "body": "Hello @admin, I need help!",
  "mentions": ["admin"]
}
```

#### `POST /api/chat/channels/:id/polls`
Create a poll in a channel.

**Request:**
```json
{
  "question": "Best study spot?",
  "options": ["Library", "Cafeteria", "Dorm", "Park"],
  "createdBy": "admin"
}
```

#### `POST /api/chat/channels/:channelId/polls/:pollId/vote`
Vote on a poll.

**Request:**
```json
{
  "userId": "user-123",
  "optionIndex": 0
}
```

#### `POST /api/chat/channels/:id/images`
Upload an image to a channel (multipart/form-data).

**Request:**
```
Content-Type: multipart/form-data
Field: image (file)
```

---

### Events API

#### `GET /api/events`
Fetch all events.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Tech Talk: AI in Education",
    "location": "Aula Building",
    "event_date": "2025-02-15",
    "event_time": "18:00",
    "category": "Tech",
    "image": "/events/tech-talk.jpg",
    "likes": 15,
    "prosts": 3
  }
]
```

#### `POST /api/events`
Create a new event (admin only).

**Request:**
```json
{
  "title": "Tech Talk: AI",
  "location": "Aula",
  "event_date": "2025-02-15",
  "event_time": "18:00",
  "category": "Tech",
  "description": "Join us for...",
  "image": "/events/tech-talk.jpg",
  "publishToSocial": true,
  "selectedChannel": "campus-events-uuid",
  "publishToBanner": true
}
```

#### `POST /api/events/:id/reminder`
Create a reminder for an event.

**Request:**
```json
{
  "userId": "user-123",
  "hoursBefore": 24
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "user-123",
  "title": "Event starting soon: Tech Talk",
  "reminderTime": "2025-02-14T18:00:00Z",
  "source": "event",
  "sourceId": "event-uuid"
}
```

---

### Reminders API

#### `GET /api/reminders`
Fetch user reminders.

**Query Params:**
- `userId`: string (required)
- `status`: "active" | "completed" | "all"
- `today`: "true" | "false"

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "user-123",
    "title": "Assignment due tomorrow",
    "description": "Complete ML homework",
    "reminderTime": "2025-01-15T09:00:00Z",
    "completed": false,
    "recurrence": "once",
    "source": "study_plan",
    "createdAt": "2025-01-14T12:00:00Z"
  }
]
```

#### `POST /api/reminders`
Create a new reminder.

**Request:**
```json
{
  "userId": "user-123",
  "title": "Doctor appointment",
  "description": "Campus health center",
  "reminderTime": "2025-01-20T10:00:00Z",
  "recurrence": "once",
  "timezone": "Europe/Berlin"
}
```

#### `PATCH /api/reminders/:id`
Update a reminder.

**Request:**
```json
{
  "completed": true
}
```

#### `POST /api/reminders/snooze`
Snooze a reminder.

**Request:**
```json
{
  "reminderId": "uuid",
  "minutes": 10
}
```

#### `DELETE /api/reminders/:id`
Delete a reminder.

---

### Notifications API

#### `GET /api/notifications`
Fetch user notifications.

**Query Params:**
- `userId`: string (required)
- `unreadOnly`: "true" | "false"

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "user-123",
    "type": "channel_request_approved",
    "payload": {
      "channelName": "Study Group AI",
      "approvedBy": "admin"
    },
    "read": false,
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

#### `PATCH /api/notifications/mark-read`
Mark notifications as read.

**Request:**
```json
{
  "userId": "user-123",
  "notificationIds": ["uuid1", "uuid2"]
}
```

---

### Tickets API

#### `GET /api/tickets`
Fetch tickets.

**Query Params:**
- `userId`: string (optional, for user tickets)
- `status`: "open" | "in_progress" | "resolved" | "closed"

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "user-123",
    "title": "Need help with registration",
    "description": "I mentioned @admin in chat",
    "status": "open",
    "priority": "normal",
    "adminReply": null,
    "createdAt": "2025-01-15T11:00:00Z"
  }
]
```

#### `POST /api/tickets`
Create a ticket (auto-created on @admin mention).

**Request:**
```json
{
  "userId": "user-123",
  "channelId": "channel-uuid",
  "messageId": "message-uuid",
  "title": "@admin mention in Tivoli General",
  "description": "User needs help with...",
  "priority": "normal"
}
```

#### `PATCH /api/tickets/:id`
Update ticket (admin reply).

**Request:**
```json
{
  "status": "resolved",
  "adminReply": "Issue resolved. Try again now."
}
```

---

### Pixi Bot API

#### `POST /api/chat/pixi`
Query Pixi bot.

**Request:**
```json
{
  "query": "timetable monday",
  "userId": "user-123"
}
```

**Response:**
```json
{
  "response": "Here's your timetable for Monday:\n- 8:00 AM: Math Lecture (Room A101)\n- 10:00 AM: AI Lab (Room B205)"
}
```

**Supported Queries:**
- `timetable [day]` - Fetch timetable
- `exams` - Fetch upcoming exams
- `events` - Fetch upcoming events

---

## Database Schema

### Core Models

```prisma
model Event {
  id               String   @id @default(uuid()) @db.Uuid
  title            String
  location         String?
  event_date       DateTime?
  event_time       String?
  category         String?
  image            String?
  description      String?  @db.Text
  language         String?
  registrationInfo String?  @db.Text
  likes            Int      @default(0)
  prosts           Int      @default(0)
  publishToSocial  Boolean  @default(false)
  selectedChannel  String?  @db.Uuid
  publishToBanner  Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@map("events")
}

model Channel {
  id          String   @id @default(uuid()) @db.Uuid
  name        String
  slug        String   @unique
  description String?  @db.Text
  is_public   Boolean  @default(true)
  created_at  DateTime @default(now())

  @@map("channels")
}

model Message {
  id         String   @id @default(uuid()) @db.Uuid
  channelId  String   @db.Uuid
  userId     String
  body       String   @db.Text
  mentions   String[] @default([])
  images     String[] @default([])
  created_at DateTime @default(now())

  @@map("messages")
  @@index([channelId, created_at])
}

model Poll {
  id         String   @id @default(uuid()) @db.Uuid
  channelId  String   @db.Uuid
  question   String
  options    String[] @default([])
  votes      Int[]    @default([])
  closed     Boolean  @default(false)
  createdBy  String   @default("admin")
  created_at DateTime @default(now())

  @@map("polls")
}

model Reminder {
  id            String   @id @default(uuid()) @db.Uuid
  userId        String
  title         String
  description   String?  @db.Text
  reminderTime  DateTime
  completed     Boolean  @default(false)
  snoozedUntil  DateTime?
  recurrence    String?  // "once", "daily", "weekdays"
  source        String?  // "manual", "event", "study_plan"
  sourceId      String?  // Reference to event/session
  timezone      String   @default("Europe/Berlin")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("reminders")
  @@index([userId, reminderTime])
  @@index([userId, completed])
}

model Notification {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String
  type      String   // "channel_request_approved", "reminder", etc.
  payload   Json
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@map("notifications")
  @@index([userId, read])
}

model Ticket {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String
  channelId   String?  @db.Uuid
  messageId   String?  @db.Uuid
  title       String
  description String   @db.Text
  status      String   @default("open")
  priority    String   @default("normal")
  assignedTo  String?
  adminReply  String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("tickets")
  @@index([userId, status])
}
```

### Database Indexes

**Performance Optimization:**
- `messages`: Composite index on `(channelId, created_at)` for message fetching
- `reminders`: Indexes on `(userId, reminderTime)` and `(userId, completed)` for scheduler queries
- `notifications`: Index on `(userId, read)` for notification filtering
- `tickets`: Index on `(userId, status)` for ticket dashboard

---

## Socket.IO Events

### Client → Server Events

```typescript
// Join a channel
socket.emit('join_channel', channelId: string)

// Leave a channel
socket.emit('leave_channel', channelId: string)

// Send a message
socket.emit('message', {
  channelId: string,
  userId: string,
  body: string,
  mentions: string[]
})

// Auto-join all channels (students)
socket.emit('auto_join_channels', {
  userId: string,
  role: 'student' | 'admin'
})

// Vote on poll
socket.emit('poll:vote', {
  pollId: string,
  optionIndex: number,
  userId: string
})
```

### Server → Client Events

```typescript
// New message received
socket.on('message:new', {
  type: 'message:new',
  channelId: string,
  channelName: string,
  message: {
    id: string,
    userId: string,
    body: string,
    mentions: string[],
    created_at: string
  }
})

// Poll created
socket.on('poll:created', {
  type: 'poll:created',
  channelId: string,
  poll: Poll
})

// Poll updated (new votes)
socket.on('poll:updated', {
  type: 'poll:updated',
  pollId: string,
  votes: number[]
})

// User mentioned
socket.on('mention', {
  type: 'mention',
  channelId: string,
  messageId: string,
  mentionedBy: string
})

// Reminder triggered
socket.on('reminder:triggered', {
  type: 'reminder:triggered',
  id: string,
  title: string,
  description: string
})

// New ticket
socket.on('ticket:new', {
  type: 'ticket:new',
  ticket: Ticket
})
```

### Connection Flow

```typescript
// Client connection
const socket = io('ws://localhost:4001', {
  query: { userId: 'user-123' }
})

socket.on('connect', () => {
  console.log('[socket] connected')
  socket.emit('auto_join_channels', {
    userId: 'user-123',
    role: 'student'
  })
})

socket.on('disconnect', () => {
  console.log('[socket] disconnected')
})

socket.on('reconnect', (attemptNumber) => {
  console.log('[socket] reconnected after', attemptNumber, 'attempts')
})
```

---

## Authentication & Authorization

### Current Implementation (MVP)

**Simplified Auth:**
- User ID stored in localStorage
- Passed in API requests and socket connections
- No JWT/session validation (dev mode)

```typescript
// Store user
localStorage.setItem('userId', 'user-demo')
localStorage.setItem('userHandle', 'john_doe')

// Retrieve user
const userId = localStorage.getItem('userId') || 'user-demo'
```

### Production Considerations

**Recommended: Supabase Auth**
```typescript
import { supabase } from '@/integrations/supabase/client'

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@whz.de',
  password: 'password'
})

// Get user
const { data: { user } } = await supabase.auth.getUser()

// Middleware on API routes
const token = req.headers.authorization?.split(' ')[1]
const { data, error } = await supabase.auth.getUser(token)
```

### Role-Based Access Control (RBAC)

```typescript
// User roles
type Role = 'student' | 'admin' | 'kommpakt'

// Middleware example
async function requireAdmin(req, res, next) {
  const userId = req.query.userId || req.body.userId
  const user = await prisma.profile.findUnique({
    where: { userId }
  })

  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  next()
}
```

---

## Notification System

### 5-Channel Notification Architecture

```
Reminder Trigger
       │
       ├─► 1. Sound Alert (Audio)
       │       └─> plays /notification-sound.mp3
       │
       ├─► 2. Desktop Notification (Browser API)
       │       └─> Notification.requestPermission()
       │
       ├─► 3. Toast (In-app)
       │       └─> Sonner toast with actions
       │
       ├─► 4. Activity Feed (Persistent)
       │       └─> Socket.IO event
       │
       └─► 5. Push Notification (VAPID)
               └─> web-push library
```

### Implementation

**1. Sound Alert:**
```typescript
try {
  const audio = new Audio('/notification-sound.mp3')
  audio.volume = 0.5
  await audio.play()
} catch (e) {
  console.log('Audio play failed:', e)
}
```

**2. Desktop Notification:**
```typescript
if ('Notification' in window && Notification.permission === 'granted') {
  new Notification('⏰ Reminder', {
    body: reminder.title,
    icon: '/zwickly-icon.png',
    badge: '/badge-icon.png',
    tag: reminder.id,
    requireInteraction: true
  })
} else if (Notification.permission !== 'denied') {
  await Notification.requestPermission()
}
```

**3. Toast Notification:**
```typescript
toast.error(`⏰ ${reminder.title}`, {
  description: reminder.description,
  duration: 10000,
  action: {
    label: 'Snooze 10m',
    onClick: () => snoozeReminder(reminder.id, 10)
  },
  cancel: {
    label: 'Complete',
    onClick: () => completeReminder(reminder.id)
  }
})
```

**4. Activity Feed:**
```typescript
// Socket.IO emit
io.to(`user:${userId}`).emit('reminder:triggered', {
  type: 'reminder:triggered',
  id: reminder.id,
  title: reminder.title,
  description: reminder.description
})
```

**5. Push Notification (VAPID):**
```typescript
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:admin@zwickly.de',
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
)

const subscription = await prisma.pushSubscription.findFirst({
  where: { userId }
})

await webpush.sendNotification(subscription, JSON.stringify({
  title: reminder.title,
  body: reminder.description,
  icon: '/zwickly-icon.png'
}))
```

---

## Deployment

### Development

```bash
# Start all services
docker-compose up -d       # PostgreSQL
npm run dev                # Next.js API
npx tsx scripts/socket-server.ts  # Socket + Scheduler
cd frontend && npm run dev # React frontend
```

### Production Build

```bash
# Backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Docker Compose (Full Stack)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/app
    depends_on:
      - postgres

  socket:
    build: ./scripts
    ports:
      - "4001:4001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/app
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "8080:8080"
    depends_on:
      - backend
      - socket

volumes:
  pgdata:
```

### Environment Variables

**Production .env:**
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
NEXT_PUBLIC_SOCKET_URL="wss://socket.zwickly.de"
VAPID_PUBLIC="your-public-key"
VAPID_PRIVATE="your-private-key"
NODE_ENV="production"
```

---

## Performance Optimization

### Frontend Optimizations

**1. Code Splitting:**
```typescript
// Lazy load components
const Social = lazy(() => import('./pages/Social'))
const ChannelList = lazy(() => import('./components/social/ChannelList'))

<Suspense fallback={<div>Loading...</div>}>
  <Social />
</Suspense>
```

**2. Image Optimization:**
```typescript
// Use optimized images
<img
  src="/events/image.jpg"
  loading="lazy"
  decoding="async"
  width="400"
  height="300"
/>
```

**3. Debouncing:**
```typescript
const debouncedSearch = debounce((value: string) => {
  searchChannels(value)
}, 300)
```

### Backend Optimizations

**1. Database Queries:**
```typescript
// Use select to fetch only needed fields
const events = await prisma.event.findMany({
  select: {
    id: true,
    title: true,
    event_date: true,
    location: true
  }
})

// Use indexes for frequent queries
@@index([userId, createdAt])
```

**2. Connection Pooling:**
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=10'
    }
  }
})
```

**3. Caching:**
```typescript
// React Query caching
const { data: events } = useQuery({
  queryKey: ['events'],
  queryFn: fetchEvents,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000 // 10 minutes
})
```

---

## Security

### API Security

**1. CORS Configuration:**
```typescript
res.setHeader('Access-Control-Allow-Origin', '*')
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
```

**2. Input Validation:**
```typescript
if (!userId || typeof userId !== 'string') {
  return res.status(400).json({ error: 'Invalid userId' })
}

if (!reminderTime || isNaN(Date.parse(reminderTime))) {
  return res.status(400).json({ error: 'Invalid reminderTime' })
}
```

**3. SQL Injection Prevention:**
```typescript
// Prisma automatically parameterizes queries
const user = await prisma.user.findUnique({
  where: { id: userId } // Safe
})

// For raw queries, use parameterized queries
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE id = ${userId}
`
```

**4. XSS Prevention:**
```typescript
// React automatically escapes output
<div>{userInput}</div> // Safe

// For HTML rendering, use DOMPurify
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(userHTML)
```

### WebSocket Security

```typescript
// Validate socket connections
io.use((socket, next) => {
  const userId = socket.handshake.query.userId
  if (!userId) {
    return next(new Error('Authentication error'))
  }
  next()
})

// Room access control
socket.on('join_channel', async (channelId) => {
  const hasAccess = await checkChannelAccess(userId, channelId)
  if (hasAccess) {
    socket.join(`channel:${channelId}`)
  }
})
```

---

## Monitoring & Logging

### Backend Logging

```typescript
// Structured logging
console.log('[Reminder] Scheduler started')
console.log('[Socket] User connected:', userId)
console.error('[API] Error creating reminder:', error)

// Production: Use logging library
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

### Error Tracking

```typescript
// React Error Boundary
class SocialErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('[SocialWall] Error:', error, errorInfo)
    // Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>
    }
    return this.props.children
  }
}
```

---

**Document Version:** 1.0.0
**Last Updated:** October 2025
**Maintained by:** Zwickly Development Team

