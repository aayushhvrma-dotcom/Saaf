import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readFileSync } from 'fs'
import { join } from 'path'
import { buildPair } from '../../src/lib/pipeline'

interface Fixtures {
  names: string[]
  phone_numbers: string[]
  pincodes: string[]
  order_ids: string[]
}

interface EvidenceClip {
  id: string
  category: string
  identifier: string
  condition: 'naive' | 'tuned'
  text: string
  speedAlpha: number
  phonemizeBetweenBrackets: boolean
  pauseBetweenBrackets: boolean
}

const RIME_TTS_URL = 'https://users.rime.ai/v1/rime-tts'

function buildSentence(identifier: string, category: string): string {
  switch (category) {
    case 'names':
      return `This call is for ${identifier}. Please confirm if this is correct.`
    case 'phone_numbers':
      return `Your registered phone number is ${identifier}. Please verify this number.`
    case 'pincodes':
      return `Your delivery pincode is ${identifier}. We will deliver to this location.`
    case 'order_ids':
      return `Your order reference is ${identifier}. Please keep this for your records.`
    default:
      return `Your identifier is ${identifier}. Please note it down.`
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RIME_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'RIME_API_KEY not configured' })
  }

  const { speaker } = req.body as { speaker: string }
  if (!speaker) {
    return res.status(400).json({ error: 'speaker is required' })
  }

  // Read the fixture set
  const fixturesPath = join(process.cwd(), 'fixtures', 'fixtures.json')
  const fixtures: Fixtures = JSON.parse(readFileSync(fixturesPath, 'utf-8'))

  const clips: EvidenceClip[] = []
  const manifest: Array<{
    clipId: string
    category: string
    identifier: string
    condition: 'naive' | 'tuned'
    expectedText: string
  }> = []

  // Build all clips
  const categories = ['names', 'phone_numbers', 'pincodes', 'order_ids'] as const
  for (const category of categories) {
    const items = fixtures[category]
    for (const identifier of items) {
      const rawSentence = buildSentence(identifier, category)
      const { naive, tuned } = buildPair(rawSentence, identifier)

      clips.push({
        id: `${category}_${identifier}_naive`,
        category,
        identifier,
        condition: 'naive',
        text: naive.text,
        speedAlpha: naive.speedAlpha,
        phonemizeBetweenBrackets: naive.phonemizeBetweenBrackets,
        pauseBetweenBrackets: naive.pauseBetweenBrackets,
      })

      clips.push({
        id: `${category}_${identifier}_tuned`,
        category,
        identifier,
        condition: 'tuned',
        text: tuned.text,
        speedAlpha: tuned.speedAlpha,
        phonemizeBetweenBrackets: tuned.phonemizeBetweenBrackets,
        pauseBetweenBrackets: tuned.pauseBetweenBrackets,
      })
    }
  }

  // Synthesize each clip
  const results: Array<{ clipId: string; status: 'ok' | 'error'; error?: string }> = []

  for (const clip of clips) {
    try {
      const rimeRes = await fetch(RIME_TTS_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: clip.text,
          modelId: 'mistv2',
          speaker,
          lang: 'eng',
          speedAlpha: clip.speedAlpha,
          phonemizeBetweenBrackets: clip.phonemizeBetweenBrackets,
          pauseBetweenBrackets: clip.pauseBetweenBrackets,
        }),
      })

      if (!rimeRes.ok) {
        results.push({ clipId: clip.id, status: 'error', error: `HTTP ${rimeRes.status}` })
      } else {
        manifest.push({
          clipId: clip.id,
          category: clip.category,
          identifier: clip.identifier,
          condition: clip.condition,
          expectedText: clip.identifier,
        })
        results.push({ clipId: clip.id, status: 'ok' })
      }
    } catch (err) {
      results.push({ clipId: clip.id, status: 'error', error: String(err) })
    }
  }

  return res.status(200).json({
    speaker,
    totalClips: clips.length,
    results,
    manifest,
  })
}
