import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

// Initialize Gemini AI
const GEMINI_API_KEY = 'AIzaSyDncNbpi4BLSaHizPKHiTeQDJvsPf5k_SA';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
      const { query, userId } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      console.log(`[Pixi AI] Query from ${userId || 'anonymous'}: ${query}`);

      // Step 1: Search for relevant cultural insights
      const relevantInsights = await searchCulturalInsights(query);

      // Step 2: Build context from cultural insights
      const contextParts = relevantInsights.map(insight =>
        `[${insight.category.toUpperCase()}] ${insight.title}:\n${insight.content}`
      );

      const culturalContext = contextParts.length > 0
        ? `\n\n📚 CULTURAL KNOWLEDGE BASE:\n${contextParts.join('\n\n---\n\n')}`
        : '';

      // Step 3: Generate response using Gemini AI (with fallback)
      let response: string;
      
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const systemPrompt = `You are Pixi, a friendly and helpful AI assistant for international students at West Saxon University of Zwickau (WHZ) in Saxony, Germany.

Your role is to help students with:
- Cultural adaptation in Germany and Saxony
- University life and academic questions
- Bureaucracy and visa matters
- Integration tips and local insights
- German language and etiquette
- Student life resources

IMPORTANT GUIDELINES:
1. Be warm, friendly, and encouraging
2. Use emojis occasionally to be approachable
3. Provide specific, actionable advice
4. Reference official sources when discussing bureaucracy
5. If you don't know something, suggest where to find help (International Office, Studentenwerk, etc.)
6. Be culturally sensitive and supportive

When relevant cultural insights are provided below, USE THEM as verified information. Prioritize this data over general knowledge.
${culturalContext}

Student Query: ${query}

Respond helpfully and conversationally:`;

        const result = await model.generateContent(systemPrompt);
        response = result.response.text();
        
      } catch (aiError: any) {
        console.error('[Pixi AI] Gemini API error:', aiError.message);
        
        // Fallback: Use cultural insights directly
        if (relevantInsights.length > 0) {
          response = `Hi there! 👋 I found some helpful information about your question:\n\n`;
          relevantInsights.forEach((insight, idx) => {
            response += `${idx + 1}. **${insight.title}**\n${insight.content}\n\n`;
          });
          response += `Hope this helps! If you need more specific guidance, feel free to ask or contact the WHZ International Office. 🎓`;
        } else {
          response = `Hi! 👋 I'd love to help you with that. While I'm currently experiencing some technical difficulties with my AI service, I recommend:\n\n1. Check the WHZ International Office for specific guidance\n2. Visit the Studentenwerk for student support services\n3. Ask in the #general channel - fellow students often have great advice!\n\nFeel free to ask me another question! 🙏`;
        }
      }

      // Step 4: Save conversation history
      const insightIds = relevantInsights.map(i => i.id);
      const detectedCategory = detectCategory(query);

      await prisma.pixiConversation.create({
        data: {
          userId: userId || 'anonymous',
          query,
          response,
          category: detectedCategory,
          insights: insightIds,
        },
      });

      console.log(`[Pixi AI] Response generated using ${relevantInsights.length} cultural insights`);

      return res.status(200).json({
        response,
        insightsUsed: relevantInsights.length,
        category: detectedCategory,
        relatedTopics: relevantInsights.map(i => i.title),
      });

    } catch (error: any) {
      console.error('[Pixi AI] Error:', error);
      
      // Fallback response if AI fails
      const fallbackResponse = "I apologize, but I'm experiencing technical difficulties. Please try again or contact the International Office at WHZ for immediate assistance. 🙏";
      
      return res.status(200).json({
        response: fallbackResponse,
        insightsUsed: 0,
        error: 'AI service unavailable',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Search cultural insights based on query keywords
async function searchCulturalInsights(query: string): Promise<any[]> {
  try {
    const keywords = extractKeywords(query.toLowerCase());
    
    // Search by tags, title, or content
    const insights = await prisma.culturalInsight.findMany({
      where: {
        OR: [
          { tags: { hasSome: keywords } },
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5, // Limit to top 5 most relevant
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return insights;
  } catch (error) {
    console.error('Error searching insights:', error);
    return [];
  }
}

// Extract keywords from query
function extractKeywords(query: string): string[] {
  const commonWords = ['i', 'me', 'my', 'the', 'a', 'an', 'is', 'are', 'how', 'what', 'where', 'when', 'can', 'to', 'in', 'on', 'at', 'for'];
  const words = query.toLowerCase().split(/\s+/);
  
  return words.filter(word => 
    word.length > 2 && !commonWords.includes(word)
  );
}

// Detect query category
function detectCategory(query: string): string {
  const q = query.toLowerCase();
  
  if (q.match(/visa|permit|residence|aufenthaltstitel|registration|anmeldung/)) return 'bureaucracy';
  if (q.match(/university|study|course|exam|ects|professor|semester/)) return 'education';
  if (q.match(/culture|tradition|custom|etiquette|holiday|festival/)) return 'culture';
  if (q.match(/friend|integrate|adapt|lonely|homesick/)) return 'integration';
  if (q.match(/german|language|speak|learn|phrase|communicate/)) return 'language';
  if (q.match(/city|place|visit|restaurant|travel|saxony|dresden|leipzig/)) return 'region';
  
  return 'general';
}

