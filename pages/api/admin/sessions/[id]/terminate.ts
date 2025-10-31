import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'POST') {
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const session = await prisma.session.update({
        where: { id },
        data: {
          status: 'expired',
        },
      });

      console.log(`Session ${id} terminated successfully`);

      return res.status(200).json({ message: 'Session terminated successfully', session });
    } catch (error: any) {
      console.error('Error terminating session:', error);
      return res.status(500).json({ error: 'Failed to terminate session', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

