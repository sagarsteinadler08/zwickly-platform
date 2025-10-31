import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function setCorsHeaders(res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { userId, hoursBefore = 24 } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Fetch the event
    const event: any = await prisma.$queryRaw`
      SELECT * FROM events WHERE id = ${id}::uuid LIMIT 1
    `;

    if (!event || event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const eventData = event[0];

    // Parse event date and time
    let eventDateTime: Date;

    if (eventData.event_date && eventData.event_time) {
      const dateStr = eventData.event_date instanceof Date
        ? eventData.event_date.toISOString().split('T')[0]
        : eventData.event_date;
      eventDateTime = new Date(`${dateStr}T${eventData.event_time}`);
    } else if (eventData.event_date) {
      eventDateTime = new Date(eventData.event_date);
      eventDateTime.setHours(9, 0, 0, 0); // Default to 9 AM if no time
    } else {
      return res.status(400).json({ error: 'Event has no date/time' });
    }

    // Calculate reminder time (X hours before event)
    const reminderTime = new Date(eventDateTime);
    reminderTime.setHours(reminderTime.getHours() - hoursBefore);

    // Don't create reminder for past events
    if (reminderTime < new Date()) {
      return res.status(400).json({ error: 'Event is in the past or too soon' });
    }

    // Check if reminder already exists for this event
    const existing = await prisma.reminder.findFirst({
      where: {
        userId,
        source: 'event',
        sourceId: id,
        completed: false,
      },
    });

    if (existing) {
      return res.status(200).json({ message: 'Reminder already exists', reminder: existing });
    }

    // Create reminder
    const reminder = await prisma.reminder.create({
      data: {
        userId,
        title: `Event starting soon: ${eventData.title}`,
        description: `${eventData.title} at ${eventData.location || 'TBA'} on ${eventDateTime.toLocaleString()}`,
        reminderTime,
        recurrence: 'once',
        source: 'event',
        sourceId: id,
        timezone: 'Europe/Berlin',
      },
    });

    return res.status(201).json(reminder);
  } catch (error: any) {
    console.error('Event reminder API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

