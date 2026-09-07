import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { getFastConversationalReply } from '@/lib/conversationHelper';
import { embedText } from '@/lib/plotEmbedding';
import { computeEnvironmentalMetrics } from '@/lib/environmentalMetrics';

// Enable Edge Runtime to minimize cold starts & latency
export const runtime = 'edge';

// Active Gemini models list with fallback priority.
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
 * Parse structured search parameters from natural language user queries
 * (Supports English, Urdu script, and Roman Urdu)
 */
function parseUserConstraints(queryText) {
  if (typeof queryText !== 'string') return {};
  const text = queryText.toLowerCase();

  const constraints = {};

  // 0. Explicit Plot ID Extraction (e.g. "Plot-98A", "plot 98a", "plot-65f", "plot 57")
  const plotIdMatch = queryText.match(/\bplot[s]?[\s-_]*#?\s*(\d+[a-z]?|[a-z]\d+)\b/i);
  if (plotIdMatch) {
    const rawCode = plotIdMatch[1].toUpperCase();
    constraints.targetPlotId = `Plot-${rawCode}`;
    constraints.rawPlotCode = rawCode;
  }

  // 1. Plot Size Extraction (Marla / Kanal)
  const marlaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:marla|marlas|مرلہ|marle)/i);
  const kanalMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kanal|kanals|کنال)/i);

  if (marlaMatch) {
    constraints.sizeNumMarla = parseFloat(marlaMatch[1]);
    constraints.sizeUnit = 'marla';
    constraints.rawSizeStr = `${marlaMatch[1]} Marla`;
  } else if (kanalMatch) {
    constraints.sizeNumMarla = parseFloat(kanalMatch[1]) * 20; // 1 Kanal = 20 Marla
    constraints.sizeUnit = 'kanal';
    constraints.rawSizeStr = `${kanalMatch[1]} Kanal`;
  }

  // 2. Budget / Price Range Extraction
  const croreMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:crore|crores|cr|کروڑ)/i);
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|لاکھ)/i);
  const millionMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:million|m)\b/i);

  const isMaxBudget = /(under|below|less than|within|max|maximum|upto|up to|ke andar|se kam|کی اندر|سے کم|budget|chahiye|around)/i.test(text);
  const isMinBudget = /(above|more than|minimum|min|greater than|se ziada|سے زیادہ)/i.test(text);

  let extractedPkr = null;
  if (croreMatch) {
    extractedPkr = parseFloat(croreMatch[1]) * 10000000;
  } else if (lakhMatch) {
    extractedPkr = parseFloat(lakhMatch[1]) * 100000;
  } else if (millionMatch) {
    extractedPkr = parseFloat(millionMatch[1]) * 1000000;
  }

  if (extractedPkr) {
    if (isMinBudget && !isMaxBudget) {
      constraints.minPricePkr = extractedPkr;
    } else {
      constraints.maxPricePkr = extractedPkr;
    }
  }

  // 3. Location / City / Sector / Society Extraction
  const cities = ['islamabad', 'rawalpindi'];
  const matchedCity = cities.find((c) => text.includes(c));
  if (matchedCity) {
    constraints.city = matchedCity;
  }

  const societiesSectors = [
    'dha', 'bahria', 'gulberg', 'b-17', 'b17', 'f-17', 'f17', 'f-6', 'f-7', 'f-8', 'f-10', 'f-11',
    'g-11', 'g-13', 'g-14', 'i-8', 'i-10', 'shalimar', 'park view', 'topcity', 'mumtaz city',
    'capital smart city', 'multi gardens'
  ];

  const matchedSociety = societiesSectors.find((s) => text.includes(s));
  if (matchedSociety) {
    constraints.societyOrSector = matchedSociety;
  }

  // 4. Environmental & Disaster Criteria (Flood Risk, Noise Level, Category, Verification)
  if (/(low flood|flood risk|safe from flood|flood safe|no flood|low hazard|کم سیلاب|flood free)/i.test(text)) {
    constraints.lowFloodRisk = true;
  }

  if (/(quiet|quiet zone|low noise|peaceful|calm|away from highway|kam shor|پُر سکون|کم شور|45\s*db|quiet plot)/i.test(text)) {
    constraints.quietNoise = true;
  }

  if (/(commercial|کمراشل)/i.test(text)) {
    constraints.category = 'Commercial';
  } else if (/(residential|ریائشی)/i.test(text)) {
    constraints.category = 'Residential';
  } else if (/(farmhouse|فارم ہاؤس)/i.test(text)) {
    constraints.category = 'Farmhouse';
  }

  if (/(verified|تصدیق شدہ)/i.test(text)) {
    constraints.verifiedOnly = true;
  }

  return constraints;
}

function extractMarlaFromSizeStr(sizeStr) {
  if (!sizeStr || typeof sizeStr !== 'string') return null;
  const lower = sizeStr.toLowerCase();
  const marlaMatch = lower.match(/(\d+(?:\.\d+)?)\s*marla/);
  if (marlaMatch) return parseFloat(marlaMatch[1]);

  const kanalMatch = lower.match(/(\d+(?:\.\d+)?)\s*kanal/);
  if (kanalMatch) return parseFloat(kanalMatch[1]) * 20;

  return null;
}

function plotMatchesConstraints(plot, constraints) {
  if (!constraints || Object.keys(constraints).length === 0) {
    return true;
  }

  // 0. Target Plot ID Filter (Exact match for plot inquiries like "Plot-98A")
  if (constraints.targetPlotId) {
    const plotIdNorm = (plot.id || '').toLowerCase().replace(/[\s-_]/g, '');
    const targetNorm = constraints.targetPlotId.toLowerCase().replace(/[\s-_]/g, '');
    const rawCodeNorm = (constraints.rawPlotCode || '').toLowerCase();

    const isMatch =
      plotIdNorm === targetNorm ||
      plotIdNorm.endsWith(rawCodeNorm) ||
      plotIdNorm.includes(targetNorm);

    if (!isMatch) {
      return false;
    }
  }

  // 1. Max Price Filter
  if (constraints.maxPricePkr !== undefined) {
    const plotPrice = Number(plot.pricePkr || plot.price_pkr || 0);
    if (plotPrice > 0 && plotPrice > constraints.maxPricePkr) {
      return false;
    }
  }

  // 2. Min Price Filter
  if (constraints.minPricePkr !== undefined) {
    const plotPrice = Number(plot.pricePkr || plot.price_pkr || 0);
    if (plotPrice > 0 && plotPrice < constraints.minPricePkr) {
      return false;
    }
  }

  // 3. Size Filter
  if (constraints.sizeNumMarla !== undefined) {
    const plotMarla = extractMarlaFromSizeStr(plot.size || plot.size_dimensions || plot.title);
    if (plotMarla !== null) {
      if (Math.abs(plotMarla - constraints.sizeNumMarla) > 0.5) {
        return false;
      }
    } else {
      const rawLower = (plot.size || plot.size_dimensions || '').toLowerCase();
      if (constraints.rawSizeStr && !rawLower.includes(constraints.rawSizeStr.toLowerCase())) {
        return false;
      }
    }
  }

  // 4. City Filter
  if (constraints.city) {
    const plotCity = (plot.city || '').toLowerCase();
    const plotTitle = (plot.title || '').toLowerCase();
    if (!plotCity.includes(constraints.city) && !plotTitle.includes(constraints.city)) {
      return false;
    }
  }

  // 5. Society / Sector Filter
  if (constraints.societyOrSector) {
    const plotSociety = (plot.society || '').toLowerCase();
    const plotTitle = (plot.title || '').toLowerCase();
    const plotNotes = (plot.proximityNotes || plot.proximity_notes || '').toLowerCase();
    const target = constraints.societyOrSector.toLowerCase().replace(/[-_\s]/g, '');

    const normSociety = plotSociety.replace(/[-_\s]/g, '');
    const normTitle = plotTitle.replace(/[-_\s]/g, '');
    const normNotes = plotNotes.replace(/[-_\s]/g, '');

    if (!normSociety.includes(target) && !normTitle.includes(target) && !normNotes.includes(target)) {
      return false;
    }
  }

  // 6. Low Flood Risk Filter
  if (constraints.lowFloodRisk) {
    const flood = (plot.floodRisk || plot.flood_risk || '').toLowerCase();
    if (flood.includes('high risk') || flood.includes('high flood') || (!flood.includes('low') && !flood.includes('safe') && !flood.includes('minimal'))) {
      return false;
    }
  }

  // 7. Quiet Noise Level Filter
  if (constraints.quietNoise) {
    const noise = (plot.noiseLevel || plot.noise_level || '').toLowerCase();
    if (!noise.includes('quiet') && !noise.includes('low') && !noise.includes('45 db')) {
      return false;
    }
  }

  // 8. Category Filter
  if (constraints.category) {
    const cat = (plot.category || '').toLowerCase();
    if (!cat.includes(constraints.category.toLowerCase())) {
      return false;
    }
  }

  // 9. Verified Only Filter
  if (constraints.verifiedOnly) {
    const isVerified = plot.isVerified || plot.is_verified;
    if (!isVerified) {
      return false;
    }
  }

  return true;
}

function formatConstraintsSummary(constraints) {
  const parts = [];
  if (constraints.targetPlotId) parts.push(`Plot ID: ${constraints.targetPlotId}`);
  if (constraints.rawSizeStr) parts.push(`Size: ${constraints.rawSizeStr}`);
  if (constraints.maxPricePkr) parts.push(`Max Budget: ${formatPkr(constraints.maxPricePkr)}`);
  if (constraints.minPricePkr) parts.push(`Min Budget: ${formatPkr(constraints.minPricePkr)}`);
  if (constraints.city) parts.push(`City: ${constraints.city.charAt(0).toUpperCase() + constraints.city.slice(1)}`);
  if (constraints.societyOrSector) parts.push(`Society/Sector: ${constraints.societyOrSector.toUpperCase()}`);
  if (constraints.lowFloodRisk) parts.push('Low Flood Risk');
  if (constraints.quietNoise) parts.push('Quiet Noise Level (~45 dB)');
  if (constraints.category) parts.push(`Category: ${constraints.category}`);
  if (constraints.verifiedOnly) parts.push('Verified Listings');
  return parts.length > 0 ? parts.join(', ') : 'specified criteria';
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

  const hasSpecificPlotFilters =
    /\b\d+\s*(marla|kanal)\b/i.test(query) ||
    /(dha|bahria|gulberg|f-6|f-7|f-8|f-10|f-11|g-11|g-13|b-17|shalimar|islamabad|rawalpindi)/i.test(query) ||
    /(under|budget|crore|lakh|for sale|best|pick|recommend|suggest)/i.test(query);

  if (/\bplot[s]?[\s-_]*#?\s*(\d+[a-z]?|[a-z]\d+)\b/i.test(query)) {
    return { needsInventory: true, reason: 'specific_plot_id_inquiry' };
  }

  if (explicitInventoryPatterns.some((p) => p.test(query)) || hasSpecificPlotFilters) {
    return { needsInventory: true, reason: 'inventory_search' };
  }

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
        match_count: 10
      });
      if (!error && data && data.length > 0) {
        return data.map((row) => {
          const env = computeEnvironmentalMetrics({
            id: row.id,
            title: row.title,
            society: extractSociety(row.title),
            city: row.city,
            category: row.category,
            size_dimensions: row.size_dimensions,
            proximityNotes: row.proximity_notes
          });
          return {
            id: row.id,
            title: row.title || row.id,
            society: extractSociety(row.title),
            city: row.city || '',
            size: row.size_dimensions || '10 Marla',
            price: formatPkr(row.price_pkr),
            pricePkr: Number(row.price_pkr) || 0,
            category: row.category || 'Residential',
            floodRisk: (!row.flood_risk || row.flood_risk.includes('Pending') || row.flood_risk === 'Low Hazard') ? env.floodRisk : row.flood_risk,
            noiseLevel: (!row.noise_level || row.noise_level.includes('Pending') || row.noise_level === 'Low (Quiet Zone)') ? env.noiseLevel : row.noise_level,
            elevationProfile: (!row.elevation_profile || row.elevation_profile.includes('Pending')) ? env.elevationProfile : row.elevation_profile,
            proximityNotes: row.proximity_notes || '',
            isVerified: !!row.is_verified
          };
        });
      }
    }
  } catch (err) {
    console.warn('[api/chat] Vector similarity search notice:', err?.message || err);
  }
  return null;
}

/**
 * Fetch active database inventory directly from Supabase plots table
 */
async function fetchActiveDatabaseInventory(db, targetPlotCode) {
  try {
    if (!db) return [];

    let query = db.from('plots').select(`
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
      `);

    if (targetPlotCode && typeof targetPlotCode === 'string') {
      const cleanCode = targetPlotCode.replace(/^plot[\s-_]*/i, '').trim();
      query = query.or(`id.ilike.%${cleanCode}%,id.ilike.%${targetPlotCode}%`);
    }

    query = query.order('created_at', { ascending: false }).limit(100);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((row) => {
      const seller = row.sellers || null;
      const env = computeEnvironmentalMetrics({
        id: row.id,
        title: row.title,
        society: extractSociety(row.title),
        city: row.city,
        category: row.category,
        size_dimensions: row.size_dimensions,
        proximityNotes: row.proximity_notes
      });

      const isPending = (val, defaultVal) => {
        if (!val || typeof val !== 'string') return true;
        const lower = val.trim().toLowerCase();
        return lower === '' || lower.includes('pending') || lower === 'n/a' || lower === defaultVal.toLowerCase();
      };

      return {
        id: row.id,
        title: row.title || row.id,
        society: extractSociety(row.title),
        city: row.city || '',
        size: row.size_dimensions || '10 Marla',
        price: formatPkr(row.price_pkr),
        pricePkr: Number(row.price_pkr) || 0,
        category: row.category || 'Residential',
        floodRisk: isPending(row.flood_risk, 'low hazard') ? env.floodRisk : row.flood_risk,
        noiseLevel: isPending(row.noise_level, 'low (quiet zone)') ? env.noiseLevel : row.noise_level,
        elevationProfile: isPending(row.elevation_profile, 'pending survey') ? env.elevationProfile : row.elevation_profile,
        proximityNotes: row.proximity_notes || '',
        sellerName: seller?.full_name || '',
        sellerPhone: seller?.phone_number || '',
        sellerRole: seller?.seller_role || 'Direct Owner',
        isVerified: !!row.is_verified || !!seller?.is_identity_verified
      };
    });
  } catch (e) {
    console.warn('[api/chat] Error fetching active database inventory:', e?.message || e);
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

    // 3. Extract parsed query parameters & constraints
    const constraints = parseUserConstraints(String(lastUserQuery));
    const hasExplicitConstraints = Object.keys(constraints).length > 0;

    let candidateInventory = [];

    // 4. Strict Intent Routing:
    // Only query Supabase when active inventory search is requested AND we are NOT in guide mode.
    if (intent.needsInventory && !isGuide && mode !== 'guide') {
      try {
        const db = getSupabaseClient();
        if (db) {
          const vectorMatches = await withTimeout(
            searchVectorPlots(ai, db, String(lastUserQuery)),
            10000,
            null
          ).catch(() => null);

          const dbInventory = await withTimeout(
            fetchActiveDatabaseInventory(db, constraints.rawPlotCode || constraints.targetPlotId),
            10000,
            []
          ).catch(() => []);

          // Combine candidates avoiding duplicate IDs
          const seen = new Set();
          const combined = [];
          for (const item of [...(vectorMatches || []), ...dbInventory]) {
            if (item && item.id && !seen.has(item.id)) {
              seen.add(item.id);
              combined.push(item);
            }
          }
          candidateInventory = combined;
        }
      } catch (dbErr) {
        console.warn('[api/chat] Database lookup error:', dbErr?.message || dbErr);
        candidateInventory = [];
      }
    }

    // 5. Cross-reference candidates against parsed constraints
    const matchingInventory = candidateInventory.filter((plot) => plotMatchesConstraints(plot, constraints));

    const trimmedMatchingInventory = matchingInventory.map((p) => ({
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

    // Construct system instruction based on classified intent & constraint matching results
    let baseSystemInstruction = '';

    if (isGuide || mode === 'guide') {
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
    } else if (constraints.targetPlotId && trimmedMatchingInventory.length > 0) {
      const targetPlot = trimmedMatchingInventory[0];
      baseSystemInstruction = `You are NAQSHAI AI — a land recommendation and property intelligence specialist for real estate in Pakistan.

The user is specifically asking about Plot ID ${targetPlot.id} (${targetPlot.title}).

STRICT SPECIFIC PLOT ANALYSIS DIRECTIVES:
1. FOCUS ONLY ON ${targetPlot.id}: Provide a detailed, engaging, conversational response strictly addressing ${targetPlot.id}. Do NOT recommend other unrelated plots.
2. COVER ALL KEY DETAILS:
   - Asking Price: ${targetPlot.price}
   - Size & Category: ${targetPlot.size}, ${targetPlot.category}
   - Society & Location: ${targetPlot.society}, ${targetPlot.city}
   - Risk Intelligence: Flood Risk (${targetPlot.floodRisk}), Noise Level (${targetPlot.noiseLevel}), Elevation Profile (${targetPlot.elevation})
   - Proximity & Landmarks: ${targetPlot.notes}
3. NO CORPORATE INTRODUCTIONS: Jump directly into the detailed evaluation of ${targetPlot.id}.
4. Include ONLY ${targetPlot.id} inside 'recommendedPlots'.

TARGET PLOT DATA:
${JSON.stringify(targetPlot, null, 2)}

OUTPUT SPECIFICATION:
Return a single valid JSON object with:
- 'reply': engaging, detailed, conversational breakdown answering the user's prompt specifically for ${targetPlot.id}.
- 'recommendedPlots': array containing strictly the single requested plot object (${targetPlot.id}).`;
    } else if (constraints.targetPlotId && trimmedMatchingInventory.length === 0) {
      baseSystemInstruction = `You are NAQSHAI AI — a land recommendation specialist for Pakistan real estate.

CRITICAL PLOT INQUIRY NOTIFICATION:
The user specifically asked about plot ID "${constraints.targetPlotId}".
No plot matching "${constraints.targetPlotId}" currently exists in our verified database inventory.

STRICT INSTRUCTIONS:
1. Politely inform the user that plot ID "${constraints.targetPlotId}" was not found in our verified active inventory.
2. Direct them to check the plot number or browse available listings on the 3D Map (/explore).
3. Do NOT fabricate any plot details or show unrelated plots.
4. Set 'recommendedPlots' strictly to an empty array [].

OUTPUT SPECIFICATION:
Return a single valid JSON object containing:
- 'reply': polite, direct message stating plot "${constraints.targetPlotId}" was not found in the verified database inventory.
- 'recommendedPlots': []`;
    } else if (hasExplicitConstraints && trimmedMatchingInventory.length === 0) {
      // NO MATCHING PLOTS FOUND FOR USER CONSTRAINTS
      const constraintDesc = formatConstraintsSummary(constraints);
      baseSystemInstruction = `You are NAQSHAI AI — a land recommendation specialist for Pakistan real estate.

CRITICAL INVENTORY CONSTRAINTS NOTIFICATION:
The user searched for property recommendations with specific criteria (${constraintDesc}).
NO MATCHING PLOTS currently exist in our active database inventory that satisfy these specific constraints.

STRICT ADVISORY RULES FOR UNMATCHED INVENTORY:
1. POLITELY EXCUSE YOURSELF & STATE CLEARLY: State politely and clearly that no matching plot listings are currently available in the active database inventory for these specific criteria (${constraintDesc}).
2. DO NOT FABRICATE OR SUGGEST UNRELATED PLOTS: Refrain from showing, inventing, or recommending any hardcoded, fictitious, or irrelevant alternative listings.
3. ADVISE SEARCH ADJUSTMENT: Suggest that the user check back later or adjust their budget, size, or location filters.
4. ABSOLUTELY STRICT: Set 'recommendedPlots' strictly as an empty array [].

OUTPUT SPECIFICATION:
Return a single valid JSON object containing:
- 'reply': polite, direct message explaining no matching plots are currently available in the active inventory for the requested criteria (${constraintDesc}).
- 'recommendedPlots': []`;
    } else {
      // MATCHING INVENTORY AVAILABLE FOR USER QUERY
      baseSystemInstruction = `You are NAQSHAI AI — a land recommendation and property intelligence specialist for real estate in Pakistan.

STRICT CONCISENESS & STYLE DIRECTIVES:
1. NO CORPORATE INTRODUCTIONS: Jump directly to presenting the matching property findings.
2. MATCHING LIVE INVENTORY ONLY:
   Present ONLY the specific matching plots from the MATCHING LIVE DATABASE INVENTORY below.
3. CONCISE & PUNCHY: Keep narrative direct, factual, and compact (2-3 sentences max). Highlight location, size, price, and flood risk metrics for the recommended plots.
4. NEVER fabricate fictitious plots or prices. Never mention database or vector plumbing.
5. Include ALL selected matching plot objects in the 'recommendedPlots' array.

MATCHING LIVE DATABASE INVENTORY:
${JSON.stringify(trimmedMatchingInventory, null, 2)}

OUTPUT SPECIFICATION:
Return a single valid JSON object with:
- 'reply': direct, punchy recommendation narrative highlighting the matching plot(s) from inventory without corporate intro fluff.
- 'recommendedPlots': array containing the matching plot objects selected strictly from MATCHING LIVE DATABASE INVENTORY above.`;
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

      if (constraints.targetPlotId && matchingInventory.length > 0) {
        const p = matchingInventory[0];
        let specificReply = `Here are the details for ${p.id} (${p.title}): Asking price is ${p.price}, located in ${p.society ? p.society + ', ' : ''}${p.city}. Risk Assessment: Flood Risk is ${p.floodRisk}, Noise Level is ${p.noiseLevel}, and Elevation is ${p.elevationProfile}. Landmarks: ${p.proximityNotes}.`;
        if (language === 'UR') {
          specificReply = `${p.id} (${p.title}) کے بارے میں تفصیلات: قیمت ${p.price} ہے، مقام ${p.society ? p.society + '، ' : ''}${p.city} ہے۔ رسک اسیسمنٹ: فلڈ رسک ${p.floodRisk}، شور کی سطح ${p.noiseLevel}، اور بلندی ${p.elevationProfile} ہے۔`;
        } else if (language === 'RO') {
          specificReply = `${p.id} (${p.title}) ki details: Price ${p.price} hai, location ${p.society ? p.society + ', ' : ''}${p.city} hai. Flood Risk: ${p.floodRisk}, Noise Level: ${p.noiseLevel}, Elevation: ${p.elevationProfile}.`;
        }

        return new Response(
          JSON.stringify({
            reply: specificReply,
            recommendedPlots: [p],
            isFallback: true,
            success: true
          }),
          { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
      }

      if (constraints.targetPlotId && matchingInventory.length === 0) {
        let noPlotReply = `I checked our verified database inventory, but could not find a listing for ${constraints.targetPlotId}. Please verify the plot ID or explore available listings on the 3D Map (/explore).`;
        if (language === 'UR') {
          noPlotReply = `ہماری تصدیق شدہ انوینٹری میں پلاٹ آئی ڈی ${constraints.targetPlotId} نہیں ملا۔ برائے مہربانی پلاٹ نمبر چیک کریں یا 3D نقشے پر دستیاب فہرستیں دیکھیں۔`;
        } else if (language === 'RO') {
          noPlotReply = `Hamari verified inventory me Plot ID ${constraints.targetPlotId} nahi mila. Baraye mehrbani plot number check karein ya 3D Map (/explore) par available listings dekhein.`;
        }

        return new Response(
          JSON.stringify({
            reply: noPlotReply,
            recommendedPlots: [],
            isFallback: true,
            success: true
          }),
          { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
      }

      if (hasExplicitConstraints && matchingInventory.length === 0) {
        let noMatchReply = `I apologize, but there are currently no matching plots in our active database inventory for your specified criteria (${formatConstraintsSummary(constraints)}). Please try adjusting your search filters.`;
        if (language === 'UR') {
          noMatchReply = 'معذرت، ہماری فعال ڈیٹا بیس انوینٹری میں آپ کے ان مخصوص معیارات کے مطابق اس وقت کوئی پلاٹ دستیاب نہیں ہے۔ برائے مہربانی اپنے سرچ فلٹرز کو تھوڑا تبدیل کر کے دوبارہ کوشش کریں۔';
        } else if (language === 'RO') {
          noMatchReply = 'Maazrat, hamari active database inventory me aap ki specific criteria ke mutabiq filhal koi plot dastayab nahi hai. Baraye mehrbani apnay search filters me thori tabdeeli karke dobara koshish karein.';
        }

        return new Response(
          JSON.stringify({
            reply: noMatchReply,
            recommendedPlots: [],
            isFallback: true,
            success: true
          }),
          { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
      }

      if (matchingInventory.length > 0) {
        let cleanReply = 'Here are top verified plot listings matching your criteria from our active inventory.';
        if (language === 'UR') {
          cleanReply = 'یہاں آپ کے معیار کے مطابق ہماری فعال انوینٹری سے بہترین تصدیق شدہ پلاٹ کی فہرستیں درج ہیں۔';
        } else if (language === 'RO') {
          cleanReply = 'Aap ki criteria ke mutabiq hamari active inventory se top verified plot listings ye hain:';
        }

        return new Response(
          JSON.stringify({
            reply: cleanReply,
            recommendedPlots: matchingInventory.slice(0, 3),
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

    // Stream the generated JSON in progressive chunks
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
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
