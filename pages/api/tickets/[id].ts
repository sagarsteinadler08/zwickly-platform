// PATCH: Update ticket (status, reply, assign)
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';

const prisma = new PrismaClient();

// Get Socket.IO instance (if server is running)
let io: SocketIOServer | null = null;
try {
  const socketClient = require('socket.io-client');
  // We'll emit events through HTTP request to socket server
} catch (error) {
  // Socket.IO client not available
}

const setCorsHeaders = (res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE');
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
      const { status, adminReply, assignedTo, priority, category, department } = req.body;

      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (adminReply !== undefined) updateData.adminReply = adminReply;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
      if (priority !== undefined) updateData.priority = priority;
      if (category !== undefined) updateData.category = category;
      if (department !== undefined) updateData.department = department;

      const ticket = await prisma.ticket.update({
        where: { id: id as string },
        data: updateData,
      });

      // Create notification for student about status update
      if (status || adminReply) {
        try {
          await prisma.notification.create({
            data: {
              userId: ticket.userId,
              type: 'ticket_updated',
              payload: {
                ticketId: ticket.id,
                title: ticket.title,
                status: ticket.status,
                hasReply: !!ticket.adminReply,
              },
              read: false,
            },
          });

          // Emit socket event for real-time notification
          // The socket server will handle broadcasting this
          console.log(`Ticket ${ticket.id} updated - notification created for user ${ticket.userId}`);
        } catch (notifError) {
          console.error('Failed to create notification:', notifError);
          // Don't fail the whole request if notification fails
        }
      }

      return res.status(200).json(ticket);
    } catch (error) {
      console.error('Error updating ticket:', error);
      return res.status(500).json({ error: 'Failed to update ticket' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      await prisma.ticket.delete({
        where: { id: id as string },
      });

      return res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      return res.status(500).json({ error: 'Failed to delete ticket' });
    }
  }

  return res.status(405).end();
}

