import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const setCorsHeaders = (res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
  const { id: channelId } = req.query;

  if (req.method === 'POST') {
    try {
      const { question, options } = req.body;
      if (!question || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ error: 'Invalid poll data' });
      }
      const poll = await prisma.poll.create({
        data: {
          channelId: channelId as string,
          question,
          options: JSON.stringify(options),
          createdBy: 'admin',
        }
      });
      return res.status(201).json(poll);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create poll' });
    }
  }
  if (req.method === 'GET') {
    try {
      const polls = await prisma.poll.findMany({
        where: { channelId: channelId as string },
        orderBy: { createdAt: 'desc' },
      });
      // Parse options from JSON
      const parsed = polls.map(p => ({ ...p, options: JSON.parse(p.options) }));
      return res.status(200).json(parsed);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch polls' });
    }
  }
  return res.status(405).end();
}
