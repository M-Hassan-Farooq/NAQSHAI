import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { supabaseAdmin, supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

// Format raw PKR into friendly display string
function formatPkr(num) {
    const val = Number(num);
    if (!val || Number.isNaN(val)) return 'Price on request';
    if (val >= 10000000) return `PKR ${(val / 10000000).toFixed(2)} Crore`;
    if (val >= 100000) return `PKR ${(val / 100000).toFixed(2)} Lakh`;
    return `PKR ${val.toLocaleString('en-PK')}`;
}

// Extract society name from title if formatted like "Plot 101 - Gulberg Greens, Islamabad"
function extractSociety(title) {
    if (typeof title !== 'string') return '';
    const afterDash = title.split(' - ')[1];
    if (!afterDash) return '';
    return (afterDash.split(',')[0] || '').trim();
}

// Fetch live plots from Supabase joined with seller details
async function fetchLiveInventory() {
    const db = supabaseAdmin || supabase;
    const { data, error } = await db
        .from('plots')
        .select(`
            id,
            title,
            city,
            price_pkr,
            size_dimensions,
            category,
            flood_risk,
            noise_level,
            elevation_profile,
            proximity_notes,
            is_verified,
            created_at,
            sellers (
                id,
                full_name,
                phone_number,
                seller_role,
                is_identity_verified
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[api/chat] Error fetching live plots from Supabase:', error.message || error);
        return [];
    }

    return (data || []).map((row) => {
        const seller = row.sellers || null;
        return {
            id: row.id,
            title: row.title || row.id,
            society: extractSociety(row.title),
            city: row.city || '',
            size: row.size_dimensions || '10 Marla',
            price: formatPkr(row.price_pkr),
            pricePkr: Number(row.price_pkr) || 0,
            category: row.category || 'Residential',
            floodRisk: row.flood_risk || 'Assessment Pending',
            noiseLevel: row.noise_level || 'Assessment Pending',
            elevationProfile: row.elevation_profile || 'Pending Survey',
            proximityNotes: row.proximity_notes || '',
            sellerName: seller?.full_name || '',
            sellerPhone: seller?.phone_number || '',
            sellerRole: seller?.seller_role || 'Direct Owner',
            isVerified: !!row.is_verified || !!seller?.is_identity_verified
        };
    });
}

export async function POST(req) {
    try {
        const { messages, language } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("[api/chat] GEMINI_API_KEY is not set.");
            return NextResponse.json({
                reply: "Gemini API Key is not configured. Please check your environment variables.",
                recommendedPlots: []
            });
        }

        // 1. Fetch live plots directly from Supabase (Zero mock data)
        const liveInventory = await fetchLiveInventory();

        const ai = new GoogleGenAI({ apiKey });

        const LANG_MAP = {
            'EN': 'English',
            'UR': 'Nastaliq Urdu script (اردو)',
            'RO': 'Roman Urdu'
        };

        const baseSystemInstruction = `You are NAQSHAI AI - an expert land recommendation chatbot for real estate in Pakistan.
You provide intelligent plot recommendations powered strictly by live database records from Supabase.

CRITICAL DATA DIRECTIVE:
1. ONLY recommend plots present in the LIVE SUPABASE INVENTORY provided below.
2. NEVER hallucinate, invent, or fall back to any fictional or hardcoded plots.
3. If the user's criteria (city, budget, society, or plot size) cannot be matched by any plot in the live inventory:
   - Set 'recommendedPlots' to an empty array: []
   - In your 'reply', clearly and politely inform the user that no registered plots in the database match their specific criteria.
   - Mention the cities and societies that ARE currently available in the database (e.g. Islamabad, Rawalpindi) and offer to help them adjust their filters.

LIVE SUPABASE DATABASE INVENTORY:
${JSON.stringify(liveInventory, null, 2)}

INVENTORY SUMMARY:
- Total live properties in database: ${liveInventory.length}
- Available cities: ${[...new Set(liveInventory.map(p => p.city).filter(Boolean))].join(', ') || 'None currently'}

CORE ADVISORY GUIDELINES:
1. REQUIREMENTS CHECK & FOLLOW-UP:
   - If the user asks a general question without specifying city or budget, ask clarifying questions to narrow down their preferred location, budget, and size (e.g., 5 Marla, 10 Marla, 1 Kanal).
   - If user asks for all available plots or what is in the database, present the top matching plots from the live inventory.

2. MATCHING & RISK ASSESSMENT:
   - Match requirements against the live inventory.
   - Include any matching plot objects inside the 'recommendedPlots' array.
   - In your 'reply' text, explain WHY each recommended plot fits their requirements, actively analyzing:
     * Flood Risk (e.g. Low Hazard, Elevated Ridge, Drainage)
     * Noise Level (e.g. Residential Quiet Zone, Proximity to Expressway)
     * Elevation Profile and Proximity / Landmarks.

3. CONVERSATIONAL DIRECTNESS:
   - Do NOT start responses with filler pleasantries like 'I am doing well, thank you!' unless the user specifically asks how you are. Answer their real estate query immediately.

4. LANGUAGE & SCRIPT FIDELITY:
   - Match the user's language and script:
     a) English: Reply in clear, professional English.
     b) Roman Urdu: If user queries in Roman Urdu (e.g., "Islamabad me 10 marla plot dikhao"), reply in natural, fluent Roman Urdu.
     c) Urdu Script (اردو): If user queries in Urdu script, reply in standard Nastaliq Urdu script.
   - Strictly avoid CJK or corrupted Unicode characters in the output.

5. STRUCTURED JSON OUTPUT:
   - You MUST output a valid JSON object matching this schema:
     {
       "reply": "Your conversational analysis and response text",
       "recommendedPlots": [
         {
           "id": "Exact Plot ID from inventory, e.g. Plot-345",
           "title": "Title from inventory",
           "society": "Society name",
           "city": "City name",
           "size": "Plot size",
           "price": "Formatted price",
           "floodRisk": "Flood risk assessment",
           "noiseLevel": "Noise level assessment"
         }
       ]
     }`;

        let finalSystemInstruction = baseSystemInstruction;
        if (language && language !== 'Auto' && LANG_MAP[language]) {
            finalSystemInstruction += `\n\nLANGUAGE OVERRIDE: The user interface language is explicitly locked to ${LANG_MAP[language]}. You MUST write the 'reply' field ENTIRELY in ${LANG_MAP[language]}.`;
        }

        // Format conversation history for Gemini SDK
        const contents = messages.map((msg) => {
            const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
            const textContent = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
            return {
                role,
                parts: [{ text: textContent }],
            };
        });

        // Use active model gemini-3.6-flash with retry on transient load spikes
        const maxRetries = 3;
        let responseText = null;
        let lastError = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-3.6-flash',
                    contents: contents,
                    config: {
                        systemInstruction: finalSystemInstruction,
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
                lastError = err;
                console.warn(`[api/chat] Attempt ${attempt} failed:`, err.message || err);
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, 1200 * attempt));
                }
            }
        }

        if (!responseText) {
            console.error("[api/chat] All attempts failed. Last error:", lastError);
            throw lastError || new Error('Failed to generate response from Gemini');
        }

        let cleanText = responseText.trim();
        cleanText = cleanText.replace(/```json/gi, '').replace(/```/g, '').trim();

        let parsedData;
        try {
            parsedData = JSON.parse(cleanText);
            if (typeof parsedData === 'string') {
                parsedData = JSON.parse(parsedData);
            }
        } catch (e) {
            console.error("[api/chat] JSON parse error on raw output:", responseText);
            parsedData = {
                reply: cleanText,
                recommendedPlots: []
            };
        }

        // Sanitize nested reply JSON strings if any
        if (typeof parsedData?.reply === 'string' && parsedData.reply.trim().startsWith('{')) {
            try {
                const nested = JSON.parse(parsedData.reply.trim());
                if (nested && nested.reply) {
                    parsedData.reply = nested.reply;
                    if (Array.isArray(nested.recommendedPlots) && (!parsedData.recommendedPlots || parsedData.recommendedPlots.length === 0)) {
                        parsedData.recommendedPlots = nested.recommendedPlots;
                    }
                }
            } catch (_) {}
        }

        let replyText = parsedData.reply || cleanText || '';
        if (typeof replyText === 'string') {
            replyText = replyText.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, '').trim();
        }

        // Validate recommendedPlots against liveInventory to guarantee 0 hallucinations
        const validatedPlots = (parsedData.recommendedPlots || []).filter(rec => {
            return liveInventory.some(live => live.id.toLowerCase() === (rec.id || '').toLowerCase());
        }).map(rec => {
            const liveMatch = liveInventory.find(live => live.id.toLowerCase() === (rec.id || '').toLowerCase());
            return {
                ...rec,
                sellerName: liveMatch?.sellerName || '',
                sellerPhone: liveMatch?.sellerPhone || '',
                sellerRole: liveMatch?.sellerRole || 'Direct Owner',
                isVerified: liveMatch?.isVerified || false,
                elevation: liveMatch?.elevationProfile || 'Pending Survey',
                landmarks: liveMatch?.proximityNotes || ''
            };
        });

        return NextResponse.json({
            reply: replyText,
            recommendedPlots: validatedPlots
        });

    } catch (err) {
        console.error('[api/chat] Server error:', err);
        return NextResponse.json(
            {
                reply: "Maazrat, request process karne me takneeki masla aya. Meharbani karke dobara koshish karein.",
                recommendedPlots: [],
                error: err.message || 'Internal Server Error'
            },
            { status: 500 }
        );
    }
}
