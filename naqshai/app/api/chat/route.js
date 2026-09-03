import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// Enable Edge Runtime to minimize cold starts & latency
export const runtime = 'edge';

// Active Gemini models list with fallback priority
const SUPPORTED_GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.7-flash'];

function formatPkr(num) {
  const val = Number(num);
  if (!val || Number.isNaN(val)) return 'Price on request';
  if (val >= 10000000) return `PKR ${(val / 10000000).toFixed(2)} Crore`;
  if (val >= 100000) return `PKR ${(val / 100000).toFixed(2)} Lakh`;
  return `PKR ${val.toLocaleString('en-PK')}`;
}

function extractSociety(title) {
  if (typeof title !== 'string') return '';
  const afterDash = title.split(' - ')[1];
  if (!afterDash) return '';
  return (afterDash.split(',')[0] || '').trim();
}

// Instantiate Edge-compatible Supabase Client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Fetch essential live inventory context
async function fetchOptimizedInventory(db) {
  try {
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
        sellers (
          id,
          full_name,
          phone_number,
          seller_role,
          is_identity_verified
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('[api/chat] Optimized Supabase Query Error:', error.message || error);
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
  } catch (e) {
    console.error('[api/chat] Error fetching inventory:', e);
    return [];
  }
}

export async function POST(req) {
  try {
    const { messages, language } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[api/chat] GEMINI_API_KEY is missing.');
      return new Response(
        JSON.stringify({
          reply: 'Gemini API Key is not configured in environment variables.',
          recommendedPlots: []
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = getSupabaseClient();

    // Parallelize session check and inventory fetch
    const [sessionResult, liveInventory] = await Promise.all([
      db.auth.getSession().catch(() => ({ data: { session: null } })),
      fetchOptimizedInventory(db)
    ]);

    const trimmedInventory = liveInventory.map((p) => ({
      id: p.id,
      title: p.title,
      society: p.society,
      city: p.city,
      size: p.size,
      price: p.price,
      category: p.category,
      floodRisk: p.floodRisk,
      noiseLevel: p.noiseLevel,
      elevation: p.elevationProfile,
      notes: p.proximityNotes,
      sellerName: p.sellerName,
      sellerPhone: p.sellerPhone,
      verified: p.isVerified
    }));

    const ai = new GoogleGenAI({ apiKey });

    const LANG_MAP = {
      EN: 'English',
      UR: 'Nastaliq Urdu script (اردو)',
      RO: 'Roman Urdu'
    };

    const baseSystemInstruction = `You are NAQSHAI AI - an expert land recommendation chatbot for real estate in Pakistan.
You provide intelligent plot recommendations powered strictly by live database records from Supabase.

CRITICAL DATA DIRECTIVE:
1. ONLY recommend plots present in the LIVE SUPABASE INVENTORY provided below.
2. NEVER hallucinate, invent, or fall back to any fictional plots.
3. If user criteria cannot be matched:
   - Set 'recommendedPlots' to an empty array: []
   - In your 'reply', politely inform the user that no registered plots match their exact criteria.

OPTIMIZED LIVE DATABASE INVENTORY (Top 5 Matches):
${JSON.stringify(trimmedInventory, null, 2)}

INVENTORY SUMMARY:
- Active properties in context: ${trimmedInventory.length}
- Cities available: ${[...new Set(trimmedInventory.map(p => p.city).filter(Boolean))].join(', ') || 'None'}

CORE ADVISORY GUIDELINES:
1. Directly address user real estate queries without unnecessary greetings.
2. Provide flood risk, noise level, and elevation analysis for matching plots.
3. Language fidelity:
   - EN: English
   - RO: Roman Urdu
   - UR: Nastaliq Urdu (اردو)
4. OUTPUT FORMAT: Output a single valid JSON object with 'reply' and 'recommendedPlots' array.`;

    let finalSystemInstruction = baseSystemInstruction;
    if (language && language !== 'Auto' && LANG_MAP[language]) {
      finalSystemInstruction += `\n\nLANGUAGE OVERRIDE: Write the 'reply' field ENTIRELY in ${LANG_MAP[language]}.`;
    }

    const contents = messages.map((msg) => {
      const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
      const textContent = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
      return {
        role,
        parts: [{ text: textContent }],
      };
    });

    // Attempt generation with active Gemini models (fallback loop)
    let responseStream = null;
    let lastError = null;

    for (const modelName of SUPPORTED_GEMINI_MODELS) {
      try {
        responseStream = await ai.models.generateContentStream({
          model: modelName,
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

        if (responseStream) {
          break; // Successfully initialized stream with active model
        }
      } catch (modelErr) {
        lastError = modelErr;
        console.warn(`[api/chat] Gemini model '${modelName}' call notice:`, modelErr.message || modelErr);
      }
    }

    if (!responseStream) {
      console.error('[api/chat] All Gemini model fallbacks failed. Last error:', lastError);
      return new Response(
        JSON.stringify({
          reply: 'Maazrat, AI model se rabta nahi ho saka. Meharbani karke dobara koshish karein.',
          recommendedPlots: [],
          error: lastError?.message || 'Model initialization failed'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error('[api/chat] Streaming runtime error:', err);
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-transform',
      },
    });

  } catch (err) {
    console.error('[api/chat] Edge route unhandled exception:', err);
    return new Response(
      JSON.stringify({
        reply: 'Maazrat, request process karne me takneeki masla aya. Meharbani karke dobara koshish karein.',
        recommendedPlots: [],
        error: err.message || 'Internal Server Error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
