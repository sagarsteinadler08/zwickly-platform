import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // GET - Get single user
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          sessions: {
            where: { status: 'active' },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        joinedDate: user.joinedDate.toISOString().split('T')[0],
        sessions: user.sessions.length,
        phone: user.phone,
        studentId: user.studentId,
      });
    } catch (error: any) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Failed to fetch user', details: error.message });
    }
  }

  // PATCH - Update user
  if (req.method === 'PATCH') {
    try {
      const { name, email, role, status, phone, studentId } = req.body;

      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      if (status !== undefined) updateData.status = status;
      if (phone !== undefined) updateData.phone = phone;
      if (studentId !== undefined) updateData.studentId = studentId;

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      console.log(`User ${updatedUser.name} updated - new status: ${updatedUser.status}, role: ${updatedUser.role}`);

      return res.status(200).json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
  }

  // DELETE - Delete user
  if (req.method === 'DELETE') {
    try {
      await prisma.user.delete({
        where: { id },
      });

      console.log(`User ${id} deleted successfully`);

      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

