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
      // Return empty array since we don't have this table in schema
      return res.status(200).json([])
    } catch (error) {
      console.error('Error fetching event attendance:', error)
      return res.status(500).json({ error: 'Failed to fetch event attendance' })
    }
  }

  res.setHeader('Allow', ['GET', 'OPTIONS'])
  res.status(405).end()
}

