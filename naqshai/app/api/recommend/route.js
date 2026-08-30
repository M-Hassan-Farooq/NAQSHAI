import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const MOCK_INVENTORY = [
    {
        id: "plot-101",
        title: "Plot 101 - Block A, Gulberg Greens",
        society: "Gulberg Greens",
        city: "Islamabad",
        size: "1 Kanal",
        price: "PKR 3.8 Crore",
        floodRisk: "Low (Elevated Ridge)",
        noiseLevel: "Low (Residential Zone)",
        description: "Prime 1 Kanal residential plot in Gulberg Greens Islamabad. High elevation with excellent drainage and 0% flood history."
    },
    {
        id: "plot-204",
        title: "Plot 204 - Phase 8, Bahria Town",
        society: "Bahria Town",
        city: "Rawalpindi",
        size: "10 Marla",
        price: "PKR 1.85 Crore",
        floodRisk: "Moderate (Near Natural Drain)",
        noiseLevel: "Medium (Commercial Proximity)",
        description: "10 Marla plot under 2 Crore in Bahria Town Phase 8. Convenient location close to markets."
    },
    {
        id: "plot-309",
        title: "Plot 309 - Sector F, DHA Phase 1",
        society: "DHA Phase 1",
        city: "Islamabad",
        size: "5 Marla",
        price: "PKR 1.4 Crore",
        floodRisk: "Very Low (High Plateau)",
        noiseLevel: "Low (Park Facing)",
        description: "5 Marla plot in DHA Phase 1 Islamabad, facing green park with top security and infrastructure."
    },
    {
        id: "plot-402",
        title: "Plot 402 - Sector B, Park View City",
        society: "Park View City",
        city: "Islamabad",
        size: "10 Marla",
        price: "PKR 1.95 Crore",
        floodRisk: "Low (Hilly Terrain)",
        noiseLevel: "Very Low (Peaceful Hillside)",
        description: "Scenic 10 Marla residential plot in Park View City Islamabad under 2 Crore with Margalla hills view."
    },
    {
        id: "plot-510",
        title: "Plot 510 - Phase 6, DHA",
        society: "DHA Phase 6",
        city: "Lahore",
        size: "1 Kanal",
        price: "PKR 4.2 Crore",
        floodRisk: "Low",
        noiseLevel: "Low",
        description: "1 Kanal luxury residential plot in DHA Lahore Phase 6 with underground electrical infrastructure."
    },
    {
        id: "plot-615",
        title: "Plot 615 - Block 5, Clifton",
        society: "Clifton",
        city: "Karachi",
        size: "10 Marla",
        price: "PKR 5.5 Crore",
        floodRisk: "Low (Coastal Plain)",
        noiseLevel: "Medium",
        description: "10 Marla prime plot in Clifton Karachi near seaside commercial and diplomatic zone."
    }
];

export async function POST(req) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set in environment variables.");
            return NextResponse.json({
                reply: "API Key configure nahi hai. Meharbani karke GEMINI_API_KEY check karein.",
                recommendedPlots: []
            });
        }

        const ai = new GoogleGenAI({ apiKey });

        const systemInstruction = `You are NAQSHAI AI - an expert land recommendation chatbot for real estate in Pakistan.

REAL ESTATE INVENTORY AVAILABLE FOR RECOMMENDATION:
${JSON.stringify(MOCK_INVENTORY, null, 2)}

CORE GUIDELINES:
1. REQUIREMENTS CHECK:
   - If the user's city, budget, or preferred plot size (e.g. 5 Marla, 10 Marla, 1 Kanal) are unknown or missing, ask friendly clarifying questions to get their city, budget, and size preferences.
   - Do not recommend plots if key criteria are missing unless user asks for all available options.

2. MATCHING & RECOMMENDATION:
   - Match user requirements (city, budget, plot size) against the inventory above.
   - Include any matching plot objects inside the 'recommendedPlots' array.
   - In the 'reply' text, clearly explain why these plots match the user's needs, explicitly highlighting environmental factors: Flood Risk and Noise Level.

3. LANGUAGE & SCRIPT ADAPTATION (CRITICAL):
   - Detect the language and script used in the user's latest prompt.
   - STRICTLY respond in the exact same language and script:
     a) English: If user writes in English, reply in natural English.
     b) Urdu Script (اردو): If user writes in Urdu script, reply in fluent Urdu script.
     c) Roman Urdu: If user writes in Roman Urdu (e.g., "Muje Islamabad me 10 Marla plot chahiye"), reply in natural Roman Urdu.

4. STRUCTURED JSON OUTPUT:
   - You MUST return a valid JSON object with:
     - 'reply': A comprehensive text response (incorporating flood risk and noise level analysis).
     - 'recommendedPlots': An array of plot objects selected from the inventory. Each object MUST have keys: id, title, society, city, size, price, floodRisk, noiseLevel.
     - If asking follow-up questions or no plots match, set 'recommendedPlots' to [].`;

        // Format history for Gemini SDK
        const contents = messages.map((msg) => {
            const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
            const textContent = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
            return {
                role,
                parts: [{ text: textContent }],
            };
        });

        const modelsToTry = [
            'gemini-2.5-flash',
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite',
            'gemma-4-31b-it',
            'gemini-2.5-pro'
        ];

        let responseText = null;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: contents,
                    config: {
                        systemInstruction,
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

                if (response && response.text) {
                    responseText = response.text;
                    break;
                }
            } catch (err) {
                console.warn(`Model ${modelName} failed:`, err.message);
                lastError = err;
            }
        }

        if (!responseText) {
            console.error("All Gemini models failed. Last error:", lastError);
            throw lastError || new Error('Failed to generate content with available Gemini models');
        }

        let cleanedText = responseText.trim();
        if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        }

        let parsed;
        try {
            parsed = JSON.parse(cleanedText);
        } catch (e) {
            console.error("JSON parse failed. Raw text:", responseText);
            parsed = {
                reply: responseText,
                recommendedPlots: []
            };
        }

        return NextResponse.json({
            reply: parsed.reply || '',
            recommendedPlots: parsed.recommendedPlots || []
        });

    } catch (error) {
        console.error('Error in /api/recommend:', error);
        return NextResponse.json(
            {
                reply: 'Maazrat, AI recommendation server me masla agaya. Dobara koshish karein.',
                recommendedPlots: [],
                error: error.message
            },
            { status: 500 }
        );
    }
}
