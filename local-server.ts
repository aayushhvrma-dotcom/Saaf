import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: '.env.local' })

const app = express()
app.use(cors())
app.use(express.json())

const RIME_API_KEY = process.env.RIME_API_KEY

// ---------------------------------------------------------
// Synthesize Endpoint
// ---------------------------------------------------------
app.post('/api/synthesize', async (req, res) => {
  if (!RIME_API_KEY) {
    return res.status(500).json({ error: 'RIME_API_KEY not configured in .env.local' })
  }

  const { text, speaker, speedAlpha, phonemizeBetweenBrackets, pauseBetweenBrackets, inlineSpeedAlpha } = req.body

  if (!text || !speaker) {
    return res.status(400).json({ error: 'text and speaker are required' })
  }

  const rimeBody: any = {
    text,
    modelId: 'mistv2',
    speaker,
    lang: 'eng',
    speedAlpha: speedAlpha ?? 1.0,
    phonemizeBetweenBrackets: phonemizeBetweenBrackets ?? true,
    pauseBetweenBrackets: pauseBetweenBrackets ?? true,
  }
  if (inlineSpeedAlpha) rimeBody.inlineSpeedAlpha = inlineSpeedAlpha

  try {
    const rimeRes = await fetch('https://users.rime.ai/v1/rime-tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RIME_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify(rimeBody),
    })

    if (!rimeRes.ok) {
      const errText = await rimeRes.text()
      return res.status(rimeRes.status).json({ error: 'Rime TTS failed', detail: errText })
    }

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-store')
    
    const audioBuffer = await rimeRes.arrayBuffer()
    res.status(200).send(Buffer.from(audioBuffer))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// ---------------------------------------------------------
// Coverage Endpoint
// ---------------------------------------------------------
app.post('/api/coverage', async (req, res) => {
  if (!RIME_API_KEY) return res.status(500).json({ error: 'Missing RIME_API_KEY' })
  try {
    const rimeRes = await fetch('https://users.rime.ai/oov', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RIME_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: req.body.text }),
    })
    if (!rimeRes.ok) return res.status(rimeRes.status).json({ error: 'OOV check failed' })
    const oovWords = await rimeRes.json()
    res.status(200).json({ oovWords })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// ---------------------------------------------------------
// Normalize Endpoint
// ---------------------------------------------------------
app.post('/api/normalize', async (req, res) => {
  if (!RIME_API_KEY) return res.status(500).json({ error: 'Missing RIME_API_KEY' })
  try {
    const rimeRes = await fetch('https://optimize.rime.ai/textnorm', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RIME_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: req.body.text }),
    })
    if (!rimeRes.ok) return res.status(rimeRes.status).json({ error: 'Normalization failed' })
    const data = await rimeRes.json()
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// ---------------------------------------------------------
// Voices Endpoint
// ---------------------------------------------------------
app.get('/api/voices', async (req, res) => {
  try {
    const [catalogRes, detailsRes] = await Promise.all([
      fetch('https://users.rime.ai/data/voices/all-v2.json'),
      fetch('https://users.rime.ai/data/voices/voice_details.json'),
    ])
    if (!catalogRes.ok || !detailsRes.ok) return res.status(502).json({ error: 'Voice fetch failed' })
    
    const catalog = await catalogRes.json()
    const details = await detailsRes.json()
    res.status(200).json({ catalog, details })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`\n🚀 Local API server running on http://localhost:${PORT}`)
})
