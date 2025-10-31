import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // GET - Fetch all users
  if (req.method === 'GET') {
    try {
      const { role, status, search } = req.query;

      const where: any = {};
      
      if (role && role !== 'all') {
        where.role = role;
      }
      
      if (status && status !== 'all') {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        include: {
          sessions: {
            where: { status: 'active' },
          },
          _count: {
            select: {
              sessions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform data to match frontend interface
      const transformedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin ? getRelativeTime(user.lastLogin) : 'Never',
        joinedDate: user.joinedDate.toISOString().split('T')[0],
        sessions: user.sessions.length,
        totalEvents: 0, // TODO: Connect with events
        totalTickets: 0, // TODO: Connect with tickets
      }));

      return res.status(200).json(transformedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
  }

  // POST - Create new user
  if (req.method === 'POST') {
    try {
      const { name, email, role, password } = req.body;

      if (!name || !email || !role) {
        return res.status(400).json({ error: 'Name, email, and role are required' });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      // Create user (password should be hashed in production)
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          role,
          password: password || null, // In production, hash this
          status: 'active',
        },
      });

      return res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        joinedDate: newUser.joinedDate.toISOString().split('T')[0],
        sessions: 0,
        totalEvents: 0,
        totalTickets: 0,
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

