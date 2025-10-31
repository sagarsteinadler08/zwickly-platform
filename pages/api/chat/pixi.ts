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
      const { q, userId } = req.body;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query is required' });
      }

      const query = q.toLowerCase().trim();
      let reply = "";

      // Check for specific data commands first
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
          reply = "No timetable entries found. Check SELMA for your complete schedule!";
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
          reply = "No upcoming exams found. Check SELMA for your exam schedule!";
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
          reply = "No upcoming events found. Check the Events page for more!";
        }
      }
      // For all other questions, use the Enhanced Pixi AI with cultural knowledge
      else {
        console.log(`[Pixi Social] Enhanced AI query: ${query}`);
        
        try {
          // Search cultural insights
          const keywords = extractKeywords(query);
          const insights = await prisma.culturalInsight.findMany({
            where: {
              OR: [
                { tags: { hasSome: keywords } },
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
              ],
            },
            take: 3, // Limit for chat context
            orderBy: { updatedAt: 'desc' },
          });

          if (insights.length > 0) {
            // Use insights to build response
            reply = `Hi! 👋 Here's what I found:\n\n`;
            insights.forEach((insight, idx) => {
              reply += `${idx + 1}. **${insight.title}**\n${insight.content.substring(0, 200)}...\n\n`;
            });
            reply += `💡 Need more details? Ask me in the chatbot or contact the International Office!`;
            
            // Save conversation
            await prisma.pixiConversation.create({
              data: {
                userId: userId || 'social-chat',
                query: q,
                response: reply,
                category: detectCategory(query),
                insights: insights.map(i => i.id),
              },
            });
          } else {
            // Generic helpful response
            reply = `Hi! 👋 I can help with:\n\n` +
              `📋 Bureaucracy (Anmeldung, visa, permits)\n` +
              `🎓 University life at WHZ\n` +
              `🇩🇪 German culture & language\n` +
              `🏠 Campus life & integration\n` +
              `🎉 Events & student clubs\n\n` +
              `Try asking: "How do I register my address?" or "What clubs exist at WHZ?"`;
          }
        } catch (aiError) {
          console.error('[Pixi Social] AI error:', aiError);
          reply = "Hi! 👋 I'm Pixi, your AI assistant. I can help with timetables, exams, events, German culture, bureaucracy, and WHZ info. What would you like to know?";
        }
      }

      return res.status(200).json({ reply });
    } catch (error) {
      console.error('Error processing pixi query:', error);
      return res.status(500).json({ error: 'Failed to process query', details: error.message });
    }
  }

  return res.status(405).end();
}

// Helper: Extract keywords from query
function extractKeywords(query: string): string[] {
  const commonWords = ['i', 'me', 'my', 'the', 'a', 'an', 'is', 'are', 'how', 'what', 'where', 'when', 'can', 'to', 'in', 'on', 'at', 'for', 'pixi', 'hi', 'hello'];
  const words = query.toLowerCase().split(/\s+/);
  return words.filter(word => word.length > 2 && !commonWords.includes(word));
}

// Helper: Detect category
function detectCategory(query: string): string {
  const q = query.toLowerCase();
  if (q.match(/visa|permit|residence|aufenthaltstitel|registration|anmeldung/)) return 'bureaucracy';
  if (q.match(/university|study|course|exam|ects|professor|semester|selma|opal/)) return 'education';
  if (q.match(/culture|tradition|custom|etiquette|holiday|festival/)) return 'culture';
  if (q.match(/friend|integrate|adapt|lonely|homesick|club/)) return 'integration';
  if (q.match(/german|language|speak|learn|phrase|communicate|sie|du/)) return 'language';
  if (q.match(/tram|bus|transport|travel|dresden|leipzig/)) return 'transport';
  if (q.match(/risk|management|academic|engineering/)) return 'academic';
  return 'general';
}

