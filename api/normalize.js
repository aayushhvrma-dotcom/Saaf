// Note: text normalization uses a different host — optimize.rime.ai
const RIME_TEXTNORM_URL = 'https://optimize.rime.ai/textnorm';
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const apiKey = process.env.RIME_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'RIME_API_KEY not configured' });
    }
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'text is required' });
    }
    try {
        const rimeRes = await fetch(RIME_TEXTNORM_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });
        if (!rimeRes.ok) {
            const errText = await rimeRes.text();
            return res.status(rimeRes.status).json({ error: 'Rime textnorm failed', detail: errText });
        }
        const data = await rimeRes.json();
        return res.status(200).json({ normalized: data.normalized });
    }
    catch (err) {
        console.error('Normalize handler error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
