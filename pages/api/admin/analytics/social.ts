import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CORS headers
const setCorsHeaders = (res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { range = '7' } = req.query; // days to look back
      const days = parseInt(range as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Messages per day for the last N days
      const messages = await prisma.message.findMany({
        where: {
          created_at: {
            gte: startDate,
          },
        },
        select: {
          created_at: true,
          channelId: true,
        },
      });

      // Group messages by day
      const messagesByDay: { [key: string]: number } = {};
      const labels: string[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        labels.push(dateStr);
        messagesByDay[dateStr] = 0;
      }

      messages.forEach((msg) => {
        const dateStr = msg.created_at.toISOString().split('T')[0];
        if (messagesByDay[dateStr] !== undefined) {
          messagesByDay[dateStr]++;
        }
      });

      const messageValues = labels.map((label) => messagesByDay[label]);

      // Poll participation
      const polls = await prisma.poll.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          id: true,
          question: true,
          votes: true,
        },
      });

      const pollLabels = polls.slice(0, 5).map((p) => p.question.substring(0, 30) + '...');
      const pollValues = polls.slice(0, 5).map((p) => (p.votes as any)?.length || 0);

      // Channel activity (top 5)
      const channelMessages = await prisma.message.groupBy({
        by: ['channelId'],
        _count: {
          id: true,
        },
        where: {
          created_at: {
            gte: startDate,
          },
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 5,
      });

      const channelDetails = await prisma.channel.findMany({
        where: {
          id: {
            in: channelMessages.map((cm) => cm.channelId),
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      const channelMap = Object.fromEntries(channelDetails.map((c) => [c.id, c.name]));
      const channelLabels = channelMessages.map((cm) => channelMap[cm.channelId] || 'Unknown');
      const channelValues = channelMessages.map((cm) => cm._count.id);

      // Total metrics
      const totalMessages = await prisma.message.count({
        where: {
          created_at: {
            gte: startDate,
          },
        },
      });

      const totalPolls = await prisma.poll.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      });

      const totalChannels = await prisma.channel.count();

      return res.status(200).json({
        messagesPerDay: {
          labels,
          values: messageValues,
        },
        pollParticipation: {
          labels: pollLabels,
          values: pollValues,
        },
        channelActivity: {
          labels: channelLabels,
          values: channelValues,
        },
        metadata: {
          totalMessages,
          totalPolls,
          totalChannels,
          range: `${days} days`,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error fetching social analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch social analytics' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

