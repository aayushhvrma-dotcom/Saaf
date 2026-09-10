import type { VercelRequest, VercelResponse } from '@vercel/node'

const RIME_OOV_URL = 'https://users.rime.ai/oov'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RIME_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'RIME_API_KEY not configured' })
  }

  const { text } = req.body as { text: string }
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' })
  }

  try {
    const rimeRes = await fetch(RIME_OOV_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!rimeRes.ok) {
      const errText = await rimeRes.text()
      return res.status(rimeRes.status).json({ error: 'Rime OOV check failed', detail: errText })
    }

    const oovWords = await rimeRes.json() as string[]
    return res.status(200).json({ oovWords })
  } catch (err) {
    console.error('Coverage handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
