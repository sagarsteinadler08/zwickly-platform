// src/pages/api/auth/signup.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email & password required' })
  // not secure — for dev only
  const userId = crypto.randomUUID()
  await prisma.$executeRaw`INSERT INTO profiles(id, email, created_at) VALUES (${userId}, ${email}, now()) ON CONFLICT DO NOTHING`
  return res.status(201).json({ data: { id: userId, email } })
}
