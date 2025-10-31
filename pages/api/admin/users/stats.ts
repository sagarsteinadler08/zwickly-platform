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
      const [
        totalUsers,
        activeUsers,
        suspendedUsers,
        adminUsers,
        activeSessions,
        newUsersThisWeek,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'active' } }),
        prisma.user.count({ where: { status: 'suspended' } }),
        prisma.user.count({ where: { role: 'admin' } }),
        prisma.session.count({ where: { status: 'active' } }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]);

      return res.status(200).json({
        totalUsers,
        activeUsers,
        activeSessions,
        suspendedUsers,
        newUsersThisWeek,
        adminUsers,
      });
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
      return res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

