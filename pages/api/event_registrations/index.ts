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
      const { order, orderAsc, ...filters } = req.query
      const where: any = {}
      Object.entries(filters).forEach(([key, value]) => {
        if (key.endsWith('_in')) {
          const col = key.replace('_in', '')
          try {
            const parsed = JSON.parse(value as string)
            where[col] = { in: Array.isArray(parsed) ? parsed : [parsed] }
          } catch {
            where[col] = { in: [value] }
          }
        } else if (key !== 'select' && value !== undefined && value !== null && value !== '') {
          where[key] = value
        }
      })

      let orderBy: any = { registered_at: 'desc' }
      if (order) {
        orderBy = { [order as string]: orderAsc === 'true' ? 'asc' : 'desc' }
      }

      // Return empty array since we don't have this table in schema
      return res.status(200).json([])
    } catch (error) {
      console.error('Error fetching event registrations:', error)
      return res.status(500).json({ error: 'Failed to fetch event registrations' })
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body
      // Mock creation - just return success since we don't have this table
      const { randomUUID } = await import('crypto')
      return res.status(201).json({
        id: randomUUID(),
        event_id: data.event_id,
        user_id: data.user_id,
        registered_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error creating event registration:', error)
      return res.status(500).json({ error: 'Failed to create event registration' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS'])
  res.status(405).end()
}

