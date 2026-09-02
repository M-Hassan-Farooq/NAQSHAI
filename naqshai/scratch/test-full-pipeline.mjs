import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
});

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

async function test() {
    try {
        const { data, error } = await supabaseAdmin
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
            console.error('Supabase error:', error);
            return;
        }

        const liveInventory = (data || []).map((row) => {
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

        console.log(`Loaded ${liveInventory.length} plots from Supabase.`);

        const apiKey = process.env.GEMINI_API_KEY;
        const ai = new GoogleGenAI({ apiKey });

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

CORE ADVISORY GUIDELINES:
1. MATCHING & RISK ASSESSMENT:
   - Match requirements against the live inventory.
   - Include any matching plot objects inside the 'recommendedPlots' array.
   - In your 'reply' text, explain WHY each recommended plot fits their requirements, actively analyzing:
     * Flood Risk (e.g. Low Hazard, Elevated Ridge, Drainage)
     * Noise Level (e.g. Residential Quiet Zone, Proximity to Expressway)
     * Elevation Profile and Proximity / Landmarks.

2. STRUCTURED JSON OUTPUT:
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

        const messages = [{ role: 'user', content: 'What plots are available in Islamabad?' }];
        const contents = messages.map((msg) => ({
            role: 'user',
            parts: [{ text: msg.content }]
        }));

        const modelName = 'gemini-3.6-flash';
        console.log(`Calling ${modelName}...`);
        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
                systemInstruction: baseSystemInstruction,
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

        console.log('SUCCESS! Output:');
        console.log(response.text);

    } catch (err) {
        console.error('Detailed Error:', err);
    }
}
test();
