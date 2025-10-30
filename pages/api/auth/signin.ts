// src/pages/api/auth/signin.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body || {}
  if (!email) return res.status(400).json({ error: 'email required' })
  // For dev, return a mock session
  const user = await prisma.$queryRaw`SELECT id, email FROM profiles WHERE email = ${email} LIMIT 1`
  return res.status(200).json({ data: { user: user?.[0] ?? { id: null, email } } })
}
