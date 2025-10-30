/**
 * Reminder Scheduler Service
 * Checks for due reminders every minute and triggers notifications
 */
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import webpush from 'web-push';

const prisma = new PrismaClient();

const VAPID_PUBLIC = process.env.VAPID_PUBLIC || process.env.NEXT_PUBLIC_VAPID_PUBLIC;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails('mailto:dev@example.com', VAPID_PUBLIC, VAPID_PRIVATE);
}

export function startReminderScheduler(io: Server) {
  console.log('[ReminderScheduler] Starting reminder scheduler...');

  // Check every minute for due reminders
  setInterval(async () => {
    try {
      await checkAndTriggerReminders(io);
    } catch (error) {
      console.error('[ReminderScheduler] Error:', error);
    }
  }, 60000); // Every 60 seconds

  // Initial check on startup
  checkAndTriggerReminders(io);
}

async function checkAndTriggerReminders(io: Server) {
  try {
    const now = new Date();
    
    // Find reminders that are due (not completed, time has passed, not snoozed)
    const dueReminders = await prisma.reminder.findMany({
      where: {
        completed: false,
        reminderTime: {
          lte: now,
        },
        OR: [
          { snoozedUntil: null },
          { snoozedUntil: { lte: now } },
        ],
      },
      orderBy: {
        reminderTime: 'asc',
      },
    });

    for (const reminder of dueReminders) {
      await triggerReminder(io, reminder);
      
      // Handle recurrence
      if (reminder.recurrence && reminder.recurrence !== 'once') {
        await handleRecurrence(reminder);
      }
    }
  } catch (error) {
    console.error('[checkReminders] Error:', error);
  }
}

async function triggerReminder(io: Server, reminder: any) {
  try {
    console.log(`[Reminder] Triggering reminder: ${reminder.title} for user: ${reminder.userId}`);

    // 1. Create notification in database
    await prisma.notification.create({
      data: {
        userId: reminder.userId,
        type: 'reminder',
        payload: {
          reminderId: reminder.id,
          title: reminder.title,
          description: reminder.description,
          source: reminder.source,
          sourceId: reminder.sourceId,
        },
      },
    });

    // 2. Emit socket event for real-time notification
    io.to(`user:${reminder.userId}`).emit('reminder:triggered', {
      type: 'reminder:triggered',
      id: reminder.id,
      title: reminder.title,
      description: reminder.description,
      source: reminder.source,
    });

    // 3. Send push notification
    if (VAPID_PUBLIC && VAPID_PRIVATE) {
      const subscriptions = await prisma.pushSubscription.findMany();
      
      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys as any },
            JSON.stringify({
              title: `⏰ Reminder: ${reminder.title}`,
              body: reminder.description || 'Time for your scheduled reminder',
              icon: '/icons/bell-icon.png',
              badge: '/icons/badge-icon.png',
              data: {
                reminderId: reminder.id,
                url: '/',
              },
            })
          );
        } catch (err: any) {
          console.warn('[Push] Failed:', err?.statusCode || err?.message);
        }
      }
    }

    // 4. Mark as triggered (if one-time, complete it)
    if (reminder.recurrence === 'once' || !reminder.recurrence) {
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { completed: true },
      });
    }
  } catch (error) {
    console.error('[triggerReminder] Error:', error);
  }
}

async function handleRecurrence(reminder: any) {
  try {
    const nextTime = new Date(reminder.reminderTime);

    if (reminder.recurrence === 'daily') {
      // Schedule for next day at same time
      nextTime.setDate(nextTime.getDate() + 1);
    } else if (reminder.recurrence === 'weekdays') {
      // Skip to next weekday
      do {
        nextTime.setDate(nextTime.getDate() + 1);
      } while (nextTime.getDay() === 0 || nextTime.getDay() === 6);
    }

    // Create new reminder for next occurrence
    await prisma.reminder.create({
      data: {
        userId: reminder.userId,
        title: reminder.title,
        description: reminder.description,
        reminderTime: nextTime,
        recurrence: reminder.recurrence,
        source: reminder.source,
        sourceId: reminder.sourceId,
        timezone: reminder.timezone,
      },
    });

    // Mark current as completed
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { completed: true },
    });
  } catch (error) {
    console.error('[handleRecurrence] Error:', error);
  }
}

export default startReminderScheduler;

