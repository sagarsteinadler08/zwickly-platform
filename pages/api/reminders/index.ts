import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

function setCorsHeaders(res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Fetch reminders for a user
    if (req.method === 'GET') {
      const { userId, status, today } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      let where: any = { userId: userId as string };

      // Filter by status
      if (status === 'active') {
        where.completed = false;
      } else if (status === 'completed') {
        where.completed = true;
      }

      // Filter for today's reminders
      if (today === 'true') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        where.reminderTime = {
          gte: startOfDay,
          lte: endOfDay,
        };
        where.completed = false;
      }

      const reminders = await prisma.reminder.findMany({
        where,
        orderBy: [
          { completed: 'asc' },
          { reminderTime: 'asc' },
        ],
      });

      return res.status(200).json(reminders);
    }

    // POST - Create a new reminder
    if (req.method === 'POST') {
      const {
        userId,
        title,
        description,
        reminderTime,
        recurrence,
        source,
        sourceId,
        timezone,
      } = req.body;

      if (!userId || !title || !reminderTime) {
        return res.status(400).json({ error: 'userId, title, and reminderTime are required' });
      }

      // Validate reminderTime is a valid date
      const parsedTime = new Date(reminderTime);
      if (isNaN(parsedTime.getTime())) {
        return res.status(400).json({ error: 'Invalid reminderTime format' });
      }

      const reminder = await prisma.reminder.create({
        data: {
          userId: String(userId),
          title: String(title),
          description: description ? String(description) : null,
          reminderTime: parsedTime,
          recurrence: recurrence || 'once',
          source: source || 'manual',
          sourceId: sourceId ? String(sourceId) : null,
          timezone: timezone || 'Europe/Berlin',
        },
      });

      return res.status(201).json(reminder);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Reminder API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

