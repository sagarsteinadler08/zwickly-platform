import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CORS headers
const setCorsHeaders = (res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { range = '30' } = req.query;
      const days = parseInt(range as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Reminders by status
      const completedReminders = await prisma.reminder.count({
        where: {
          completed: true,
          reminderTime: {
            gte: startDate,
          },
        },
      });

      const snoozedReminders = await prisma.reminder.count({
        where: {
          snoozedUntil: {
            not: null,
            gte: new Date(),
          },
        },
      });

      const pendingReminders = await prisma.reminder.count({
        where: {
          completed: false,
          reminderTime: {
            gte: new Date(),
          },
        },
      });

      // Reminders created per day
      const reminders = await prisma.reminder.findMany({
        where: {
          created_at: {
            gte: startDate,
          },
        },
        select: {
          created_at: true,
          completed: true,
          snoozedUntil: true,
        },
      });

      const labels: string[] = [];
      const remindersByDay: { [key: string]: number } = {};

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        labels.push(dateStr);
        remindersByDay[dateStr] = 0;
      }

      reminders.forEach((reminder) => {
        const dateStr = reminder.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (remindersByDay[dateStr] !== undefined) {
          remindersByDay[dateStr]++;
        }
      });

      const reminderValues = labels.map((label) => remindersByDay[label]);

      // Completion rate breakdown
      const totalReminders = await prisma.reminder.count();
      const completionRate = totalReminders > 0 ? ((completedReminders / totalReminders) * 100).toFixed(1) : 0;

      // Reminders by source
      const eventReminders = await prisma.reminder.count({
        where: { source: 'event' },
      });

      const assignmentReminders = await prisma.reminder.count({
        where: { source: 'assignment' },
      });

      const customReminders = await prisma.reminder.count({
        where: { source: 'custom' },
      });

      const metadata = {
        totalReminders,
        completedReminders,
        snoozedReminders,
        pendingReminders,
        completionRate: parseFloat(completionRate as string),
        sources: {
          events: eventReminders,
          assignments: assignmentReminders,
          custom: customReminders,
        },
        range: `${days} days`,
        generatedAt: new Date().toISOString(),
      };

      return res.status(200).json({
        statusBreakdown: {
          labels: ['Completed', 'Snoozed', 'Pending'],
          values: [completedReminders, snoozedReminders, pendingReminders],
        },
        remindersPerDay: {
          labels,
          values: reminderValues,
        },
        sourceBreakdown: {
          labels: ['Events', 'Assignments', 'Custom'],
          values: [eventReminders, assignmentReminders, customReminders],
        },
        metadata,
      });
    } catch (error) {
      console.error('Error fetching reminders analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch reminders analytics' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

