import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'GET') {
    try {
      const sessions = await prisma.session.findMany({
        where: {
          status: {
            in: ['active', 'idle'],
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          lastActivity: 'desc',
        },
      });

      const transformedSessions = sessions.map(session => ({
        id: session.id,
        userId: session.userId,
        userName: session.user.name,
        device: session.device || 'Unknown Device',
        browser: session.browser || 'Unknown Browser',
        location: session.location || 'Unknown Location',
        ipAddress: session.ipAddress || 'Unknown IP',
        loginTime: session.loginTime.toLocaleString(),
        lastActivity: getRelativeTime(session.lastActivity),
        status: session.status,
      }));

      return res.status(200).json(transformedSessions);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

