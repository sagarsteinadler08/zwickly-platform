import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Global CORS middleware
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

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { q } = req.body;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query is required' });
      }

      const query = q.toLowerCase().trim();
      let reply = "";

      // Timetable command
      if (/timetable|time table|stundenplan/i.test(query)) {
        const timetable = await prisma.timetable.findMany({
          take: 5,
          orderBy: { created_at: 'asc' },
        });

        if (timetable.length > 0) {
          reply = "📅 Your Upcoming Classes:\n\n" +
            timetable.map(t => `• ${t.course} - ${t.day_name} ${t.day_time}`).join('\n');
        } else {
          reply = "No timetable entries found.";
        }
      }
      // Exams command
      else if (/exams|exam|prüfungen/i.test(query)) {
        const exams = await prisma.exam.findMany({
          take: 5,
          orderBy: { created_at: 'asc' },
        });

        if (exams.length > 0) {
          reply = "📝 Upcoming Exams:\n\n" +
            exams.map(e => `• ${e.course} - ${e.date || 'TBA'}`).join('\n');
        } else {
          reply = "No upcoming exams found.";
        }
      }
      // Events command
      else if (/events|event/i.test(query)) {
        const events = await prisma.event.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
        });

        if (events.length > 0) {
          reply = "🎉 Upcoming Events:\n\n" +
            events.map(e => `• ${e.title} - ${e.location || 'TBA'}`).join('\n');
        } else {
          reply = "No upcoming events found.";
        }
      }
      // Help/default
      else {
        reply = "👋 Hi! I'm Pixi. Try these commands:\n" +
          "• @pixi timetable - View your schedule\n" +
          "• @pixi exams - View upcoming exams\n" +
          "• @pixi events - View campus events";
      }

      return res.status(200).json({ reply });
    } catch (error) {
      console.error('Error processing pixi query:', error);
      return res.status(500).json({ error: 'Failed to process query', details: error.message });
    }
  }

  return res.status(405).end();
}

