import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Clear existing users (for demo purposes)
      await prisma.session.deleteMany({});
      await prisma.user.deleteMany({});

      // Create sample users
      const users = await prisma.user.createMany({
        data: [
          {
            name: 'Anna Schmidt',
            email: 'anna.schmidt@whz.de',
            role: 'student',
            status: 'active',
            studentId: 'S001234',
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            joinedDate: new Date('2024-09-15'),
          },
          {
            name: 'Max Müller',
            email: 'max.mueller@whz.de',
            role: 'student',
            status: 'active',
            studentId: 'S001235',
            lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            joinedDate: new Date('2024-08-20'),
          },
          {
            name: 'Sarah Weber',
            email: 'sarah.weber@whz.de',
            role: 'admin',
            status: 'active',
            lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            joinedDate: new Date('2024-01-10'),
          },
          {
            name: 'Tom Fischer',
            email: 'tom.fischer@whz.de',
            role: 'moderator',
            status: 'active',
            lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            joinedDate: new Date('2024-03-15'),
          },
          {
            name: 'Lisa Hoffmann',
            email: 'lisa.hoffmann@whz.de',
            role: 'student',
            status: 'suspended',
            studentId: 'S001236',
            lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
            joinedDate: new Date('2024-09-01'),
          },
          {
            name: 'Current User',
            email: 'you@whz.de',
            role: 'admin',
            status: 'active',
            lastLogin: new Date(),
            joinedDate: new Date(),
          },
        ],
      });

      // Create some active sessions
      const allUsers = await prisma.user.findMany();
      
      await prisma.session.createMany({
        data: [
          {
            userId: allUsers[0].id,
            device: 'MacBook Pro',
            browser: 'Chrome 119',
            location: 'Zwickau, Germany',
            ipAddress: '192.168.1.100',
            loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 2 * 60 * 1000),
            status: 'active',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          {
            userId: allUsers[2].id,
            device: 'Windows PC',
            browser: 'Firefox 120',
            location: 'Zwickau, Germany',
            ipAddress: '192.168.1.105',
            loginTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 5 * 60 * 1000),
            status: 'active',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          {
            userId: allUsers[1].id,
            device: 'iPhone 14',
            browser: 'Safari 17',
            location: 'Dresden, Germany',
            ipAddress: '192.168.2.50',
            loginTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
            status: 'idle',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        ],
      });

      return res.status(200).json({
        message: 'Database seeded successfully',
        usersCreated: users.count,
      });
    } catch (error: any) {
      console.error('Error seeding database:', error);
      return res.status(500).json({ error: 'Failed to seed database', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

