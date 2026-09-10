

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

## Demo

A separate recorded demo demonstrates:

1. Target user and problem
2. Normal Saaf workflow
3. Naive vs controlled delivery
4. Identifier intelligibility challenge
5. Stress/failure case
6. Evaluation workflow
7. Rime as the active provider

## Repository

GitHub:
https://github.com/aayushhvrma-dotcom/Saaf

## Tagline

**Make critical information clear enough to hear — not just natural enough to speak.**
