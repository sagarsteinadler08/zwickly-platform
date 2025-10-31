import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // GET - Fetch cultural insights
  if (req.method === 'GET') {
    try {
      const { category, region, language, search } = req.query;

      const where: any = {};
      
      if (category && category !== 'all') where.category = category;
      if (region && region !== 'all') where.region = region;
      if (language) where.language = language;
      
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { content: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const insights = await prisma.culturalInsight.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json(insights);
    } catch (error: any) {
      console.error('Error fetching cultural insights:', error);
      return res.status(500).json({ error: 'Failed to fetch insights', details: error.message });
    }
  }

  // POST - Create new cultural insight
  if (req.method === 'POST') {
    try {
      const { category, title, content, region, tags, language, source } = req.body;

      if (!category || !title || !content) {
        return res.status(400).json({ error: 'Category, title, and content are required' });
      }

      const insight = await prisma.culturalInsight.create({
        data: {
          category,
          title,
          content,
          region: region || 'Saxony',
          tags: tags || [],
          language: language || 'en',
          source,
        },
      });

      return res.status(201).json(insight);
    } catch (error: any) {
      console.error('Error creating cultural insight:', error);
      return res.status(500).json({ error: 'Failed to create insight', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

