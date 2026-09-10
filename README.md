
# Saaf — Controlled Voice Delivery
## DataForge × Rime Hackathon

**Saaf** is a voice-native system designed to make critical identifiers
such as OTPs, PINs, phone numbers, names and reference IDs easier to
understand when spoken through TTS.

## Problem

Natural TTS can make numbers, letters, abbreviations and uncommon names
difficult to distinguish.

For critical information, intelligibility is more important than simply
sounding natural.

## Solution

Saaf converts critical identifiers into controlled speech using Rime TTS.

It uses:

- Rime `spell()` for controlled spelling
- Custom pauses
- Inline phonetic overrides
- Controlled speech speed
- Identifier-specific delivery rules

## Why Voice Is Essential

Voice is the core of Saaf.

The product is specifically evaluating whether a listener can correctly
understand and transcribe an identifier when it is spoken.

Rime is the primary speech provider in the demonstrated flow.

## Hard Voice Problem

**Identifier Intelligibility**

> Can critical identifiers be delivered through TTS so that listeners can
> accurately understand and transcribe them?

## Acceptance Test

Saaf uses a blind A/B listening test.

- A = Naive TTS delivery
- B = Saaf controlled delivery
- 38 identifiers
- 2 variants per identifier
- 76 total audio clips

Listeners transcribe what they hear without knowing which version is tuned.

The transcription accuracy is then compared between the two variants.

## Architecture

User → React/Vite UI → Vercel API → Rime TTS → Controlled Audio

## Tech Stack

- React
- Vite
- Tailwind CSS
- Vercel Serverless Functions
- Node.js
- TypeScript / tsx
- Vitest
- Rime TTS

## Rime Integration

| Configuration | Value |
|---|---|
| Provider | Rime |
| Model | `mistv2` |
| Speaker | Actual demo speaker |
| Language | Actual demo language |
| Endpoint | Actual endpoint |
| Audio Format | Actual format |
| Transport | Actual transport |

> The remaining values must match the exact configuration used in the final demo.

## Security

The Rime API key is stored only in environment variables.

It is never committed to GitHub, README, screenshots, recordings or
client-side code.

## Evidence

Detailed voice evaluation is documented separately in:

`RIME_EVIDENCE.md`

## Demo Video

🎥 **Full Demo Video:**  
[Watch the Saaf Demo](https://drive.google.com/drive/folders/1E4iRtIUX4vdoG4hS5Yzc6JPCsZNXFrLO)

The demo demonstrates:

- The identifier intelligibility problem
- Naive vs controlled voice delivery
- Rime as the primary TTS provider
- Blind A/B evaluation
- Final result


## Repository

GitHub:
https://github.com/aayushhvrma-dotcom/Saaf

## Tagline

**Make critical information clear enough to hear — not just natural enough to speak.**
>>>>>>> a55ae7d4cebf60ff37810e1ea26fce2a2f130249
