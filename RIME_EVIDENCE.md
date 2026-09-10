Rime Evidence — Saaf

1. Voice Problem

Saaf focuses on Identifier Intelligibility.

Critical information such as OTPs, PINs, phone numbers, names and
reference IDs can be difficult to understand when spoken by natural TTS.

The goal is to make these identifiers easier to hear, distinguish and
transcribe correctly.

---

2. Hard Voice Claim

Controlled voice delivery can improve the intelligibility of critical
identifiers compared with naive TTS delivery.

Rime is used as the primary speech-generation provider.

---

3. Acceptance Test

Saaf uses a blind A/B listening test.

- A — Naive: Standard TTS delivery
- B — Controlled: Saaf-controlled delivery using Rime

The listener does not know which version is being played.

The listener hears the identifier and enters what they understood.

The transcription is then compared with the expected identifier.

---

4. Test Dataset

The evidence-generation workflow contains:

- 38 identifiers
- 2 variants per identifier
- 76 total audio clips

38 × 2 = 76 clips

The two variants allow direct comparison between naive and controlled
delivery.

---

5. Controlled Voice Techniques

The controlled version can use:

- Rime "spell()" for identifier spelling
- Custom pauses
- Inline phonetic overrides
- Controlled speech speed
- Identifier-specific delivery rules

These techniques are applied specifically to improve clarity of critical
information.

---

6. Result

The primary evaluation metric is transcription accuracy.

Version| Identifiers| Correct| Accuracy
Naive TTS| 38| [ACTUAL RESULT]| [ACTUAL %]
Controlled| 38| [ACTUAL RESULT]| [ACTUAL %]

The final values are taken from the blind listening-test results.

No estimated performance numbers are claimed.

---

7. Rime Integration

Rime is the primary spoken-output provider in the Saaf flow.

The application uses Rime for generating the spoken output used in the
comparison.

Model: "mistv2"

Other configuration values are kept consistent with the exact
configuration used in the final demo.

The Rime API key is stored through environment variables and is not
included in the repository.

---

8. Reproduction

Install dependencies:

npm install

Configure the Rime API key through ".env.local":

RIME_API_KEY=N-EIOPu4hNJpptCaKf_V2GfKZFYcH2NlHJdp4NVgoHI

Generate the evidence:

npm run generate-evidence

This generates the naive and controlled variants used for the
evaluation.

---

9. Limitations

The result can vary depending on:

- Listener
- Audio device
- Background noise
- Audio quality
- Identifier complexity
- Network conditions

Therefore, the measured result represents the documented test conditions
and should not be interpreted as a universal performance guarantee.

---

10. Conclusion

Saaf evaluates a specific voice-engineering problem:

Can critical identifiers be made easier to understand and transcribe
through controlled TTS delivery?

The blind A/B test directly compares naive and controlled voice delivery,
with Rime providing the primary spoken output.
