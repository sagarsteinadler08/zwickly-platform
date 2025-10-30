import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    try {
      const { order, orderAsc, ...filters } = req.query
      
      const where: any = {}
      Object.entries(filters).forEach(([key, value]) => {
        if (key !== 'select' && value !== undefined && value !== null && value !== '') {
          where[key] = value
        }
      })

      let orderBy: any = { created_at: 'desc' }
      if (order) {
        orderBy = { [order as string]: orderAsc === 'true' ? 'asc' : 'desc' }
      }

      const interactions = await prisma.germanCultureInteraction.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy,
      })

      return res.status(200).json(interactions)
    } catch (error) {
      console.error('Error fetching german culture interactions:', error)
      return res.status(500).json({ error: 'Failed to fetch german culture interactions' })
    }
  }
  res.setHeader('Allow', ['GET', 'OPTIONS'])
  res.status(405).end()
}
