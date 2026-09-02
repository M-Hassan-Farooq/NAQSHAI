import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const candidates = [
    'gemini-3.6-flash',
    'gemini-3.1-pro-preview',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite'
];

async function test() {
    for (const m of candidates) {
        try {
            const res = await ai.models.generateContent({
                model: m,
                contents: 'Hello'
            });
            console.log(`Model ${m}: SUCCESS ->`, res.text?.trim());
        } catch (e) {
            console.log(`Model ${m}: FAILED (${e.status || 'unknown'}) ->`, e.message?.slice(0, 120));
        }
    }
}
test();
