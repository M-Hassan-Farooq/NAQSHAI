import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function test() {
    try {
        console.log('Testing gemini-3.6-flash with responseSchema...');
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [{ role: 'user', parts: [{ text: 'What plots are available in Islamabad?' }] }],
            config: {
                systemInstruction: 'You are an advisor. Return JSON.',
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        reply: { type: Type.STRING },
                        recommendedPlots: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    society: { type: Type.STRING },
                                    city: { type: Type.STRING },
                                    size: { type: Type.STRING },
                                    price: { type: Type.STRING },
                                    floodRisk: { type: Type.STRING },
                                    noiseLevel: { type: Type.STRING }
                                },
                                required: ['id', 'title', 'society', 'city', 'size', 'price', 'floodRisk', 'noiseLevel']
                            }
                        }
                    },
                    required: ['reply', 'recommendedPlots']
                }
            }
        });
        console.log('gemini-3.6-flash SUCCESS:', response.text);
    } catch (err) {
        console.error('gemini-3.6-flash ERROR:', err);
    }
}
test();
