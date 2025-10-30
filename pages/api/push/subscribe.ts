// Subscribe to push notifications
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { userId, endpoint, keys } = req.body;

      await prisma.pushSubscription.create({
        data: {
          userId,
          endpoint,
          keys,
        },
      });

      return res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return res.status(500).json({ error: 'Failed to subscribe' });
    }
  }

  return res.status(405).end();
}

