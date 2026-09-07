import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { getFastConversationalReply } from '@/lib/conversationHelper';
import { embedText } from '@/lib/plotEmbedding';

// Enable Edge Runtime to minimize cold starts & latency
export const runtime = 'edge';

// Active Gemini models list with fallback priority.
// These must be real, published model IDs — the previous 'gemini-3.6/3.7-flash'
// values do not exist, so every generation call failed and the assistant silently
// fell back to canned replies. gemini-2.5-flash is the primary (matches the
// "Gemini 2.5" advertised on the landing page); the -lite/-8b entries are cheaper
// fallbacks tried in order if the primary is unavailable or times out.
const SUPPORTED_GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash'
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

/**
 * Utility wrapper to enforce strict execution timeouts for DB queries and LLM generation
 */
function withTimeout(promise, ms, fallbackValue) {
  let timer;
  const timeoutPromise = new Promise((resolve) => {
    timer = setTimeout(() => {
      resolve(fallbackValue);
    }, ms);
  });

  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    timeoutPromise
  ]);
}

// Instantiate Edge-compatible Supabase Client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Fallback verified plot inventory containing top-rated listings in Islamabad/Rawalpindi
 * (Used if database table is empty or lookup times out)
 */
const FALLBACK_TOP_LISTINGS = [
  {
    id: 'PK-ISB-SHALIMAR-01',
    title: '10 Marla Residential Plot - Shalimar Town, Sector F-17, Islamabad',
    society: 'Shalimar Town',
    city: 'Islamabad',
    size: '10 Marla (30x60)',
    price: 'PKR 1.45 Crore',
    pricePkr: 14500000,
    category: 'Residential',
    floodRisk: 'Low Risk (Zone 1 - High Elevation)',
    noiseLevel: 'Quiet Residential',
    elevationProfile: '540m Above Sea Level (Gentle Slope)',
    proximityNotes: 'Near 80ft Main Boulevard, CDA Approved, 5 min to Motorway Interchange',
    sellerName: 'Tariq Mehmood',
    sellerPhone: '+92 300 5551234',
    sellerRole: 'Direct Owner',
    isVerified: true
  },
  {
    id: 'PK-ISB-B17-02',
    title: '7 Marla Corner Plot - Block C, B-17 Multi Gardens, Islamabad',
    society: 'B-17 Multi Gardens',
    city: 'Islamabad',
    size: '7 Marla (25x50)',
    price: 'PKR 98 Lakh',
    pricePkr: 9800000,
    category: 'Residential',
    floodRisk: 'Low Risk (Solid Ground)',
    noiseLevel: 'Moderate',
    elevationProfile: '525m Above Sea Level (Flat Terrain)',
    proximityNotes: 'Park Facing, MPCHS Verified, Near Commercial Market & Markaz',
    sellerName: 'Chaudhry Kamran',
    sellerPhone: '+92 321 4445678',
    sellerRole: 'Verified Agency Agent',
    isVerified: true
  },
  {
    id: 'PK-ISB-GULBERG-03',
    title: '1 Kanal Luxury Farmhouse Plot - Executive Block, Gulberg Greens, Islamabad',
    society: 'Gulberg Greens',
    city: 'Islamabad',
    size: '1 Kanal (50x90)',
    price: 'PKR 3.25 Crore',
    pricePkr: 32500000,
    category: 'Residential',
    floodRisk: 'Low Risk (High Gradient Drain)',
    noiseLevel: 'Very Quiet',
    elevationProfile: '510m Above Sea Level (High Plateau)',
    proximityNotes: 'Signal Free Corridor Access, Underground Utilities, CDA Approved',
    sellerName: 'Zainab Bibi',
    sellerPhone: '+92 333 7779890',
    sellerRole: 'Direct Owner',
    isVerified: true
  }
];

/**
 * Strict Intent-Routing Classifier:
 * Determines if user query requires live active inventory criteria lookups
 * or is conversational/general advisory that should completely bypass database calls.
 */
function classifyQueryIntent(messages) {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user' || !m.role);
  if (!lastUserMsg) return { needsInventory: false, reason: 'empty_query' };

  const query = (typeof lastUserMsg.content === 'string' ? lastUserMsg.content : '').trim().toLowerCase();

  // 1. Explicit Active Inventory Search & Open-Ended Recommendation Criteria
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
    /which\s+plot/i,
    /best\s+plot/i,
    /pick\s+(one|a)\s+plot/i,
    /recommend/i,
    /suggest/i,
    /top\s+(plots?|options|listings|verified)/i,
    /best\s+(investment|option|area)/i,
    /konsa\s+plot/i,
    /behtareen\s+plot/i,
    /good\s+plot/i,
    /where\s+should\s+i\s+(buy|invest)/i,
  ];

  // Specific size + location or price query (e.g. "5 marla in dha", "10 marla under 1 crore")
  const hasSpecificPlotFilters =
    /\b\d+\s*(marla|kanal)\b/i.test(query) ||
    /(dha|bahria|gulberg|f-6|f-7|f-8|f-10|f-11|g-11|g-13|b-17|shalimar|islamabad|rawalpindi)/i.test(query) ||
    /(under|budget|crore|lakh|for sale|best|pick|recommend|suggest)/i.test(query);

  if (explicitInventoryPatterns.some((p) => p.test(query)) || hasSpecificPlotFilters) {
    return { needsInventory: true, reason: 'inventory_search' };
  }

  // Any general query mentioning plot, property, land, buy, or invest should also trigger inventory lookups
  if (/(plot|property|land|society|invest|buy|price|option|sector|city)/i.test(query)) {
    return { needsInventory: true, reason: 'open_ended_plot_query' };
  }

  return { needsInventory: false, reason: 'general_advisory' };
}

/**
 * Vector similarity search using Supabase pgvector RPC `match_plots`
 */
async function searchVectorPlots(ai, db, queryText) {
  try {
    const embedding = await embedText(ai, queryText);
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
    if (!db) return FALLBACK_TOP_LISTINGS;

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

    if (error || !data || data.length === 0) {
      return FALLBACK_TOP_LISTINGS;
    }

    const inventory = data.map((row) => {
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

    return inventory.length > 0 ? inventory : FALLBACK_TOP_LISTINGS;
  } catch (e) {
    console.warn('[api/chat] Error fetching inventory fallback:', e?.message || e);
    return FALLBACK_TOP_LISTINGS;
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

    const { messages, language, isGuide, mode } = body || {};

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required', reply: 'Please provide messages.', recommendedPlots: [] }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (messages.length > 30 || messages.some((message) => {
      const content = typeof message?.content === 'string' ? message.content : '';
      return content.length > 4000;
    })) {
      return new Response(
        JSON.stringify({ error: 'Messages are too large.', reply: 'Please shorten your message history and try again.', recommendedPlots: [] }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[api/chat] GEMINI_API_KEY is missing.');
      // 503: a server misconfiguration, not a client error. `reply` is retained so
      // the UI still shows a friendly message, but the status now reflects failure
      // (both /recommend's res.ok check and uptime monitoring can see it).
      return new Response(
        JSON.stringify({
          reply: 'The AI service is temporarily unavailable. Please try again shortly.',
          recommendedPlots: []
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
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
    // Only query Supabase when explicit active inventory search is requested AND we are NOT in onboarding guide mode.
    // General advisory, conceptual questions, greetings, and onboarding guide requests bypass the database completely!
    if (intent.needsInventory && !isGuide && mode !== 'guide') {
      try {
        const db = getSupabaseClient();
        if (db) {
          // 10-second maximum timeout for vector similarity search
          const vectorMatches = await withTimeout(
            searchVectorPlots(ai, db, String(lastUserQuery)),
            10000,
            null
          ).catch(() => null);

          if (vectorMatches && vectorMatches.length > 0) {
            liveInventory = vectorMatches;
          } else {
            // 10-second maximum timeout for fallback active inventory search
            liveInventory = await withTimeout(
              fetchOptimizedInventory(db),
              10000,
              []
            ).catch(() => []);
          }
        }
      } catch (dbErr) {
        console.warn('[api/chat] Database lookup bypassed due to error/timeout:', dbErr?.message || dbErr);
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

    // Construct tailored system instruction based on classified intent & mode
    let baseSystemInstruction = '';

    if (isGuide || mode === 'guide') {
      // Live AI Onboarding Assistant Mode
      baseSystemInstruction = `You are the NAQSHAI Live AI Onboarding Assistant — a platform navigation guide.

STRICT NAVIGATION & FEATURE ROUTING RULES:
1. LISTING OR SELLING PLOTS: If the user asks about listing, selling, posting, or submitting a plot, direct them specifically to use the 'List Your Plot' page (/sell) to submit plot dimensions, society details, and asking price.
2. BUYING OR SEARCHING PLOTS: You ONLY provide platform navigation and feature guidance. You DO NOT perform property searches or provide plot listings/prices directly. If a user asks about finding plots, buying land, or searching inventory, explain that you are the onboarding guide and instruct them to check the 'Explore 3D Map' page (/explore) or consult the 'AI Advisor' (/recommend) for plot recommendations.
3. GENERAL PLATFORM QUESTIONS: Direct users to the relevant page (3D Map, AI Advisor, or List Your Plot).

STRICT CONCISENESS & STYLE DIRECTIVES:
1. NO CORPORATE INTRODUCTIONS: Jump DIRECTLY to the navigation guidance.
2. PUNCHY & FRIENDLY: Keep responses concise (1-3 sentences max).
3. NEVER return plot listings or inventory objects. Return 'recommendedPlots' strictly as an empty array [].

OUTPUT SPECIFICATION:
Return a single valid JSON object containing:
- 'reply': concise, friendly onboarding guidance directing the user to the correct feature (/sell for listing/selling plots, /explore and /recommend for exploring/buying plots).
- 'recommendedPlots': []`;
    } else if (!intent.needsInventory) {
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
2. PROACTIVE RECOMMENDATION FOR OPEN-ENDED QUERIES:
   When the user asks open-ended or general questions like "which plot is best in islamabad", "pick one plot for me", "suggest a plot", or "where should I invest", DO NOT hesitate, ask for clarification, or refuse. Immediately select 1 to 3 top verified plot listings from LIVE DATABASE INVENTORY below (such as Shalimar Town, B-17 Multigardens, or Gulberg Greens) and present them directly as recommendations.
3. CONCISE & PUNCHY: Keep narrative direct, factual, and compact (2-3 sentences max). Highlight location, price, and flood risk metrics for the recommended plots.
4. LIVE INVENTORY ONLY: Select plot objects directly from LIVE DATABASE INVENTORY below and ALWAYS include them in the 'recommendedPlots' array.
5. NEVER fabricate fictitious plots or prices. Never mention database or vector plumbing.

LIVE DATABASE INVENTORY:
${JSON.stringify(trimmedInventory, null, 2)}

OUTPUT SPECIFICATION:
Return a single valid JSON object with:
- 'reply': direct, punchy recommendation narrative picking the best matching plot(s) from inventory without corporate intro fluff.
- 'recommendedPlots': array containing the matching plot objects selected from LIVE DATABASE INVENTORY.`;
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

    // Attempt generation with active Gemini models (resilient fallback loop with 8s per-model timeout)
    let generatedText = null;
    let lastError = null;

    for (const modelName of SUPPORTED_GEMINI_MODELS) {
      try {
        const generatePromise = ai.models.generateContent({
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

        // Enforce 15-second limit per model call to allow fast fallback across supported models
        const response = await withTimeout(generatePromise, 15000, null);

        if (response && response.text) {
          generatedText = response.text;
          break;
        } else {
          console.warn(`[api/chat] Gemini model '${modelName}' timed out or returned empty response.`);
        }
      } catch (modelErr) {
        lastError = modelErr;
        console.warn(`[api/chat] Gemini model '${modelName}' notice, attempting fallback:`, modelErr?.message || modelErr);
      }
    }

    if (!generatedText) {
      console.error('[api/chat] All Gemini model fallbacks failed or timed out.', lastError?.message || lastError);
      if (liveInventory.length > 0) {
        let cleanReply = 'Here are top verified plot listings matching your criteria from our active inventory.';
        if (language === 'UR') {
          cleanReply = 'یہاں آپ کے معیار کے مطابق ہماری فعال انوینٹری سے بہترین تصدیق شدہ پلاٹ کی فہرستیں درج ہیں۔';
        } else if (language === 'RO') {
          cleanReply = 'Aap ki criteria ke mutabiq hamari active inventory se top verified plot listings ye hain:';
        }

        return new Response(
          JSON.stringify({
            reply: cleanReply,
            recommendedPlots: liveInventory.slice(0, 3),
            isFallback: true,
            success: true
          }),
          { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
      }

      if (isGuide || mode === 'guide') {
        return new Response(
          JSON.stringify({
            reply: 'NAQSHAI features 3D terrain elevation analysis, verified plot listings, and AI real estate intelligence across Islamabad and Rawalpindi. You can explore interactive 3D maps or launch the AI Plot Advisor for detailed plot recommendations.',
            recommendedPlots: [],
            isFallback: true,
            actions: [
              { label: '3D Map Explorer', href: '/explore' },
              { label: 'AI Advisor', href: '/recommend' }
            ]
          }),
          { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
      }

      let helpfulAdvisoryReply = 'I can assist you with real estate intelligence across Islamabad & Rawalpindi! Try asking about specific CDA sectors (F-6, G-11), Bahria Town, DHA, or monsoon flood risk zones.';
      if (language === 'UR') {
        helpfulAdvisoryReply = 'میں اسلام آباد اور راولپنڈی میں رئیل اسٹیٹ انٹیلی جنس میں آپ کی مدد کر سکتا ہوں! مخصوص CDA سیکٹرز (F-6, G-11)، بحریہ ٹاؤن، DHA، یا سیلاب کے خطرے والے علاقوں کے بارے میں پوچھیں۔';
      } else if (language === 'RO') {
        helpfulAdvisoryReply = 'Main Islamabad aur Rawalpindi mein real estate intelligence mein aap ki madad kar sakta hoon! Specific CDA sectors (F-6, G-11), Bahria Town, DHA, ya flood risk zones ke baarey mein poochain.';
      }

      return new Response(
        JSON.stringify({
          reply: helpfulAdvisoryReply,
          recommendedPlots: [],
          isFallback: true
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
    // 500 with a friendly `reply` retained: the UI still shows a message, but the
    // status honestly reports the failure so it isn't invisible to monitoring.
    return new Response(
      JSON.stringify({
        reply: 'Maazrat, request process karne me masla aya. Baraye mehrbani dobara koshish karein.',
        recommendedPlots: [],
        error: err?.message || 'Internal Server Error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
