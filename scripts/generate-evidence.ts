#!/usr/bin/env node
/**
 * generate-evidence.ts
 *
 * CLI script that reproduces the full evidence bundle without running the web app.
 * Judges can run: npm run generate-evidence
 *
 * What it does:
 *  1. Reads fixtures/fixtures.json
 *  2. For each identifier, builds naive + tuned text via the pipeline
 *  3. Synthesizes both clips via Rime (same voice/model held constant)
 *  4. Saves .mp3 files to evidence/clips/
 *  5. Writes evidence/evidence-manifest.json
 *
 * Requires: RIME_API_KEY env var (from .env.local or system env)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { buildPair } from '../src/lib/pipeline.js'

// Load env from .env.local if present
try {
  const envFile = readFileSync('.env.local', 'utf-8')
  for (const line of envFile.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) {
      process.env[key.trim()] = rest.join('=').trim()
    }
  }
} catch {
  // No .env.local — use system env
}

const RIME_TTS_URL = 'https://users.rime.ai/v1/rime-tts'
const SPEAKER = process.env.EVIDENCE_SPEAKER ?? 'cove'  // Override with EVIDENCE_SPEAKER=<name>
const CLIPS_DIR = join(process.cwd(), 'evidence', 'clips')
const MANIFEST_PATH = join(process.cwd(), 'evidence', 'evidence-manifest.json')

interface Fixtures {
  names: string[]
  phone_numbers: string[]
  pincodes: string[]
  order_ids: string[]
}

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

async function synthesize(
  text: string,
  speedAlpha: number,
  phonemizeBetweenBrackets: boolean,
  pauseBetweenBrackets: boolean,
): Promise<Buffer> {
  const apiKey = process.env.RIME_API_KEY
  if (!apiKey) throw new Error('RIME_API_KEY not set')

  const res = await fetch(RIME_TTS_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      modelId: 'mistv2',
      speaker: SPEAKER,
      lang: 'eng',
      speedAlpha,
      phonemizeBetweenBrackets,
      pauseBetweenBrackets,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Rime TTS failed: ${res.status} ${err}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function main() {
  const apiKey = process.env.RIME_API_KEY
  if (!apiKey) {
    console.error('❌  RIME_API_KEY is not set. Add it to .env.local or set it in your environment.')
    process.exit(1)
  }

  // Ensure output directory exists
  mkdirSync(CLIPS_DIR, { recursive: true })

  const fixturesPath = join(process.cwd(), 'fixtures', 'fixtures.json')
  const fixtures: Fixtures = JSON.parse(readFileSync(fixturesPath, 'utf-8'))

  console.log(`\n🎙️  Saaf Evidence Generator`)
  console.log(`   Model:   mistv2`)
  console.log(`   Speaker: ${SPEAKER}`)
  console.log(`   Output:  evidence/clips/\n`)

  const manifest: Array<{
    clipFile: string
    category: string
    identifier: string
    condition: 'naive' | 'tuned'
    text: string
    expectedText: string
  }> = []

  const categories = ['names', 'phone_numbers', 'pincodes', 'order_ids'] as const
  let total = 0
  let errors = 0

  for (const category of categories) {
    const items = fixtures[category]
    console.log(`\n📂 ${category} (${items.length} items × 2 conditions = ${items.length * 2} clips)`)

    for (const identifier of items) {
      const rawSentence = buildSentence(identifier, category)
      const { naive, tuned } = buildPair(rawSentence, identifier)

      for (const [condition, result] of [['naive', naive], ['tuned', tuned]] as const) {
        const clipFile = `${category}__${identifier.replace(/[^a-zA-Z0-9]/g, '_')}__${condition}.mp3`
        const clipPath = join(CLIPS_DIR, clipFile)

        process.stdout.write(`  ${condition === 'naive' ? '⚠' : '✓'} ${identifier} [${condition}]… `)

        try {
          const audioBuffer = await synthesize(
            result.text,
            result.speedAlpha,
            result.phonemizeBetweenBrackets,
            result.pauseBetweenBrackets,
          )
          writeFileSync(clipPath, audioBuffer)
          manifest.push({
            clipFile,
            category,
            identifier,
            condition,
            text: result.text,
            expectedText: identifier,
          })
          console.log(`✅  (${audioBuffer.length} bytes)`)
          total++
        } catch (err) {
          console.log(`❌  ${err instanceof Error ? err.message : String(err)}`)
          errors++
        }

        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 150))
      }
    }
  }

  // Write manifest
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))

  console.log(`\n📋 Manifest written to evidence/evidence-manifest.json`)
  console.log(`\n✅  Done: ${total} clips generated, ${errors} errors`)
  console.log(`\nNext step: open the Test Lab in the app to run the blind listening test.`)

  if (errors > 0) process.exit(1)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
