// List all channels and create new ones
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

  if (req.method === 'GET') {
    try {
      const channels = await prisma.channel.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(channels);
    } catch (error) {
      console.error('Error fetching channels:', error);
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, slug, description, is_public } = req.body;

      // Check if channel with this slug already exists
      const existing = await prisma.channel.findUnique({
        where: { slug },
      });

      if (existing) {
        return res.status(400).json({ error: 'Channel with this name already exists' });
      }

      const channel = await prisma.channel.create({
        data: {
          name,
          slug,
          description,
          is_public: is_public !== undefined ? is_public : true,
        },
      });

      return res.status(201).json(channel);
    } catch (error) {
      console.error('Error creating channel:', error);
      return res.status(500).json({ error: 'Failed to create channel', details: error.message });
    }
  }

  return res.status(405).end();
}

