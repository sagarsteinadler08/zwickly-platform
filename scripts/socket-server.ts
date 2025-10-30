/**
 * Simple Socket.IO server with Prisma integration, mention parsing,
 * @pixi bot stubs for `timetable` and `exams`, push notifications via web-push.
 */
import { createServer } from 'http'
import { Server } from 'socket.io'
import webpush from 'web-push'
import { PrismaClient } from '@prisma/client'
import startReminderScheduler from './reminder-scheduler.js'

const prisma = new PrismaClient()

const PORT = Number(process.env.SOCIAL_SOCKET_PORT || 4001)
const VAPID_PUBLIC = process.env.VAPID_PUBLIC || process.env.NEXT_PUBLIC_VAPID_PUBLIC
const VAPID_PRIVATE = process.env.VAPID_PRIVATE

if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  console.warn('VAPID keys missing; push notifications disabled until keys are provided.')
} else {
  webpush.setVapidDetails('mailto:dev@example.com', VAPID_PUBLIC, VAPID_PRIVATE)
}

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
})

function parseMentions(text: string) {
  const regex = /@([a-zA-Z0-9_.-]+)/g
  const mentions = []
  let m
  while ((m = regex.exec(text)) !== null) {
    mentions.push(m[1])
  }
  return mentions
}

async function sendPushToUserId(userId: string, payload: any) {
  try {
    const subs = await prisma.pushSubscription.findMany({ where: {} })
    for (const s of subs) {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: s.keys as any },
        JSON.stringify(payload)
      ).catch(err => {
        console.warn('push err', err?.statusCode || err?.message || err)
      })
    }
  } catch (e) {
    console.error('sendPush error', e)
  }
}

async function handlePixiCommand(command: string, userId: string, channelId: string) {
  const cmd = command.toLowerCase().trim()
  if (cmd.includes('timetable')) {
    const rows = await prisma.$queryRaw`SELECT * FROM "timetable" LIMIT 10`
    const body = `📅 Pixi: Here is your timetable:\n${JSON.stringify(rows).slice(0, 500)}`
    return body
  } else if (cmd.includes('exams')) {
    const rows = await prisma.$queryRaw`SELECT * FROM "exams" LIMIT 10`
    const body = `📝 Pixi: Upcoming exams:\n${JSON.stringify(rows).slice(0, 500)}`
    return body
  } else {
    return `👋 Hi! I'm Pixi. Try: @pixi timetable or @pixi exams`
  }
}

io.on("connection", (socket) => {
  console.log('[socket] client connected:', socket.id);

  // Auth: get userId from handshake
  const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
  if (!userId || typeof userId !== 'string') {
    console.log('[socket] no userId, disconnecting');
    socket.disconnect();
    return;
  }

  console.log('[socket] authenticated user:', userId);
  socket.join(`user:${userId}`);
  
  // Auto-join all channels for logged-in users
  socket.on("auto_join_channels", async () => {
    try {
      const channels = await prisma.channel.findMany();
      for (const ch of channels) {
        socket.join(`channel:${ch.id}`);
      }
      console.log('[socket] auto-joined all channels for:', userId);
    } catch (err) {
      console.error('[auto_join] error:', err);
    }
  });

  // Join channel
  socket.on("join_channel", async (channelId: string) => {
    socket.join(`channel:${channelId}`);
    console.log('[socket] user joined channel:', channelId);
  });

  // Leave channel
  socket.on("leave_channel", (channelId: string) => {
    socket.leave(`channel:${channelId}`);
    console.log('[socket] user left channel:', channelId);
  });

  // Create message
  socket.on("message:create", async (payload: { channelId: string; body: string }) => {
    try {
      console.log('[socket] message:create', payload);

      // Create message
      const message = await prisma.message.create({
        data: {
          channelId: payload.channelId,
          userId,
          body: payload.body,
        },
        include: { mentions: true },
      });

      // Parse mentions
      const mentionRegex = /@([a-z0-9_.-]+)/gi;
      const mentions: string[] = [];
      let m;
      while ((m = mentionRegex.exec(payload.body)) !== null) {
        mentions.push(m[1]);
      }

      // Process mentions (create mention records, notifications, push)
      for (const username of mentions) {
        try {
          // Check if it's @admin mention - create ticket
          if (username.toLowerCase() === 'admin') {
            // Create ticket for @admin mentions
            const ticket = await prisma.ticket.create({
              data: {
                userId,
                channelId: payload.channelId,
                messageId: message.id,
                title: `Support Request from ${userId}`,
                description: payload.body,
                status: 'open',
                priority: 'normal',
              },
            });

            // Notify admins about new ticket
            io.to('admin:all').emit("ticket:new", {
              id: ticket.id,
              userId,
              title: ticket.title,
              description: ticket.description,
              createdAt: ticket.createdAt,
            });

            // Create notification for the user
            await prisma.notification.create({
              data: {
                userId,
                type: "ticket_created",
                payload: {
                  ticketId: ticket.id,
                  messageId: message.id,
                  channelId: payload.channelId,
                  message: "Your support ticket has been created",
                },
              },
            });

            // Create notification for admin
            await prisma.notification.create({
              data: {
                userId: 'admin',
                type: "admin_ticket_new",
                payload: {
                  ticketId: ticket.id,
                  messageId: message.id,
                  channelId: payload.channelId,
                  userId: userId,
                  message: `New support ticket from ${userId}`,
                },
              },
            });

            continue; // Skip regular mention processing for @admin
          }

          // Try to find user by email (adjust based on your Profile model)
          const user = await prisma.profile.findUnique({ where: { email: username } });
          
          if (user) {
            // Create mention
            await prisma.mention.create({
              data: {
                messageId: message.id,
                userId: user.id,
              },
            });

            // Create notification
            const notification = await prisma.notification.create({
              data: {
                userId: user.id,
                type: "mention",
                payload: {
                  messageId: message.id,
                  channelId: payload.channelId,
                  text: payload.body,
                  fromUserId: userId,
                },
              },
            });

            // Emit in-app notification
            io.to(`user:${user.id}`).emit("notification:new", {
              id: notification.id,
              type: "mention",
              messageId: message.id,
              channelId: payload.channelId,
              text: payload.body,
              createdAt: notification.createdAt,
            });

            // Send push notifications
            const subs = await prisma.pushSubscription.findMany({
              where: { },
            });

            for (const sub of subs) {
            try {
              await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: sub.keys as any },
                JSON.stringify({
                  title: "You were mentioned",
                  body: `${userId} mentioned you`,
                  data: { messageId: message.id, channelId: payload.channelId },
                })
              );
            } catch (err: any) {
              console.error('[push] failed:', err);
            }
            }
          }
        } catch (err) {
          console.error('[mention] error:', err);
        }
      }

      // Get channel info for activity feed
      const channel = await prisma.channel.findUnique({
        where: { id: payload.channelId },
      });

      // Broadcast message to channel
      io.to(`channel:${payload.channelId}`).emit("message:new", {
        type: 'message:new',
        channelId: payload.channelId,
        channelName: channel?.name || 'channel',
        message: {
          ...message,
          userId,
        },
      });

      // Check for @pixi bot command
      const pixiRegex = /@pixi\b/i;
      if (pixiRegex.test(payload.body)) {
        handlePixiBot(payload.channelId, payload.body, userId);
      }
    } catch (err) {
      console.error('[message:create] error:', err);
      socket.emit("message:error", { message: "Failed to create message" });
    }
  });

  // Bot handler
  async function handlePixiBot(channelId: string, body: string, userId: string) {
    try {
      let responseText = "";

      // Timetable command
      if (/\btimetable\b|\btime table\b|\bstundenplan\b/i.test(body)) {
        const timetable = await prisma.timetable.findMany({
          take: 5,
          orderBy: { created_at: 'asc' },
        });

        if (timetable.length > 0) {
          responseText = "📅 Your Upcoming Classes:\n\n" +
            timetable.map(t => `• ${t.course} - ${t.day_name} ${t.day_time}`).join('\n');
        } else {
          responseText = "No timetable entries found.";
        }
      }
      // Exams command
      else if (/\bexams\b|\bexam\b|\bprüfungen\b/i.test(body)) {
        const exams = await prisma.exam.findMany({
          take: 5,
          orderBy: { created_at: 'asc' },
        });

        if (exams.length > 0) {
          responseText = "📝 Upcoming Exams:\n\n" +
            exams.map(e => `• ${e.course} - ${e.date || 'TBA'}`).join('\n');
        } else {
          responseText = "No upcoming exams found.";
        }
      }
      // Events command
      else if (/\bevents\b|\bevent\b/i.test(body)) {
        const events = await prisma.event.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
        });

        if (events.length > 0) {
          responseText = "🎉 Upcoming Events:\n\n" +
            events.map(e => `• ${e.title} - ${e.location || 'TBA'}`).join('\n');
        } else {
          responseText = "No upcoming events found.";
        }
      }
      // Help/default
      else {
        responseText = "👋 Hi! I'm Pixi. Try these commands:\n" +
          "• @pixi timetable - View your schedule\n" +
          "• @pixi exams - View upcoming exams\n" +
          "• @pixi events - View campus events";
      }

      // Create bot message
      const botMessage = await prisma.message.create({
        data: {
          channelId,
          userId: "pixi-bot",
          body: responseText,
          isBot: true,
        },
      });

      // Get channel info
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
      });

      // Broadcast bot message
      io.to(`channel:${channelId}`).emit("message:new", {
        type: 'message:new',
        channelId,
        channelName: channel?.name || 'channel',
        message: {
          ...botMessage,
          userId: "pixi-bot",
        },
      });
    } catch (err) {
      console.error('[pixi] error:', err);
    }
  }

  socket.on("disconnect", () => {
    console.log('[socket] client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`)
  
  // Start reminder scheduler
  startReminderScheduler(io);
  console.log('[Reminder] Scheduler started')
})

