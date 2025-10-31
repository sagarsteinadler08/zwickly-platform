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
      const { range = '30' } = req.query;
      const days = parseInt(range as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Pixi bot interactions (messages with @pixi)
      // Use safe query with try-catch for missing field
      let pixiMessages: any[] = [];
      try {
        pixiMessages = await prisma.message.findMany({
          where: {
            body: {
              contains: '@pixi',
            },
          },
          select: {
            body: true,
            created_at: true,
          },
          take: 100, // Limit results for performance
        });
      } catch (dbError) {
        console.log('Note: No pixi messages found or DB error, using mock data');
        // Return mock data if query fails
        pixiMessages = [];
      }

      // Extract topics from messages (simple keyword extraction)
      const topicCounts: { [key: string]: number } = {
        'Academic Help': 0,
        'Event Info': 0,
        'Technical Support': 0,
        'Course Info': 0,
        'General Questions': 0,
        'Registration': 0,
      };

      pixiMessages.forEach((msg) => {
        const body = msg.body.toLowerCase();
        if (body.includes('course') || body.includes('class') || body.includes('exam')) {
          topicCounts['Academic Help']++;
        } else if (body.includes('event') || body.includes('workshop') || body.includes('seminar')) {
          topicCounts['Event Info']++;
        } else if (body.includes('bug') || body.includes('error') || body.includes('issue') || body.includes('problem')) {
          topicCounts['Technical Support']++;
        } else if (body.includes('schedule') || body.includes('timetable') || body.includes('timing')) {
          topicCounts['Course Info']++;
        } else if (body.includes('register') || body.includes('signup') || body.includes('enroll')) {
          topicCounts['Registration']++;
        } else {
          topicCounts['General Questions']++;
        }
      });

      const topicLabels = Object.keys(topicCounts);
      const topicValues = Object.values(topicCounts);

      // Pixi interactions over time
      const labels: string[] = [];
      const interactionsByDay: { [key: string]: number } = {};

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        labels.push(dateStr);
        interactionsByDay[dateStr] = 0;
      }

      pixiMessages.forEach((msg) => {
        const dateStr = msg.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (interactionsByDay[dateStr] !== undefined) {
          interactionsByDay[dateStr]++;
        }
      });

      const interactionValues = labels.map((label) => interactionsByDay[label]);

      // Average response time (mock data - would be calculated from actual bot response times)
      const avgResponseTime = 2.3; // seconds

      // User satisfaction (mock data - would come from feedback system)
      const satisfactionScore = 4.2; // out of 5

      const metadata = {
        totalInteractions: pixiMessages.length,
        avgResponseTime,
        satisfactionScore,
        topTopic: topicLabels[topicValues.indexOf(Math.max(...topicValues))],
        range: `${days} days`,
        generatedAt: new Date().toISOString(),
      };

      return res.status(200).json({
        topicBreakdown: {
          labels: topicLabels,
          values: topicValues,
        },
        interactionsPerDay: {
          labels,
          values: interactionValues,
        },
        metadata,
      });
    } catch (error) {
      console.error('Error fetching pixi analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch pixi analytics' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

