// Approve channel request
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { id } = req.query;

      const request = await prisma.channelRequest.findUnique({
        where: { id: id as string },
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Create channel
      const slug = request.name.toLowerCase().replace(/\s+/g, '-');
      const channel = await prisma.channel.create({
        data: {
          name: request.name,
          slug,
          description: request.description,
          is_public: true,
        },
      });

      // Update request status
      await prisma.channelRequest.update({
        where: { id: id as string },
        data: { status: 'accepted' },
      });

      // Create notification for the requester
      await prisma.notification.create({
        data: {
          userId: request.requesterId,
          type: 'channel_request_approved',
          payload: {
            requestId: request.id,
            channelId: channel.id,
            channelName: channel.name,
            message: `Your channel request "${channel.name}" has been approved!`,
          },
        },
      });

      return res.status(200).json({ channel });
    } catch (error) {
      console.error('Error approving request:', error);
      return res.status(500).json({ error: 'Failed to approve request' });
    }
  }

  return res.status(405).end();
}

