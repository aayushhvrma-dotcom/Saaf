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
