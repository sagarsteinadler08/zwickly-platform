// Get messages for a channel or create a new message
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id: channelId } = req.query;

  if (req.method === 'GET') {
    try {
      const messages = await prisma.message.findMany({
        where: { channelId: channelId as string },
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: { mentions: true },
      });

      return res.status(200).json(messages.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, body } = req.body;

      const message = await prisma.message.create({
        data: {
          channelId: channelId as string,
          userId,
          body,
        },
        include: { mentions: true },
      });

      return res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      return res.status(500).json({ error: 'Failed to create message' });
    }
  }

  return res.status(405).end();
}

