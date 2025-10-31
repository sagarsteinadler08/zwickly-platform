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
      const { id, email, ...filters } = req.query
      const where: any = {}
      if (id) where.id = id
      if (email) where.email = email

      const profiles = await prisma.profile.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
      })

      // Add wallet_balance field (default to 0) for compatibility
      const profilesWithWallet = profiles.map(p => ({
        ...p,
        wallet_balance: 0
      }))

      return res.status(200).json(profilesWithWallet)
    } catch (error) {
      console.error('Error fetching profiles:', error)
      return res.status(500).json({ error: 'Failed to fetch profiles' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { id, email } = req.body
      const profile = await prisma.profile.upsert({
        where: { email },
        update: {},
        create: {
          id: id || crypto.randomUUID(),
          email,
        },
      })
      return res.status(201).json(profile)
    } catch (error) {
      console.error('Error creating profile:', error)
      return res.status(500).json({ error: 'Failed to create profile' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS'])
  res.status(405).end()
}

