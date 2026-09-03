import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { getFastConversationalReply } from '@/lib/conversationHelper';

// Enable Edge Runtime to minimize cold starts & latency
export const runtime = 'edge';

// Active Gemini models list with fallback priority
const SUPPORTED_GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash'
];

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
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Strict Intent-Routing Classifier:
 * Determines if user query requires live active inventory criteria lookups
 * or is conversational/general advisory that should completely bypass database calls.
 */
function classifyQueryIntent(messages) {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user' || !m.role);
  if (!lastUserMsg) return { needsInventory: false, reason: 'empty_query' };

  const query = (typeof lastUserMsg.content === 'string' ? lastUserMsg.content : '').trim().toLowerCase();

  // 1. Explicit Active Inventory Search Criteria
  // Only trigger database lookups when user is explicitly requesting listings/plots to buy or view
  const explicitInventoryPatterns = [
    /show\s+me\s+plots?/i,
    /find\s+(me\s+)?(plots?|properties)/i,
    /available\s+(plots?|options|inventory|listings)/i,
    /plots?\s+for\s+sale/i,
    /plots?\s+(under|below|budget|within|between)\s+/i,
    /plots?\s+in\s+[a-z0-9]/i,
    /looking\s+(for|to\s+buy)\s+(a\s+)?plot/i,
    /want\s+to\s+buy\s+(a\s+)?plot/i,
    /plot\s+chahiye/i,
    /plots?\s+dikhao/i,
    /plots?\s+batao/i,
    /plots?\s+hai\s+kya/i,
  ];

  // Specific size + location or price query (e.g. "5 marla in dha", "10 marla under 1 crore")
  const hasSpecificPlotFilters =
    /\b\d+\s*(marla|kanal)\b/i.test(query) &&
    (/(dha|bahria|gulberg|f-6|f-7|f-8|f-10|f-11|g-11|g-13|b-17|islamabad|rawalpindi)/i.test(query) ||
      /(under|budget|crore|lakh|for sale)/i.test(query));

  if (explicitInventoryPatterns.some((p) => p.test(query)) || hasSpecificPlotFilters) {
    return { needsInventory: true, reason: 'inventory_search' };
  }

  // All greetings, general advisory ("where should I invest?"), conceptual queries ("what is a Marla?"),
  // and safety queries ("is Bahria Town safe?") strictly bypass the database lookup.
  return { needsInventory: false, reason: 'general_advisory' };
}

/**
 * Vector similarity search using Supabase pgvector RPC `match_plots`
 */
async function searchVectorPlots(ai, db, queryText) {
  try {
    const embedRes = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: queryText,
    });
    const embedding = embedRes?.embedding?.values;
    if (embedding && Array.isArray(embedding)) {
      const { data, error } = await db.rpc('match_plots', {
        query_embedding: embedding,
        match_threshold: 0.15,
        match_count: 5
      });
      if (!error && data && data.length > 0) {
        return data.map((row) => ({
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
          isVerified: !!row.is_verified
        }));
      }
    }
  } catch (err) {
    console.warn('[api/chat] Vector similarity search notice:', err?.message || err);
  }
  return null;
}

/**
 * Fetch top active inventory directly from Supabase plots table
 */
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
      console.warn('[api/chat] Supabase plots fetch notice:', error.message || error);
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
    console.warn('[api/chat] Error fetching inventory fallback:', e?.message || e);
    return [];
  }
}

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (_) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON request body', reply: 'Invalid request format.', recommendedPlots: [] }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages, language } = body || {};

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required', reply: 'Please provide messages.', recommendedPlots: [] }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[api/chat] GEMINI_API_KEY is missing.');
      return new Response(
        JSON.stringify({
          reply: 'Gemini API Key is not configured. Please check environment variables.',
          recommendedPlots: []
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const lastUserQuery = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

    // 1. Zero-Delay Fast Path for Casual Queries:
    // Purely conversational inputs, greetings, or pleasantries bypass all vector search, DB queries, and model latency
    const fastReply = getFastConversationalReply(String(lastUserQuery), language);
    if (fastReply) {
      return new Response(
        JSON.stringify({
          reply: fastReply,
          recommendedPlots: []
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }

    // 2. Strict Intent Classification
    const intent = classifyQueryIntent(messages);

    let liveInventory = [];

    // 3. Strict Intent Routing:
    // Only query Supabase when explicit active inventory search is requested.
    // General advisory, conceptual questions, and greetings bypass the database completely!
    if (intent.needsInventory) {
      try {
        const db = getSupabaseClient();
        if (db) {
          const vectorMatches = await searchVectorPlots(ai, db, String(lastUserQuery)).catch(() => null);
          if (vectorMatches && vectorMatches.length > 0) {
            liveInventory = vectorMatches;
          } else {
            liveInventory = await fetchOptimizedInventory(db).catch(() => []);
          }
        }
      } catch (dbErr) {
        console.warn('[api/chat] Database lookup bypassed due to error:', dbErr?.message || dbErr);
        liveInventory = [];
      }
    }

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

    const LANG_MAP = {
      EN: 'English',
      UR: 'Nastaliq Urdu script (اردو)',
      RO: 'Roman Urdu'
    };

    // Construct tailored system instruction based on classified intent
    let baseSystemInstruction = '';

    if (!intent.needsInventory) {
      // General Real Estate Advisory & Knowledge Base Mode
      baseSystemInstruction = `You are NAQSHAI AI — a real estate advisory consultant and land intelligence specialist for Islamabad and Rawalpindi, Pakistan.

STRICT CONCISENESS & STYLE DIRECTIVES:
1. NO CORPORATE INTRODUCTIONS: NEVER start responses with boilerplate intros like "As NAQSHAI AI, your senior real estate advisory consultant...", "Welcome to NAQSHAI...", or "Hello! I am pleased to assist...". Jump DIRECTLY to the answer.
2. PUNCHY & CONCISE: Answer in 2-4 sentences max without filler or corporate pleasantries. For casual questions, reply in strictly 1 short sentence.
3. DOMAIN INTELLIGENCE: Provide direct, objective facts on CDA sectors, RDA developments, Bahria Town, DHA, Gulberg, New Islamabad Airport corridor, monsoon flood risks (nullah proximity, Lai runoff), and approval verification (CDA/RDA).
4. NO BACKEND MENTIONS: Never mention internal databases, vector tables, or software steps.
5. Return 'recommendedPlots' as an empty array [].

OUTPUT SPECIFICATION:
Return a single valid JSON object containing:
- 'reply': punchy, direct answer with zero corporate fluff or repetitive self-introductions.
- 'recommendedPlots': []`;
    } else {
      // Active Inventory Recommendation Mode
      baseSystemInstruction = `You are NAQSHAI AI — a land recommendation and property intelligence specialist for real estate in Pakistan.

STRICT CONCISENESS & STYLE DIRECTIVES:
1. NO CORPORATE INTRODUCTIONS: NEVER start responses with boilerplate intros like "As NAQSHAI AI, your senior advisor...", "Welcome to NAQSHAI...", or "I am pleased to present...". Jump directly to the property findings.
2. CONCISE & PUNCHY: Keep narrative direct, factual, and compact (2-3 sentences max). Focus strictly on location, price, and risk metrics.
3. LIVE INVENTORY ONLY: Recommend plots strictly matching criteria from LIVE DATABASE INVENTORY below.
4. If no exact matches exist, state what is available or suggest alternative sectors in 1-2 direct sentences and set 'recommendedPlots' to [].
5. NEVER fabricate fictitious plots or prices. Never mention database or vector plumbing.

LIVE DATABASE INVENTORY:
${JSON.stringify(trimmedInventory, null, 2)}

OUTPUT SPECIFICATION:
Return a single valid JSON object with:
- 'reply': direct, punchy recommendation narrative without corporate intro fluff.
- 'recommendedPlots': array of matching plot objects from the inventory.`;
    }

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

    // Attempt generation with active Gemini models (resilient fallback loop)
    let generatedText = null;
    let lastError = null;

    for (const modelName of SUPPORTED_GEMINI_MODELS) {
      try {
        const response = await ai.models.generateContent({
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

        if (response && response.text) {
          generatedText = response.text;
          break;
        }
      } catch (modelErr) {
        lastError = modelErr;
        console.warn(`[api/chat] Gemini model '${modelName}' notice, attempting fallback:`, modelErr?.message || modelErr);
      }
    }

    if (!generatedText) {
      console.error('[api/chat] All Gemini model fallbacks failed. Last error:', lastError?.message || lastError);
      return new Response(
        JSON.stringify({
          reply: 'Hello! I am currently experiencing high demand. Please try asking your real estate question again in a few moments.',
          recommendedPlots: [],
          success: false
        }),
        { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // Stream the generated JSON in progressive chunks so the client's reader functions smoothly
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const chunkSize = 64;
        for (let i = 0; i < generatedText.length; i += chunkSize) {
          controller.enqueue(encoder.encode(generatedText.slice(i, i + chunkSize)));
        }
        controller.close();
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
    console.error('[api/chat] Handled error in chat API:', err?.message || err);
    return new Response(
      JSON.stringify({
        reply: 'Maazrat, request process karne me masla aya. Baraye mehrbani dobara koshish karein.',
        recommendedPlots: [],
        error: err?.message || 'Internal Server Error'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
