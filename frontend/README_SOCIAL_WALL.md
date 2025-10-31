# Social Wall - Development & Testing Guide

## Overview

The Social Wall is a real-time chat feature for the Zwickly student platform, enabling students to communicate in channels, vote on polls, upload images, and interact with the Pixi AI assistant.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running (via Docker Compose)
- Backend API running on `http://localhost:3000`
- Socket.IO server running on `ws://localhost:4001`

### Development Setup

1. **Start Backend Services** (from project root):
   ```bash
   # Start database
   docker-compose up -d

   # Start Next.js API + Socket.IO
   cd zwickly-local-merged
   npm run dev
   ```

2. **Start Frontend** (from frontend directory):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access the Social Wall**:
   - Student Portal: `http://localhost:8080/social`
   - Admin Portal: `http://localhost:8080/admin/social`

## Environment Variables

Create `frontend/.env.local` with:
```bash
VITE_SOCIAL_WALL_ENABLED=true
VITE_SOCKET_URL=ws://localhost:4001
VITE_API_URL=http://localhost:3000
```

## Features

### Current Features
- ✅ Channel listing and selection
- ✅ Real-time messaging via Socket.IO
- ✅ Poll creation and voting
- ✅ Image uploads
- ✅ @admin mention → ticket creation
- ✅ @pixi bot commands
- ✅ Unread badges
- ✅ Push notifications

### Planned Enhancements
- 🔄 Message pagination
- 🔄 Offline queue with retry
- 🔄 Deduplication
- 🔄 Presence indicators
- 🔄 Advanced search

## Testing

### Manual Test Checklist

1. **Channel List**
   - [ ] Channels load on page load
   - [ ] Search filters channels
   - [ ] Click channel selects it
   - [ ] Request new channel opens form
   - [ ] Submit request shows success toast

2. **Messages**
   - [ ] Messages load from API
   - [ ] New messages appear in real-time
   - [ ] Can send text message
   - [ ] Can upload image
   - [ ] @admin creates ticket
   - [ ] @pixi triggers bot response

3. **Polls**
   - [ ] Polls load for channel
   - [ ] Can vote on poll
   - [ ] Results update in real-time
   - [ ] Cannot double-vote

4. **Edge Cases**
   - [ ] Network disconnection → reconnects
   - [ ] 404 from API → fallback stub
   - [ ] Large file upload → shows error
   - [ ] Rate limit → shows countdown

### Unit Tests

```bash
cd frontend
npm test
```

## Architecture

### Components
- `Social.tsx` - Main page container
- `ChannelList.tsx` - Channel sidebar
- `MessageList.tsx` - Message feed
- `MessageComposer.tsx` - Input area
- `PollView.tsx` - Poll display
- `NotificationToast.tsx` - Toast notifications

### Hooks
- `useSocket.ts` - Socket.IO connection management

### APIs
- `/api/chat/channels` - Channel CRUD
- `/api/chat/channels/:id/messages` - Message CRUD
- `/api/chat/channels/:id/polls` - Poll CRUD
- `/api/chat/requests` - Channel requests
- `/api/tickets` - Support tickets
- `/api/push/subscribe` - Push notifications

### Socket Events
- `auto_join_channels` - Auto-join all channels
- `join_channel` - Join specific channel
- `leave_channel` - Leave channel
- `message:create` - Send message
- `message:new` - Receive new message
- `message:confirmed` - Server confirmed message
- `poll:updated` - Poll results updated
- `channel:deleted` - Channel was deleted
- `ticket:new` - New ticket created

## Debugging

### Common Issues

**Channels not loading**
- Check API is running: `curl http://localhost:3000/api/chat/channels`
- Check Vite proxy config in `vite.config.ts`

**Socket not connecting**
- Check Socket.IO server: `curl http://localhost:4001`
- Check browser console for WebSocket errors
- Verify `VITE_SOCKET_URL` in `.env.local`

**Messages not appearing**
- Check Socket.IO connection status (green/red indicator)
- Check browser console for `message:new` events
- Verify user is in correct channel room

**Upload fails**
- Check file size (max 5MB)
- Check file type (jpeg/png/webp only)
- Check server logs for errors

### Logs

**Backend logs**: `/tmp/zwickly-full-test.log`
**Frontend logs**: Browser DevTools Console
**Socket.IO logs**: Check server terminal output

## Design System

### Colors
- Primary: `#7B5CFA` (purple)
- Secondary: `#48E0E4` (cyan)
- Background: Gradient `from-[#7B5CFA] to-[#48E0E4]`

### Spacing
- Uses 8px grid system
- Padding: `8px, 16px, 24px, 32px`

### Typography
- Headers: Bold, gradient text
- Body: Regular weight
- Labels: Smaller, muted color

## Performance

- Lazy load components on route change
- Debounce search input (300ms)
- Virtual scrolling for long message lists (planned)
- Image lazy loading (planned)

## Security

- All messages sanitized before rendering
- Rate limiting on message send
- File upload validation (type, size)
- CORS configured for local development

## Contributing

1. Create feature branch: `git checkout -b feature/social-enhance/X-name`
2. Make changes following coding standards
3. Add tests
4. Commit with descriptive message
5. Push and create PR

## License

All rights reserved.

