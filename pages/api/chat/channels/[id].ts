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

  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      const deleted = await prisma.channel.delete({
        where: { id: id as string },
      });
      if (!deleted) {
        return res.status(404).json({ error: 'Channel not found' });
      }
      return res.status(204).end();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Channel not found' });
      }
      return res.status(500).json({ error: 'Failed to delete channel' });
    }
  }

  return res.status(405).end();
}
