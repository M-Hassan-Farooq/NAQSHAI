import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const candidates = [
    'gemini-3.6-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
];

async function test() {
    for (const model of candidates) {
        try {
            console.log(`Trying model: ${model}`);
            const response = await ai.models.generateContent({
                model: model,
                contents: 'Say OK'
            });
            console.log(`SUCCESS with ${model}:`, response.text);
            break;
        } catch (err) {
            console.warn(`Failed ${model}:`, err.message || err);
        }
    }
}
test();
