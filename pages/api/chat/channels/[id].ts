// Update or delete a specific channel
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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Channel ID is required' });
  }

  // GET - Fetch single channel
  if (req.method === 'GET') {
    try {
      const channel = await prisma.channel.findUnique({
        where: { id },
      });

      if (!channel) {
        return res.status(404).json({ error: 'Channel not found' });
      }

      return res.status(200).json(channel);
    } catch (error) {
      console.error('Error fetching channel:', error);
      return res.status(500).json({ error: 'Failed to fetch channel' });
    }
  }

  // PATCH - Update channel
  if (req.method === 'PATCH') {
    try {
      const { name, description, is_public } = req.body;

      // Build update data object
      const updateData: any = {};
      
      if (name !== undefined) {
        updateData.name = name;
        // Update slug when name changes
        updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      
      if (description !== undefined) {
        updateData.description = description;
      }
      
      if (is_public !== undefined) {
        updateData.is_public = is_public;
      }

      const channel = await prisma.channel.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json(channel);
    } catch (error) {
      console.error('Error updating channel:', error);
      return res.status(500).json({ error: 'Failed to update channel' });
    }
  }

  // DELETE - Delete channel
  if (req.method === 'DELETE') {
    try {
      // Delete channel (cascade will delete associated messages)
      await prisma.channel.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Channel deleted successfully' });
    } catch (error) {
      console.error('Error deleting channel:', error);
      return res.status(500).json({ error: 'Failed to delete channel' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
