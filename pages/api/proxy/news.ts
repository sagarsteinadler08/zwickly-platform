import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    try {
      const response = await fetch('https://mobile.whz.de/news/index.php', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      if (!response.ok) {
        throw new Error(`External API returned ${response.status}`)
      }

      const html = await response.text()
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.status(200).send(html)
    } catch (error: any) {
      console.error('Error proxying news:', error)
      return res.status(500).json({ error: 'Failed to fetch news', details: error.message })
    }
  }

  res.setHeader('Allow', ['GET', 'OPTIONS'])
  res.status(405).end()
}

