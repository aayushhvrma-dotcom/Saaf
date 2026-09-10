import type { VercelRequest, VercelResponse } from '@vercel/node'

// Public endpoint — no API key required for the voice catalog
const RIME_VOICES_URL = 'https://users.rime.ai/data/voices/all-v2.json'
const RIME_VOICE_DETAILS_URL = 'https://users.rime.ai/data/voices/voice_details.json'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Fetch both catalog endpoints in parallel
    const [catalogRes, detailsRes] = await Promise.all([
      fetch(RIME_VOICES_URL),
      fetch(RIME_VOICE_DETAILS_URL),
    ])

    if (!catalogRes.ok || !detailsRes.ok) {
      return res.status(502).json({ error: 'Failed to fetch voice catalog from Rime' })
    }

    const catalog = await catalogRes.json() as Record<string, unknown>
    const details = await detailsRes.json() as Record<string, unknown>

    // Cache for 5 minutes, stale-while-revalidate for 10 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')

    return res.status(200).json({ catalog, details })
  } catch (err) {
    console.error('Voices handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
