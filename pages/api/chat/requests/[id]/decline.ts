// Decline channel request
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

  if (req.method === 'POST') {
    try {
      const { id } = req.query;

      const request = await prisma.channelRequest.findUnique({
        where: { id: id as string },
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Update request status
      await prisma.channelRequest.update({
        where: { id: id as string },
        data: { status: 'declined' },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error declining request:', error);
      return res.status(500).json({ error: 'Failed to decline request' });
    }
  }

  return res.status(405).end();
}

