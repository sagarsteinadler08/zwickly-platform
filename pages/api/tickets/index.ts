// GET: List tickets, POST: Create/update ticket
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const setCorsHeaders = (res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { userId, status } = req.query;

      const where: any = {};
      if (userId) where.userId = userId;
      if (status) where.status = status;

      const tickets = await prisma.ticket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return res.status(200).json(tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return res.status(500).json({ error: 'Failed to fetch tickets' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, title, description, channelId, messageId, priority } = req.body;

      if (!userId || !title || !description) {
        return res.status(400).json({ error: 'userId, title, and description required' });
      }

      const ticket = await prisma.ticket.create({
        data: {
          userId,
          title,
          description,
          channelId,
          messageId,
          priority: priority || 'normal',
        },
      });

      return res.status(201).json(ticket);
    } catch (error) {
      console.error('Error creating ticket:', error);
      return res.status(500).json({ error: 'Failed to create ticket' });
    }
  }

  return res.status(405).end();
}

