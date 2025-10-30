import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    try {
      const items = await prisma.item.findMany({ orderBy: { createdAt: 'desc' } })
      return res.status(200).json(items)
    } catch (error) {
      console.error('Error fetching items:', error)
      return res.status(500).json({ error: 'Failed to fetch items' })
    }
  } else if (req.method === 'POST') {
    try {
      const { text } = req.body
      const item = await prisma.item.create({ data: { text } })
      // Broadcast to WebSocket server (will be handled by Socket.IO)
      return res.status(201).json(item)
    } catch (error) {
      console.error('Error creating item:', error)
      return res.status(500).json({ error: 'Failed to create item' })
    }
  }
  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS'])
  res.status(405).end()
}
