"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Socket.IO server with chat, mentions, and @pixi bot
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const web_push_1 = __importDefault(require("web-push"));
const prisma = new client_1.PrismaClient();
// VAPID setup
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    web_push_1.default.setVapidDetails('mailto:support@zwickly.local', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
}
const httpServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ["http://localhost:8080", "http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});
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
    // Join channel
    socket.on("join_channel", async (channelId) => {
        socket.join(`channel:${channelId}`);
        console.log('[socket] user joined channel:', channelId);
    });
    // Leave channel
    socket.on("leave_channel", (channelId) => {
        socket.leave(`channel:${channelId}`);
        console.log('[socket] user left channel:', channelId);
    });
    // Create message
    socket.on("message:create", async (payload) => {
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
            const mentions = [];
            let m;
            while ((m = mentionRegex.exec(payload.body)) !== null) {
                mentions.push(m[1]);
            }
            // Process mentions (create mention records, notifications, push)
            for (const username of mentions) {
                try {
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
                            where: { userId: user.id },
                        });
                        for (const sub of subs) {
                            try {
                                await web_push_1.default.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, JSON.stringify({
                                    title: "You were mentioned",
                                    body: `${userId} mentioned you`,
                                    data: { messageId: message.id, channelId: payload.channelId },
                                }));
                            }
                            catch (err) {
                                console.error('[push] failed:', err);
                            }
                        }
                    }
                }
                catch (err) {
                    console.error('[mention] error:', err);
                }
            }
            // Broadcast message to channel
            io.to(`channel:${payload.channelId}`).emit("message:new", {
                ...message,
                userId,
            });
            // Check for @pixi bot command
            const pixiRegex = /@pixi\b/i;
            if (pixiRegex.test(payload.body)) {
                handlePixiBot(payload.channelId, payload.body, userId);
            }
        }
        catch (err) {
            console.error('[message:create] error:', err);
            socket.emit("message:error", { message: "Failed to create message" });
        }
    });
    // Bot handler
    async function handlePixiBot(channelId, body, userId) {
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
                }
                else {
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
                }
                else {
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
                }
                else {
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
            // Broadcast bot message
            io.to(`channel:${channelId}`).emit("message:new", {
                ...botMessage,
                userId: "pixi-bot",
            });
        }
        catch (err) {
            console.error('[pixi] error:', err);
        }
    }
    socket.on("disconnect", () => {
        console.log('[socket] client disconnected:', socket.id);
    });
});
const PORT = Number(process.env.WS_PORT || 4001);
httpServer.listen(PORT, () => {
    console.log(`[socket] Server listening on :${PORT}`);
});
