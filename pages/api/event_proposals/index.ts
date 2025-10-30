import type { NextApiRequest, NextApiResponse } from 'next'

// In-memory store for proposals (since we don't have a table in schema)
// In production, you'd want to use a proper database table
// NOTE: This resets on server restart. For persistence, add a table to Prisma schema.
let proposalsStore: any[] = []

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    try {
      const { status, order, orderAsc, ...filters } = req.query
      
      let filtered = [...proposalsStore]
      
      // Apply filters
      if (status) {
        filtered = filtered.filter(p => p.status === status)
      }
      
      Object.entries(filters).forEach(([key, value]) => {
        if (key.endsWith('_in')) {
          const col = key.replace('_in', '')
          try {
            const parsed = JSON.parse(value as string)
            const values = Array.isArray(parsed) ? parsed : [parsed]
            filtered = filtered.filter(p => values.includes(p[col]))
          } catch {
            filtered = filtered.filter(p => p[col] === value)
          }
        } else if (key !== 'select' && value !== undefined && value !== null && value !== '') {
          filtered = filtered.filter(p => p[key] === value)
        }
      })
      
      // Sort by created_at desc (default) or by specified order
      if (order) {
        const ascending = orderAsc === 'true'
        filtered.sort((a, b) => {
          const aVal = a[order as string]
          const bVal = b[order as string]
          if (aVal === bVal) return 0
          const comparison = aVal > bVal ? 1 : -1
          return ascending ? comparison : -comparison
        })
      } else {
        // Default: sort by created_at desc
        filtered.sort((a, b) => {
          const aDate = new Date(a.created_at || 0).getTime()
          const bDate = new Date(b.created_at || 0).getTime()
          return bDate - aDate
        })
      }
      
      return res.status(200).json(filtered)
    } catch (error) {
      console.error('Error fetching event proposals:', error)
      return res.status(500).json({ error: 'Failed to fetch event proposals' })
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body
      const { randomUUID } = await import('crypto')
      const proposal = {
        id: randomUUID(),
        title: data.title || '',
        description: data.description || null,
        location: data.location || null,
        event_date: data.event_date || null,
        event_time: data.event_time || null,
        category: data.category || null,
        image_url: data.image_url || null,
        registration_info: data.registration_info || null,
        language: data.language || null,
        user_id: data.user_id || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      }
      
      proposalsStore.push(proposal)
      return res.status(201).json(proposal)
    } catch (error) {
      console.error('Error creating event proposal:', error)
      return res.status(500).json({ error: 'Failed to create event proposal' })
    }
  }
  
  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const updateData = req.body
      const id = (req.query.id as string) || updateData.id
      
      if (!id) {
        return res.status(400).json({ error: 'ID is required' })
      }

      const index = proposalsStore.findIndex(p => p.id === id)
      if (index === -1) {
        return res.status(404).json({ error: 'Proposal not found' })
      }

      proposalsStore[index] = {
        ...proposalsStore[index],
        ...updateData,
        updated_at: new Date().toISOString(),
      }
      
      return res.status(200).json(proposalsStore[index])
    } catch (error) {
      console.error('Error updating event proposal:', error)
      return res.status(500).json({ error: 'Failed to update event proposal' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'PUT', 'OPTIONS'])
  res.status(405).end()
}
