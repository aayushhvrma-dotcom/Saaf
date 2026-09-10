const RIME_TTS_URL = 'https://users.rime.ai/v1/rime-tts';
const MAX_CHARS = 1000;
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const apiKey = process.env.RIME_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'RIME_API_KEY not configured' });
    }
    const body = req.body;
    if (!body.text || typeof body.text !== 'string') {
        return res.status(400).json({ error: 'text is required' });
    }
    if (!body.speaker || typeof body.speaker !== 'string') {
        return res.status(400).json({ error: 'speaker is required' });
    }
    if (body.text.length > MAX_CHARS) {
        return res.status(400).json({ error: `text exceeds ${MAX_CHARS} character limit` });
    }
    const rimeBody = {
        text: body.text,
        modelId: 'mistv2',
        speaker: body.speaker,
        lang: 'eng',
        speedAlpha: body.speedAlpha ?? 1.0,
        phonemizeBetweenBrackets: body.phonemizeBetweenBrackets ?? true,
        pauseBetweenBrackets: body.pauseBetweenBrackets ?? true,
    };
    if (body.inlineSpeedAlpha) {
        rimeBody.inlineSpeedAlpha = body.inlineSpeedAlpha;
    }
    try {
        const rimeRes = await fetch(RIME_TTS_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg',
            },
            body: JSON.stringify(rimeBody),
        });
        if (!rimeRes.ok) {
            const errText = await rimeRes.text();
            console.error('Rime TTS error:', rimeRes.status, errText);
            return res.status(rimeRes.status).json({
                error: 'Rime TTS request failed',
                detail: errText,
                rimeStatus: rimeRes.status,
            });
        }
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'no-store');
        // Stream the audio bytes directly back to the client
        const audioBuffer = await rimeRes.arrayBuffer();
        return res.status(200).send(Buffer.from(audioBuffer));
    }
    catch (err) {
        console.error('Synthesize handler error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
