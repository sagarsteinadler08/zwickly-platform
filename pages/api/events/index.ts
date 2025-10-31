import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    try {
      const { order, orderAsc, limit, ...filters } = req.query

      // Build where clause from filters
      const where: any = {}
      Object.entries(filters).forEach(([key, value]) => {
        if (key.endsWith('_gte')) {
          const col = key.replace('_gte', '')
          // Convert date strings to Date objects for Prisma
          where[col] = { gte: col.includes('date') || col.includes('Date') ? new Date(value as string) : value }
        } else if (key.endsWith('_lte')) {
          const col = key.replace('_lte', '')
          // Convert date strings to Date objects for Prisma
          const dateValue = col.includes('date') || col.includes('Date') ? new Date(value as string) : value
          if (where[col]) {
            where[col] = { ...where[col], lte: dateValue }
          } else {
            where[col] = { lte: dateValue }
          }
        } else if (key.endsWith('_in')) {
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

      // Build orderBy
      let orderBy: any = { created_at: 'desc' }
      if (order) {
        orderBy = {
          [order as string]: orderAsc === 'true' ? 'asc' : 'desc'
        }
      }

      const queryOptions: any = {
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy,
      }

      if (limit) {
        queryOptions.take = parseInt(limit as string, 10)
      }

      const events = await prisma.event.findMany(queryOptions)

      return res.status(200).json(events)
    } catch (error) {
      console.error('Error fetching events:', error)
      return res.status(500).json({ error: 'Failed to fetch events' })
    }
  }

  if (req.method === 'POST') {
    try {
      const data = Array.isArray(req.body) ? req.body[0] : req.body

      // Validate required fields
      if (!data.title || data.title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' })
      }

      // Generate UUID properly for Prisma
      const { randomUUID } = await import('crypto')
      const eventId = data.id || randomUUID()

      const created = await prisma.event.create({
        data: {
          id: eventId,
          title: data.title.trim(),
          location: data.location || null,
          event_date: data.event_date ? new Date(data.event_date) : null,
          event_time: data.event_time || null,
          image_url: data.image_url || null,
          category: data.category || null,
          description: data.description || null,
          language: data.language || null,
          registration_info: data.registration_info || null,
          likes: data.likes || 0,
          prosts: data.prosts || 0,
          created_by: data.created_by || null,
        },
      })
      return res.status(201).json(created)
    } catch (error: any) {
      console.error('Error creating event:', error)
      // Handle UUID format errors
      if (error.message?.includes('invalid input syntax for type uuid')) {
        const { randomUUID } = await import('crypto')
        try {
          const data = req.body
          const created = await prisma.event.create({
            data: {
              id: randomUUID(),
              title: data.title || '',
              location: data.location || null,
              event_date: data.event_date ? new Date(data.event_date) : null,
              event_time: data.event_time || null,
              image_url: data.image_url || null,
              category: data.category || null,
              description: data.description || null,
              language: data.language || null,
              registration_info: data.registration_info || null,
              likes: data.likes || 0,
              prosts: data.prosts || 0,
            },
          })
          return res.status(201).json(created)
        } catch (retryError) {
          console.error('Retry also failed:', retryError)
        }
      }
      return res.status(500).json({ error: 'Failed to create event', details: error.message })
    }
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const updateData = req.body
      // Get ID from query params (from .eq() filter) or body
      const id = (req.query.id as string) || updateData.id

      if (!id) {
        return res.status(400).json({ error: 'ID is required (use ?id=xxx or include id in body)' })
      }

      // Remove id from updateData if it's there
      const { id: _, ...dataToUpdate } = updateData

      const updated = await prisma.event.update({
        where: { id },
        data: dataToUpdate,
      })
      return res.status(200).json(updated)
    } catch (error: any) {
      console.error('Error updating event:', error)
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Event not found' })
      }
      return res.status(500).json({ error: 'Failed to update event', details: error.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Get ID from query params or body
      const id = (req.query.id as string) || req.body?.id
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID is required' })
      }
      await prisma.event.delete({
        where: { id },
      })
      return res.status(200).json({ success: true })
    } catch (error: any) {
      console.error('Error deleting event:', error)
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Event not found' })
      }
      return res.status(500).json({ error: 'Failed to delete event' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
