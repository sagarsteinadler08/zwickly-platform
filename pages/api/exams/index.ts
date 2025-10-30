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
      const { order, orderAsc, limit, ...filters } = req.query
      
      const where: any = {}
      Object.entries(filters).forEach(([key, value]) => {
        if (key !== 'select' && value !== undefined && value !== null && value !== '') {
          where[key] = value
        }
      })

      let orderBy: any = { date: 'asc' }
      if (order) {
        orderBy = { [order as string]: orderAsc === 'true' ? 'asc' : 'desc' }
      }

      const queryOptions: any = {
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy,
      }
      
      if (limit) {
        queryOptions.take = parseInt(limit as string, 10)
      }

      const exams = await prisma.exam.findMany(queryOptions)

      return res.status(200).json(exams)
    } catch (error) {
      console.error('Error fetching exams:', error)
      return res.status(500).json({ error: 'Failed to fetch exams' })
    }
  }
  res.setHeader('Allow', ['GET', 'OPTIONS'])
  res.status(405).end()
}
