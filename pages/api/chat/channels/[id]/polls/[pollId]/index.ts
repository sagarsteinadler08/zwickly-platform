import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const setCorsHeaders = (res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { pollId } = req.query;
  if (req.method === 'PATCH') {
    // Only allow close/open (isClosed)
    const { isClosed } = req.body;
    if (typeof isClosed !== 'boolean') return res.status(400).json({ error: 'Missing isClosed (bool)' });
    const poll = await prisma.poll.update({
      where: { id: pollId as string },
      data: { isClosed },
    });
    return res.status(200).json(poll);
  }
  return res.status(405).end();
}
