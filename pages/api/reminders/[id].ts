import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function setCorsHeaders(res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Reminder ID is required' });
  }

  try {
    // GET - Get specific reminder
    if (req.method === 'GET') {
      const reminder = await prisma.reminder.findUnique({
        where: { id },
      });

      if (!reminder) {
        return res.status(404).json({ error: 'Reminder not found' });
      }

      return res.status(200).json(reminder);
    }

    // PATCH - Update reminder (complete, snooze, edit)
    if (req.method === 'PATCH') {
      const { completed, snoozedUntil, title, description, reminderTime } = req.body;

      const updateData: any = {};

      if (completed !== undefined) updateData.completed = completed;
      if (snoozedUntil !== undefined) updateData.snoozedUntil = snoozedUntil ? new Date(snoozedUntil) : null;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (reminderTime !== undefined) updateData.reminderTime = new Date(reminderTime);

      const reminder = await prisma.reminder.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json(reminder);
    }

    // DELETE - Delete reminder
    if (req.method === 'DELETE') {
      await prisma.reminder.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Reminder deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Reminder API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

