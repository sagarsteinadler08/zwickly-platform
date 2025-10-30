import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: false }
};

const prisma = new PrismaClient();

const setCorsHeaders = (res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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

  const { id: channelId } = req.query;

  if (req.method === 'POST') {
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), '/public/uploaded');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new formidable.IncomingForm();
    form.uploadDir = uploadDir;
    form.keepExtensions = true;
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'File upload failed', details: err });
      }
      //@ts-ignore
      const file = files.image;
      if (!file) {
        return res.status(400).json({ error: 'No image file provided' });
      }
      //@ts-ignore
      const filename = path.basename(file.filepath);
      //@ts-ignore
      const fileUrl = `/uploaded/${filename}`;
      // Save metadata in DB
      const image = await prisma.image.create({
        data: {
          channelId: channelId as string,
          url: fileUrl,
          originalName: file.originalFilename || filename
        }
      });
      return res.status(201).json(image);
    });
    return;
  }

  if (req.method === 'GET') {
    try {
      const images = await prisma.image.findMany({
        where: { channelId: channelId as string },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(images);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch images' });
    }
  }

  return res.status(405).end();
}
