import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'POST') {
    try {
      const data = Array.isArray(req.body) ? req.body : [req.body]
      const { randomUUID } = await import('crypto')

      const created = await prisma.timetable.createMany({
        data: data.map(item => ({
          id: randomUUID(),
          day_name: item.day_name || '',
          day_time: item.day_time || '',
          course: item.course || '',
          room: item.room || null,
          instructor: item.instructor || null,
          cycle: item.cycle || null,
          sem_group: item.sem_group || null,
        })),
        skipDuplicates: true,
      })
      return res.status(201).json(created)
    } catch (error) {
      console.error('Error creating timetable:', error)
      return res.status(500).json({ error: 'Failed to create timetable' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { day_name, sem_group } = req.query
      const where: any = {}
      if (day_name) where.day_name = day_name
      if (sem_group) where.sem_group = sem_group

      await prisma.timetable.deleteMany({
        where: Object.keys(where).length > 0 ? where : undefined,
      })
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error deleting timetable:', error)
      return res.status(500).json({ error: 'Failed to delete timetable' })
    }
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

      let orderBy: any = [{ day_name: 'asc' }, { day_time: 'asc' }]
      if (order) {
        orderBy = { [order as string]: orderAsc === 'true' ? 'asc' : 'desc' }
      }

      let timetable = await prisma.timetable.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: Array.isArray(orderBy) ? orderBy : [orderBy],
      })

      // Custom sorting for day_name if no explicit order
      if (!order) {
        const dayOrder: Record<string, number> = {
          Montag: 1, Dienstag: 2, Mittwoch: 3, Donnerstag: 4,
          Freitag: 5, Samstag: 6, Sonntag: 7,
        }
        timetable = timetable.sort((a, b) => {
          const dayA = dayOrder[a.day_name] || 99
          const dayB = dayOrder[b.day_name] || 99
          if (dayA !== dayB) return dayA - dayB
          return (a.day_time?.split(' - ')[0] || '').localeCompare(b.day_time?.split(' - ')[0] || '')
        })
      }

      return res.status(200).json(timetable)
    } catch (error) {
      console.error('Error fetching timetable:', error)
      return res.status(500).json({ error: 'Failed to fetch timetable' })
    }
  }
  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'OPTIONS'])
  res.status(405).end()
}
