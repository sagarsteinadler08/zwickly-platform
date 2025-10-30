# 🎉 Social Wall + Real-time Chat + Bot Feature

Complete setup guide for the new social chat feature with @pixi bot.

## 📋 What's Included

- ✅ **Real-time chat** with Socket.IO
- ✅ **Mention system** with @username notifications
- ✅ **Pixi bot** responding to commands
- ✅ **Push notifications** for mentions
- ✅ **Multiple channels** for organization
- ✅ **iOS glassmorphism design** throughout

## 🚀 Setup Instructions

### 1. Install Dependencies (if needed)

```bash
npm install
```

### 2. Run Database Migrations

```bash
# Generate Prisma client with new models
npx prisma generate

# Create tables (Channel, Message, Mention, Notification)
npx prisma migrate dev --name add-social-chat
```

### 3. Seed Default Channels

```bash
# Add default channels
docker exec -i zwickly-local-merged-db-1 psql -U postgres -d app < prisma/seed_channels.sql
```

Or manually:

```bash
psql $DATABASE_URL < prisma/seed_channels.sql
```

### 4. Update Environment Variables

Add to your `.env.local`:

```env
# Socket.IO Configuration
WS_PORT=4001

# VAPID Keys (already generated in setup.sh)
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key

# Frontend Socket URL (for frontend)
VITE_SOCKET_URL=http://localhost:4001
```

### 5. Start Servers

```bash
# Start Socket.IO server + Next.js backend + Frontend
npm run dev
```

This runs:
- Socket.IO server on port `4001`
- Next.js API on port `3000`
- Frontend on port `8080`

### 6. Access Social Wall

Open: **http://localhost:8080/social**

## 🎮 How to Use

### Chat Channels

1. **Select a channel** from the left sidebar
2. **Type a message** in the composer
3. **Mention users** with `@username` for notifications
4. **Use @pixi commands** for bot responses

### Pixi Bot Commands

- **@pixi timetable** - View your schedule
- **@pixi exams** - View upcoming exams
- **@pixi events** - View campus events
- **@pixi** (alone) - Get help

### Mention Notifications

When someone mentions you:
- ✅ In-app notification appears
- ✅ Push notification sent (if subscribed)
- ✅ Notification badge updates
- ✅ Click notification to view

## 🔧 Technical Details

### Database Models

- **Channel** - Chat channels
- **Message** - Chat messages
- **Mention** - User mentions in messages
- **Notification** - In-app notifications
- **PushSubscription** - Web push subscriptions

### API Endpoints

- `GET /api/chat/channels` - List channels
- `GET /api/chat/channels/:id/messages` - Get messages
- `POST /api/chat/channels/:id/messages` - Create message
- `POST /api/push/subscribe` - Subscribe to push

### Socket.IO Events

**Client → Server:**
- `join_channel` - Join a channel room
- `leave_channel` - Leave a channel room
- `message:create` - Send a new message

**Server → Client:**
- `message:new` - New message in channel
- `notification:new` - New notification for user

### Frontend Components

- `ChannelList` - Channel sidebar
- `ChannelView` - Main chat area
- `Composer` - Message input
- `useSocket` - Socket.IO hook

## 🎨 Design Features

- **Glass morphism** cards and inputs
- **Gradient buttons** with hover effects
- **Real-time updates** with Socket.IO
- **Notification badges** with pulse animation
- **Bot messages** highlighted differently

## 🔒 Security Notes

- Socket authentication via `userId` in handshake
- User mentions validated against database
- Bot responses are read-only
- Push notifications require subscription

## 📱 Testing

### Test Basic Chat

1. Open http://localhost:8080/social
2. Select "General" channel
3. Type a message and send
4. Message appears immediately

### Test Mentions

1. Type `@user-123` in a message
2. Notification created for mentioned user
3. Push notification sent (if subscribed)

### Test Pixi Bot

1. Type `@pixi timetable`
2. Bot responds with schedule
3. Try `@pixi exams` and `@pixi events`

### Test Notifications

1. Have two browser windows open
2. Mention yourself in one window
3. See notification appear in other window

## 🐛 Troubleshooting

### Socket not connecting

- Check if Socket.IO server is running on port 4001
- Verify `VITE_SOCKET_URL` in frontend `.env`
- Check browser console for connection errors

### Messages not appearing

- Verify Prisma migration ran successfully
- Check database tables exist
- Review Socket.IO server logs

### Bot not responding

- Check server logs for errors
- Verify database has timetable/exams/events data
- Test with exact command: `@pixi timetable`

### Push notifications not working

- Verify VAPID keys are set in `.env.local`
- Check browser permission for notifications
- Test push subscription endpoint

## 📊 Default Channels

After seeding, you'll have:
- **General** - General campus discussions
- **Announcements** - Official announcements
- **Study Group** - Find study partners
- **Jobs & Internships** - Job postings
- **Events** - Campus events

## 🚀 Next Steps

- Add user authentication integration
- Customize bot responses
- Add emoji reactions
- Create private channels
- Add file uploads

## 📝 Notes

- All components preserve existing UI styling
- Socket.IO runs alongside existing ws-server
- Database migrations are additive (no data loss)
- Fully compatible with existing features

Enjoy your social wall! 🎉

