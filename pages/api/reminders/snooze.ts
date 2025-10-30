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
    const { id, duration } = req.body; // duration in minutes

    if (!id || !duration) {
      return res.status(400).json({ error: 'id and duration are required' });
    }

    const snoozedUntil = new Date();
    snoozedUntil.setMinutes(snoozedUntil.getMinutes() + parseInt(duration));

    const reminder = await prisma.reminder.update({
      where: { id },
      data: { snoozedUntil },
    });

    return res.status(200).json(reminder);
  } catch (error: any) {
    console.error('Snooze reminder error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

