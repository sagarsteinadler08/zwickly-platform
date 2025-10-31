# 🏛️ Zwickly Platform - System Design Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Component Design](#component-design)
4. [Data Flow](#data-flow)
5. [Scalability](#scalability)
6. [Performance](#performance)
7. [Security Design](#security-design)
8. [Design Decisions](#design-decisions)

---

## System Overview

### Vision
Create a unified digital platform for WHZ University that integrates academic tools, social collaboration, and administrative management into a seamless user experience.

### Goals
- **Centralization:** Single source of truth for campus information
- **Real-time:** Instant updates across all connected clients
- **Scalability:** Support growing user base and feature set
- **Reliability:** 99.9% uptime, graceful degradation
- **Accessibility:** WCAG AA+ compliant, inclusive design

### Non-Goals
- Mobile native apps (web-first approach)
- Video conferencing (integrate with existing tools)
- Payment processing (link to university systems)
- Course management (integrate with existing LMS)

---

## Architecture Patterns

### Microservices-Inspired Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React SPA (Vite)                                         │  │
│  │  - Component-based UI                                     │  │
│  │  - Client-side routing                                    │  │
│  │  - State management (Context + React Query)              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST + WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway Layer                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js API Routes                                       │  │
│  │  - RESTful endpoints                                      │  │
│  │  - Request validation                                     │  │
│  │  - CORS handling                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Business Logic Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Chat    │  │  Events  │  │ Reminder │  │  Ticket  │      │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Data Access Layer                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Prisma ORM                                               │  │
│  │  - Query builder                                          │  │
│  │  - Connection pooling                                     │  │
│  │  - Transaction management                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Database Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL 15+                                           │  │
│  │  - ACID compliance                                        │  │
│  │  - Full-text search                                       │  │
│  │  - JSONB support                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Real-time Event Layer                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Socket.IO Server                                         │  │
│  │  - WebSocket connections                                  │  │
│  │  - Room-based broadcasting                                │  │
│  │  - Event routing                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       Background Jobs Layer                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Reminder Scheduler                                       │  │
│  │  - Cron-like execution (60s interval)                     │  │
│  │  - Due reminder detection                                 │  │
│  │  - Multi-channel notification dispatch                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Event-Driven Architecture

```
┌─────────────┐                  ┌─────────────┐
│   Client    │◄─────events──────►│  Socket.IO  │
│  (Browser)  │                   │   Server    │
└─────────────┘                   └─────────────┘
       │                                 │
       │ HTTP requests                   │ DB queries
       ▼                                 ▼
┌─────────────┐                   ┌─────────────┐
│  Next.js    │◄────triggers──────►│  Scheduler  │
│   API       │                    │   (60s)     │
└─────────────┘                    └─────────────┘
       │                                 │
       └─────────► PostgreSQL ◄──────────┘
```

**Event Flow Example (New Message):**
1. User types message in frontend
2. Frontend emits `message` event to Socket.IO
3. Socket.IO server:
   - Validates message
   - Saves to database via Prisma
   - Detects @mentions
   - Creates notifications for mentioned users
   - If @admin → creates ticket
   - If @pixi → queries bot API
   - Broadcasts to channel room
4. All connected clients in room receive `message:new` event
5. Clients update UI in real-time

---

## Component Design

### Frontend Component Hierarchy

```
App (Root)
├── ThemeProvider (Context)
│   └── QueryClientProvider (React Query)
│       └── SocketProvider (Context)
│           └── TooltipProvider (Shadcn)
│               └── Router
│                   ├── Layout
│                   │   ├── Navbar
│                   │   │   ├── Logo
│                   │   │   ├── NavLinks
│                   │   │   ├── Search
│                   │   │   ├── ThemeToggle (NEW)
│                   │   │   └── NotificationCenter
│                   │   └── Sidebar (Admin)
│                   ├── Pages
│                   │   ├── Index (Home)
│                   │   │   ├── CarouselSection
│                   │   │   ├── GreetingSection
│                   │   │   ├── WalletCard
│                   │   │   ├── TimetableCard
│                   │   │   ├── ActivityFeed (NEW)
│                   │   │   ├── ReminderWidget (NEW)
│                   │   │   ├── NoteTaker (NEW)
│                   │   │   ├── StudyPlanner (NEW)
│                   │   │   ├── CalendarWidget
│                   │   │   └── TrendingEvents
│                   │   ├── Social
│                   │   │   ├── ChannelList
│                   │   │   ├── MessageList
│                   │   │   ├── MessageComposer
│                   │   │   ├── PollView
│                   │   │   └── EventMessage
│                   │   ├── Events
│                   │   │   ├── EventFilters
│                   │   │   ├── EventCard (with Remind Me)
│                   │   │   └── EventDetailModal
│                   │   ├── Chatbot
│                   │   │   ├── ChatBubble
│                   │   │   └── QuickReplies
│                   │   └── Admin/*
│                   │       ├── AdminHome
│                   │       ├── EventManagement
│                   │       └── SocialAdmin
│                   └── UI Components (Shadcn)
│                       ├── Button
│                       ├── Input
│                       ├── Textarea
│                       ├── Select
│                       ├── Dialog
│                       └── Card
```

### Backend Service Layer

```
API Routes
├── /api/chat
│   ├── channels/
│   │   ├── GET    - List channels
│   │   ├── POST   - Create channel
│   │   ├── /:id/
│   │   │   ├── messages/
│   │   │   │   ├── GET  - List messages
│   │   │   │   └── POST - Send message
│   │   │   ├── polls/
│   │   │   │   ├── GET  - List polls
│   │   │   │   ├── POST - Create poll
│   │   │   │   └── /:pollId/vote POST
│   │   │   └── images/
│   │   │       ├── GET  - List images
│   │   │       └── POST - Upload image
│   ├── requests/
│   │   ├── GET    - List requests
│   │   ├── POST   - Create request
│   │   └── /:id/
│   │       ├── approve POST
│   │       └── decline POST
│   └── pixi POST  - Bot queries
├── /api/events
│   ├── GET    - List events
│   ├── POST   - Create event
│   ├── /:id
│   │   ├── GET    - Get event
│   │   ├── PATCH  - Update event
│   │   ├── DELETE - Delete event
│   │   └── reminder POST - Create reminder
├── /api/reminders
│   ├── GET    - List reminders
│   ├── POST   - Create reminder
│   ├── /:id
│   │   ├── PATCH  - Update reminder
│   │   └── DELETE - Delete reminder
│   └── snooze POST - Snooze reminder
├── /api/notifications
│   ├── GET    - List notifications
│   └── mark-read PATCH
└── /api/tickets
    ├── GET    - List tickets
    ├── POST   - Create ticket
    └── /:id PATCH - Update ticket
```

---

## Data Flow

### Read Flow (GET Request)

```
1. User Action
   └─> Component calls API
       └─> React Query (cache check)
           ├─> Cache Hit → Return cached data
           └─> Cache Miss
               └─> HTTP GET /api/events
                   └─> Next.js API Route
                       └─> Prisma Query
                           └─> PostgreSQL
                               └─> Return data
                                   └─> Cache in React Query
                                       └─> Update UI
```

### Write Flow (POST Request)

```
1. User Action (e.g., send message)
   └─> Component calls API
       └─> HTTP POST /api/chat/channels/:id/messages
           └─> Next.js API Route
               ├─> Validate input
               ├─> Check permissions
               └─> Prisma Create
                   └─> PostgreSQL INSERT
                       └─> Return new record
                           ├─> Emit Socket.IO event
                           │   └─> Broadcast to room
                           │       └─> All clients receive
                           │           └─> Update UI
                           └─> Return HTTP 201
                               └─> Invalidate cache
                                   └─> Refetch data
```

### Real-time Flow (WebSocket)

```
1. Client A sends message
   └─> Socket.emit('message', data)
       └─> Socket.IO Server
           ├─> Save to database
           ├─> Check for @mentions
           │   ├─> Create notifications
           │   └─> If @admin → create ticket
           └─> io.to(channelId).emit('message:new', data)
               └─> All clients in room
                   ├─> Client A (confirmation)
                   ├─> Client B (new message)
                   └─> Client C (new message)
                       └─> Update UI
                           └─> Play sound
                               └─> Show toast
```

### Reminder Trigger Flow

```
Every 60 seconds:
1. Scheduler wakes up
   └─> Query database for due reminders
       └─> WHERE reminderTime <= now
           AND completed = false
           AND (snoozedUntil IS NULL OR snoozedUntil <= now)
           └─> For each due reminder:
               ├─> 1. Create notification in DB
               ├─> 2. Play sound alert
               ├─> 3. Show desktop notification
               ├─> 4. Show toast
               ├─> 5. Emit Socket.IO event
               │       └─> io.to(`user:${userId}`).emit('reminder:triggered')
               ├─> 6. Send push notification (VAPID)
               └─> 7. Handle recurrence
                   ├─> Once → mark complete
                   ├─> Daily → create next day
                   └─> Weekdays → create next weekday
```

---

## Scalability

### Horizontal Scaling Strategy

```
                    Load Balancer (Nginx)
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   Instance 1          Instance 2          Instance 3
   ┌────────┐         ┌────────┐          ┌────────┐
   │Frontend│         │Frontend│          │Frontend│
   │Backend │         │Backend │          │Backend │
   │Socket  │         │Socket  │          │Socket  │
   └────────┘         └────────┘          └────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                  Database Cluster
                  ┌─────────────────┐
                  │  Primary (Write)│
                  └─────────────────┘
                         │
                ┌────────┴────────┐
                ▼                 ▼
         ┌──────────┐      ┌──────────┐
         │ Read 1   │      │ Read 2   │
         └──────────┘      └──────────┘
```

**Scaling Frontend:**
- Static asset CDN (CloudFront, Cloudflare)
- Build-time rendering for public pages
- Client-side caching (React Query)

**Scaling Backend:**
- Stateless API servers (easy horizontal scaling)
- Sticky sessions for Socket.IO (Nginx ip_hash)
- Redis adapter for Socket.IO (cross-server communication)

**Scaling Database:**
- Read replicas for queries
- Primary for writes
- Connection pooling (Prisma)
- Prepared statements

**Scaling Socket.IO:**
```typescript
// Use Redis adapter for multi-server
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'

const pubClient = createClient({ url: 'redis://localhost:6379' })
const subClient = pubClient.duplicate()

io.adapter(createAdapter(pubClient, subClient))
```

---

## Performance

### Database Optimization

**Indexing Strategy:**
```sql
-- Frequently queried columns
CREATE INDEX idx_messages_channel_time
  ON messages(channel_id, created_at DESC);

CREATE INDEX idx_reminders_user_time
  ON reminders(user_id, reminder_time);

CREATE INDEX idx_notifications_user_read
  ON notifications(user_id, read);

-- Full-text search
CREATE INDEX idx_events_fulltext
  ON events USING GIN(to_tsvector('english', title || ' ' || description));
```

**Query Optimization:**
```typescript
// Bad: N+1 query problem
const channels = await prisma.channel.findMany()
for (const channel of channels) {
  channel.messages = await prisma.message.findMany({
    where: { channelId: channel.id }
  })
}

// Good: Single query with include
const channels = await prisma.channel.findMany({
  include: {
    messages: {
      take: 50,
      orderBy: { created_at: 'desc' }
    }
  }
})
```

**Connection Pooling:**
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=10&pool_timeout=20'
    }
  }
})
```

### Frontend Optimization

**Code Splitting:**
```typescript
// Route-based splitting
const Social = lazy(() => import('./pages/Social'))
const Events = lazy(() => import('./pages/Events'))

// Component-based splitting
const HeavyComponent = lazy(() => import('./components/HeavyComponent'))
```

**Memoization:**
```typescript
// Expensive computation
const sortedEvents = useMemo(() => {
  return events.sort((a, b) =>
    new Date(b.event_date) - new Date(a.event_date)
  )
}, [events])

// Callback stability
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

**Image Optimization:**
```typescript
// Lazy loading
<img src="/events/image.jpg" loading="lazy" />

// WebP with fallback
<picture>
  <source srcset="/events/image.webp" type="image/webp" />
  <img src="/events/image.jpg" alt="Event" />
</picture>
```

**Debouncing:**
```typescript
const debouncedSearch = useMemo(
  () => debounce((value: string) => {
    searchAPI(value)
  }, 300),
  []
)
```

### Caching Strategy

**Client-Side (React Query):**
```typescript
const { data: events } = useQuery({
  queryKey: ['events'],
  queryFn: fetchEvents,
  staleTime: 5 * 60 * 1000,    // 5 min
  cacheTime: 10 * 60 * 1000,   // 10 min
  refetchOnWindowFocus: false
})
```

**Server-Side (Redis - Future):**
```typescript
// Cache frequent queries
const cachedEvents = await redis.get('events:all')
if (cachedEvents) {
  return JSON.parse(cachedEvents)
}

const events = await prisma.event.findMany()
await redis.set('events:all', JSON.stringify(events), 'EX', 300) // 5 min
```

---

## Security Design

### Threat Model

**Assets:**
- User data (profiles, messages, reminders)
- Event information
- Admin credentials
- Database access

**Threats:**
- SQL injection
- XSS attacks
- CSRF attacks
- DDoS attacks
- Unauthorized access
- Data leaks

### Security Controls

**1. Input Validation:**
```typescript
// API route validation
if (!userId || typeof userId !== 'string') {
  return res.status(400).json({ error: 'Invalid userId' })
}

if (title.length > 200) {
  return res.status(400).json({ error: 'Title too long' })
}

// Prisma automatically sanitizes
const user = await prisma.user.findUnique({
  where: { id: userId } // Safe from SQL injection
})
```

**2. Authentication (Production):**
```typescript
// JWT verification
import jwt from 'jsonwebtoken'

async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' })
  }
}
```

**3. Authorization (RBAC):**
```typescript
// Role-based middleware
async function requireAdmin(req, res, next) {
  const user = await prisma.profile.findUnique({
    where: { id: req.userId }
  })

  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  next()
}

// Usage
app.post('/api/events', verifyToken, requireAdmin, createEvent)
```

**4. Rate Limiting:**
```typescript
import rateLimit from 'express-rate-limit'

const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: 'Too many messages, slow down!'
})

app.post('/api/chat/channels/:id/messages', messageLimiter, sendMessage)
```

**5. HTTPS/WSS:**
```typescript
// Production configuration
const httpsOptions = {
  key: fs.readFileSync('ssl/key.pem'),
  cert: fs.readFileSync('ssl/cert.pem')
}

const httpsServer = https.createServer(httpsOptions, app)
const io = new Server(httpsServer, {
  cors: {
    origin: 'https://zwickly.de',
    credentials: true
  }
})
```

**6. Content Security Policy:**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ]
  }
}
```

---

## Design Decisions

### 1. Why Next.js for Backend?

**Pros:**
- ✅ Unified TypeScript codebase
- ✅ API routes built-in
- ✅ Easy deployment (Vercel)
- ✅ Server-side rendering ready
- ✅ File-based routing

**Cons:**
- ❌ Not as lightweight as Express
- ❌ Opinionated structure

**Decision:** Next.js chosen for rapid development and type safety.

---

### 2. Why PostgreSQL?

**Pros:**
- ✅ ACID compliance
- ✅ Rich data types (JSONB, arrays)
- ✅ Full-text search
- ✅ Mature ecosystem
- ✅ Open source

**Cons:**
- ❌ Scaling writes (mitigated with read replicas)

**Decision:** PostgreSQL for reliability and feature set.

---

### 3. Why Prisma ORM?

**Pros:**
- ✅ Type-safe queries
- ✅ Auto-generated types
- ✅ Migration system
- ✅ Great DX
- ✅ Connection pooling

**Cons:**
- ❌ Query performance overhead (minimal)
- ❌ Limited raw SQL flexibility

**Decision:** Prisma for developer productivity and type safety.

---

### 4. Why Socket.IO?

**Pros:**
- ✅ Automatic reconnection
- ✅ Room support
- ✅ Fallback to polling
- ✅ Binary data support
- ✅ Cross-platform

**Cons:**
- ❌ Larger bundle size vs raw WebSocket
- ❌ Custom protocol (not standard WebSocket)

**Decision:** Socket.IO for reliability and ease of use.

---

### 5. Why TailwindCSS?

**Pros:**
- ✅ Utility-first approach
- ✅ Fast development
- ✅ Purged CSS (small bundle)
- ✅ Design system built-in
- ✅ Great documentation

**Cons:**
- ❌ Verbose HTML
- ❌ Learning curve

**Decision:** Tailwind for rapid UI development and consistency.

---

### 6. Why Client-Side Rendering?

**Pros:**
- ✅ Rich interactivity
- ✅ Real-time updates
- ✅ Offline capabilities (PWA)
- ✅ Reduced server load

**Cons:**
- ❌ SEO challenges (mitigated with SSR for public pages)
- ❌ Initial load time

**Decision:** CSR for app-like experience, SSR for landing pages.

---

### 7. Why Reminder Scheduler (60s interval)?

**Alternatives Considered:**
- Cron jobs (separate process)
- Database triggers (complex)
- Message queue (BullMQ, Redis) (overkill for MVP)

**Decision:** Simple setInterval for MVP, easy to migrate to queue later.

---

### 8. Why 5 Notification Channels?

**Rationale:**
- Users have different preferences
- Some channels fail (permissions, network)
- Redundancy ensures delivery
- Rich user experience

**Channels:**
1. Sound - Immediate attention
2. Desktop - Works when tab inactive
3. Toast - In-app confirmation
4. Activity Feed - Persistent record
5. Push - Works when app closed

---

## Future Improvements

### Short-term (3-6 months)
- [ ] Implement proper authentication (JWT)
- [ ] Add Redis caching layer
- [ ] Migrate scheduler to BullMQ
- [ ] Implement rate limiting
- [ ] Add error tracking (Sentry)
- [ ] Optimize images (WebP, CDN)

### Medium-term (6-12 months)
- [ ] Mobile apps (React Native)
- [ ] Offline mode (PWA)
- [ ] File sharing in chat
- [ ] Video calls (WebRTC)
- [ ] Advanced analytics
- [ ] Calendar sync (Google, Outlook)

### Long-term (12+ months)
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] GraphQL API
- [ ] Machine learning features (smart notifications, study recommendations)
- [ ] Multi-university support
- [ ] API marketplace

---

**Document Version:** 1.0.0
**Last Updated:** October 2025
**Author:** Zwickly Architecture Team

