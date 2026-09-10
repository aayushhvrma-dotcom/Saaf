<<<<<<< HEAD
# Saaf — Controlled Voice Delivery

**DataForge × Rime Hackathon Entry**

Saaf is a voice-native pipeline and tool demonstrating *controlled delivery* of critical identifiers (OTPs, pincodes, phone numbers, and names) using the Rime TTS API. It addresses the real-world problem of unintelligible readbacks in IVR and telephony systems by leveraging Rime's `spell()` function, custom pauses, and inline phonetic overrides.

## Hackathon Compliance Checklist
- [x] **Rime-generated speech must be essential:** Yes. This project is entirely about manipulating Rime's generation parameters (speed, pauses, phonemes, spell) to achieve intelligible readbacks of edge-case identifiers.
- [x] **Active speech provider observable:** Yes. The `<ProviderBadge>` is always visible in the header, showing the active provider (Rime) and model (mistv2).
- [x] **Hard voice problem + acceptance test:** The problem is identifier intelligibility. The acceptance test is a blind A/B listening test (Naive vs. Tuned).
- [x] **No credentials in source:** `RIME_API_KEY` is strictly read from environment variables and proxied through Vercel serverless functions.
- [x] **Working code:** Fully functional React application and CLI test harness.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Vercel Serverless Functions (`/api/*`)
- Scripting: Node.js + tsx
- Tests: Vitest

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Copy `.env.example` to `.env.local` and add your Rime API key:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and set RIME_API_KEY=your_key
   ```

3. **Run the App Locally:**
   ```bash
   npm run dev
   ```
   *(Note: Because this uses Vercel serverless functions for the `/api` routes, you may need to run `vercel dev` if you want to test the full pipeline locally, or configure a local proxy in Vite).*

## Acceptance Test (Blind A/B Listening)

To prove that the tuned pipeline improves intelligibility over the naive approach, run the acceptance test harness:

1. **Generate the audio clips:**
   ```bash
   npm run generate-evidence
   ```
   This script synthesizes 76 audio clips (naive and tuned variants of 38 identifiers) using the Mist v2 model and saves them to `evidence/clips/`.

2. **Run the Listening Test:**
   Open the app, navigate to the **Test Lab** tab, and perform the blind A/B test. Listen to each clip and transcribe what you hear. 

3. **Export Results:**
   Click "Export evidence-results.json" and document your findings in `RIME_EVIDENCE.md`.
=======


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
