// src/pages/api/functions/chat-assistant.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS'])
    return res.status(405).end('Method not allowed')
  }

  const body = req.body || {}
  const messages = body.messages || []
  // Flatten user prompts to a single string for keyword detection
  const promptText = messages.map((m: any) => m.content || '').join(' ').toLowerCase()

  // Simple keyword mapping -> query db for context
  const results: string[] = []

  try {
    if (promptText.includes('event')) {
      const ev = await prisma.event.findMany({ orderBy: { created_at: 'desc' }, take: 5 })
      if (ev.length) {
        results.push('Events:\n' + ev.map(e => `• ${e.title} — ${e.event_date ?? e.event_time ?? ''} @${e.location ?? ''}`).join('\n'))
      }
    }

    if (promptText.includes('timetable') || promptText.includes('schedule')) {
      const tt = await prisma.timetable.findMany({ orderBy: { created_at: 'desc' }, take: 5 })
      if (tt.length) {
        results.push('Timetable (sample):\n' + tt.map(t => `• ${t.course} — ${t.day_name} ${t.day_time} @ ${t.room ?? ''}`).join('\n'))
      }
    }

    if (promptText.includes('mensa') || promptText.includes('canteen') || promptText.includes('food')) {
      const mm = await prisma.mensaMenu.findMany({ orderBy: { created_at: 'desc' }, take: 5 })
      if (mm.length) {
        results.push('Mensa today (sample):\n' + mm.map(m => `• ${m.meal_station}: ${m.dish_description}`).join('\n'))
      }
    }

    if (promptText.includes('news') || promptText.includes('whz')) {
      const nw = await prisma.whzNews.findMany({ orderBy: { created_at: 'desc' }, take: 5 })
      if (nw.length) {
        results.push('WHZ News (latest):\n' + nw.map(n => `• ${n.title}`).join('\n'))
      }
    }

    if (promptText.includes('exam')) {
      const ex = await prisma.exam.findMany({ orderBy: { created_at: 'desc' }, take: 5 })
      if (ex.length) {
        results.push('Exams (sample):\n' + ex.map(e => `• ${e.course} — ${e.date} (${e.period})`).join('\n'))
      }
    }

    if (promptText.includes('german') || promptText.includes('culture')) {
      const gc = await prisma.germanCultureInteraction.findMany({ orderBy: { created_at: 'desc' }, take: 5 })
      if (gc.length) {
        results.push('Culture tips:\n' + gc.map(g => `• ${g.situation} — ${g.interpretation ?? ''}`).join('\n'))
      }
    }

    if (results.length === 0) {
      // fallback: return a short message describing what the assistant can do
      results.push("I couldn't find a direct match in the database for your query. Try asking 'show events', 'mensa menu', 'timetable for course X', or 'latest news'.")
    }

    const answer = results.join('\n\n')
    return res.status(200).json({ text: answer })
  } catch (err: any) {
    console.error('chat-assistant error', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
