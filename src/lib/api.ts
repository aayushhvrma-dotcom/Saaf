/**
 * Client-side API helpers.
 *
 * All calls go to /api/* (Vercel serverless functions).
 * The RIME_API_KEY never appears in this file or the browser bundle.
 */

export interface SynthesizeOptions {
  text: string
  speaker: string
  speedAlpha?: number
  phonemizeBetweenBrackets?: boolean
  pauseBetweenBrackets?: boolean
  inlineSpeedAlpha?: string
}

/**
 * Synthesize speech. Returns a Blob URL you can set as <audio src>.
 * Revoke the URL with URL.revokeObjectURL() when done.
 */
export async function synthesize(opts: SynthesizeOptions): Promise<string> {
  const res = await fetch('/api/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error: string }).error ?? 'Synthesis failed')
  }

  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

/**
 * Check which words in the text are out-of-vocabulary for Rime.
 */
export async function checkCoverage(text: string): Promise<string[]> {
  const res = await fetch('/api/coverage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) throw new Error('Coverage check failed')
  const data = await res.json() as { oovWords: string[] }
  return data.oovWords
}

/**
 * Preview how Rime's text normalizer will expand numbers, dates, etc.
 */
export async function normalizeText(text: string): Promise<string> {
  const res = await fetch('/api/normalize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) throw new Error('Normalization failed')
  const data = await res.json() as { normalized: string }
  return data.normalized
}

/**
 * Fetch the live Rime voice catalog.
 */
export async function fetchVoices(): Promise<{
  catalog: Record<string, Record<string, string[]>>
  details: unknown
}> {
  const res = await fetch('/api/voices')
  if (!res.ok) throw new Error('Failed to fetch voice catalog')
  return res.json()
}

/**
 * Extract Mist v2 English speaker IDs from the catalog response.
 */
export function getMistV2EnglishVoices(
  catalog: Record<string, Record<string, string[]>>,
): string[] {
  // Catalog structure: { mistv2: { eng: ["speaker1", ...], ... }, ... }
  return catalog?.mistv2?.eng ?? catalog?.mistv2?.['eng'] ?? []
}
