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
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id: channelId, pollId } = req.query;
  const userId = (req.method === 'GET') ? (req.query.userId || 'admin') : (req.body.userId || 'admin');

  // POST: Cast or update a vote
  if (req.method === 'POST') {
    const { optionId } = req.body;
    if (!optionId) return res.status(400).json({ error: 'Missing optionId' });
    // Only allow vote if poll is open
    const poll = await prisma.poll.findUnique({ where: { id: pollId as string } });
    if (!poll || poll.isClosed) return res.status(400).json({ error: 'Poll not found or closed' });
    // Upsert (insert or change previous vote)
    const vote = await prisma.pollVote.upsert({
      where: { pollId_userId: { pollId: pollId as string, userId } },
      update: { optionId },
      create: { pollId: pollId as string, userId, optionId },
    });
    return res.status(201).json(vote);
  }

  // GET: Results - count per option, and user's vote
  if (req.method === 'GET') {
    const poll = await prisma.poll.findUnique({ where: { id: pollId as string } });
    if (!poll) return res.status(404).json({ error: 'Poll not found'});
    const options = JSON.parse(poll.options || '[]');
    // All votes for this poll
    const allVotes = await prisma.pollVote.findMany({ where: { pollId: pollId as string } });
    const results = options.map((opt: string, idx: number) => ({
      optionId: idx.toString(), // for simple mapping
      text: opt,
      count: allVotes.filter(v => v.optionId === idx.toString()).length
    }));
    const userVote = allVotes.find((v) => v.userId === userId);
    return res.status(200).json({ options: results, userVote: userVote?.optionId ?? null, isClosed: poll.isClosed });
  }

  return res.status(405).end();
}
