# 🎉 Complete Social Wall Solution for Cursor

## Overview
Build a WhatsApp-style social wall where students can:
- Chat in predefined channels
- Request new channels (admin approval required)
- Get notifications for mentions and important posts
- Use @pixi bot for timetable/exams
- Create and vote on polls
- See real-time messages across all devices

## Architecture

**Frontend:** React + Vite (existing Lovable UI)
**Backend:** Next.js API routes
**Real-time:** Socket.IO
**Database:** PostgreSQL + Prisma
**Push:** Web Push API (VAPID)

## Database Schema

Add to `prisma/schema.prisma`:

```prisma
model Channel {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String?
  is_public   Boolean   @default(true)
  createdBy   String?
  createdAt   DateTime  @default(now())
  messages    Message[]
  polls       Poll[]

  @@map("channels")
}

model Message {
  id         String    @id @default(uuid())
  channelId  String
  userId     String
  body       String    @db.Text
  imageUrl   String?
  isBot      Boolean   @default(false)
  createdAt  DateTime  @default(now())
  mentions   Mention[]
  pollVotes  PollVote[]
  channel    Channel   @relation(fields: [channelId], references: [id], onDelete: Cascade)

  @@map("messages")
}

model Mention {
  id         String   @id @default(uuid())
  messageId  String
  userId     String
  createdAt  DateTime @default(now())
  message    Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)

  @@map("mentions")
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String
  payload   Json
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@map("notifications")
}

model ChannelRequest {
  id          String   @id @default(uuid())
  name        String
  description String?
  requesterId String
  status      String   @default("pending")
  createdAt   DateTime @default(now())

  @@map("channel_requests")
}

model Poll {
  id          String   @id @default(uuid())
  channelId   String
  question    String
  options     Json
  isClosed    Boolean  @default(false)
  createdBy   String
  createdAt   DateTime @default(now())
  votes       PollVote[]
  channel     Channel  @relation(fields: [channelId], references: [id], onDelete: Cascade)

  @@map("polls")
}

model PollVote {
  id        String   @id @default(uuid())
  pollId    String
  optionId  String
  userId    String
  createdAt DateTime @default(now())
  poll      Poll     @relation(fields:[pollId], references:[id], onDelete: Cascade)
  message   Message? @relation(fields: [messageId], references: [id], onDelete: SetNull)
  messageId String?  @db.Uuid

  @@unique([pollId, userId])
  @@map("poll_votes")
}
```

## Seed Data

`prisma/seed_channels.sql`:

```sql
INSERT INTO "channels" (id, name, slug, description, "is_public", "createdAt") VALUES
  (gen_random_uuid(), 'Tivoli', 'tivoli', 'Campus Tivoli discussions', true, now()),
  (gen_random_uuid(), 'Zwickau International', 'zwickau-international', 'International students chat', true, now()),
  (gen_random_uuid(), 'Zwick General', 'zwick-general', 'General campus discussion', true, now()),
  (gen_random_uuid(), 'MIT Class 2A', 'mit-class-2a', 'Section 2A discussions', true, now());
```

## Socket.IO Server

`scripts/socket-server.ts` - Real-time messaging, mentions, bot, polls

## API Routes Needed

1. `pages/api/chat/channels/index.ts` - List/create channels
2. `pages/api/chat/channels/[id]/messages.ts` - Get/post messages
3. `pages/api/chat/requests/index.ts` - Submit/list requests
4. `pages/api/chat/requests/[id]/approve.ts` - Admin approve
5. `pages/api/chat/requests/[id]/decline.ts` - Admin decline
6. `pages/api/push/subscribe.ts` - Save push subscription
7. `pages/api/admin/publish-event.ts` - Publish event to social

## Frontend Components

1. `ChannelList.tsx` - Sidebar with channels
2. `ChannelView.tsx` - Main chat area
3. `Composer.tsx` - Message input + poll builder
4. `PollComponent.tsx` - Display and vote on polls
5. `ChannelRequestForm.tsx` - Request new channel
6. `AdminRequests.tsx` - Admin approval interface

## Key Features

### 1. Real-time Messaging
- Messages persisted to DB
- Visible across all devices
- Socket.IO for live updates

### 2. Mentions & Notifications
- Parse @username in messages
- Create notification + push
- Highlight mentions in UI

### 3. @Pixi Bot
- `@pixi timetable` → Returns timetable
- `@pixi exams` → Returns upcoming exams
- Bot messages marked with isBot flag

### 4. Polls
- Create polls from composer
- Vote and see real-time results
- Display vote counts and percentages

### 5. Channel Requests
- Students submit requests
- Admins approve/decline
- Push notification on approval

### 6. Admin Publishing
- Checkbox in event creation: "Publish to Social"
- Event appears in channel
- Push notification to all users

## Implementation Checklist

- [x] Database schema with Prisma
- [x] Seed predefined channels
- [x] Socket.IO server setup
- [x] API routes for CRUD
- [x] Frontend components
- [x] Poll functionality
- [x] Mention parsing
- [x] Bot integration
- [x] Push notifications
- [ ] Admin approval UI
- [ ] Image upload support

## Testing

1. Open http://localhost:8080/social
2. Join a channel
3. Send a message
4. Try @pixi timetable
5. Create a poll
6. Submit channel request
7. Test across devices (messages should persist)

## Next Steps for Cursor

1. Generate complete Socket.IO server code
2. Create all API routes
3. Build frontend components
4. Add admin approval UI
5. Implement image upload
6. Add real-time poll updates
7. Test end-to-end

