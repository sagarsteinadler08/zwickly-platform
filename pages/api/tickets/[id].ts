// PATCH: Update ticket (status, reply, assign)
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const setCorsHeaders = (res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { id } = req.query;

      const ticket = await prisma.ticket.findUnique({
        where: { id: id as string },
      });

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      return res.status(200).json(ticket);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return res.status(500).json({ error: 'Failed to fetch ticket' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id } = req.query;
      const { status, adminReply, assignedTo, priority } = req.body;

      const updateData: any = {};
      if (status) updateData.status = status;
      if (adminReply) updateData.adminReply = adminReply;
      if (assignedTo) updateData.assignedTo = assignedTo;
      if (priority) updateData.priority = priority;

      const ticket = await prisma.ticket.update({
        where: { id: id as string },
        data: updateData,
      });

      return res.status(200).json(ticket);
    } catch (error) {
      console.error('Error updating ticket:', error);
      return res.status(500).json({ error: 'Failed to update ticket' });
    }
  }

  return res.status(405).end();
}

