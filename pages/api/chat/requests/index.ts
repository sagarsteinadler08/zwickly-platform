// GET: List pending channel requests
// POST: Submit new channel request
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
      const requests = await prisma.channelRequest.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, description, requesterId } = req.body;

      if (!name || !requesterId) {
        return res.status(400).json({ error: 'name and requesterId required' });
      }

      const request = await prisma.channelRequest.create({
        data: { name, description, requesterId },
      });

      return res.status(201).json(request);
    } catch (error) {
      console.error('Error creating request:', error);
      return res.status(500).json({ error: 'Failed to create request' });
    }
  }

  return res.status(405).end();
}

