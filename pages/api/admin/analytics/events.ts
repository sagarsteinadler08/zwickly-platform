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

      // Events per day
      const events = await prisma.event.findMany({
        where: {
          created_at: {
            gte: startDate,
          },
        },
        select: {
          created_at: true,
          category: true,
          registrations: true,
        },
      });

      const labels: string[] = [];
      const eventsByDay: { [key: string]: number } = {};
      const attendanceByDay: { [key: string]: number } = {};

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        labels.push(dateStr);
        eventsByDay[dateStr] = 0;
        attendanceByDay[dateStr] = 0;
      }

      events.forEach((event) => {
        const dateStr = event.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (eventsByDay[dateStr] !== undefined) {
          eventsByDay[dateStr]++;
          // Mock registrations (would come from registrations table)
          attendanceByDay[dateStr] += Math.floor(Math.random() * 50) + 20;
        }
      });

      const eventValues = labels.map((label) => eventsByDay[label]);
      const attendanceValues = labels.map((label) => attendanceByDay[label]);

      // Category breakdown (treemap data)
      const categoryCount: { [key: string]: number } = {};
      events.forEach((event) => {
        const category = event.category || 'Other';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const categoryLabels = Object.keys(categoryCount);
      const categoryValues = Object.values(categoryCount);

      // Top events by attendance (mock data)
      const topEvents = [
        { name: 'Tech Career Fair', attendance: 234 },
        { name: 'AI Workshop', attendance: 198 },
        { name: 'Cultural Festival', attendance: 187 },
        { name: 'Sports Tournament', attendance: 165 },
        { name: 'Research Symposium', attendance: 143 },
      ];

      // Total metrics
      const totalEvents = await prisma.event.count();
      const upcomingEvents = await prisma.event.count({
        where: {
          event_date: {
            gte: new Date(),
          },
        },
      });

      const metadata = {
        totalEvents,
        upcomingEvents,
        completedEvents: totalEvents - upcomingEvents,
        totalCategories: categoryLabels.length,
        avgAttendance: 156,
        range: `${days} days`,
        generatedAt: new Date().toISOString(),
      };

      return res.status(200).json({
        eventsPerDay: {
          labels,
          values: eventValues,
        },
        attendancePerDay: {
          labels,
          values: attendanceValues,
        },
        categoryBreakdown: {
          labels: categoryLabels,
          values: categoryValues,
        },
        topEvents,
        metadata,
      });
    } catch (error) {
      console.error('Error fetching events analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch events analytics' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

