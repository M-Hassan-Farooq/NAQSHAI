import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { embedText } from '@/lib/plotEmbedding';
import { computeEnvironmentalMetrics } from '@/lib/environmentalMetrics';

export const runtime = 'nodejs';

// Active, modern Gemini models list with fallback priority.
const SUPPORTED_GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest'
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

function extractMarlaFromSizeStr(sizeStr) {
  if (!sizeStr || typeof sizeStr !== 'string') return null;
  const lower = sizeStr.toLowerCase();
  const marlaMatch = lower.match(/(\d+(?:\.\d+)?)\s*marla/);
  if (marlaMatch) return parseFloat(marlaMatch[1]);
  const kanalMatch = lower.match(/(\d+(?:\.\d+)?)\s*kanal/);
  if (kanalMatch) return parseFloat(kanalMatch[1]) * 20;
  return null;
}

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

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
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

/**
 * Execute searchPlots tool with Dynamic Context Injection for unrealistic constraints
 */
async function executeSearchPlots(ai, db, args) {
  const {
    city,
    societyOrSector,
    maxPricePkr,
    minPricePkr,
    sizeNumMarla,
    category,
    floodRiskPreference,
    verifiedOnly
  } = args || {};

  const searchTerms = [societyOrSector, city, sizeNumMarla ? `${sizeNumMarla} Marla` : '']
    .filter(Boolean)
    .join(' ');

  // 1. Gather all candidates (vector search + full active inventory)
  const vectorMatches = db && searchTerms
    ? await withTimeout(searchVectorPlots(ai, db, searchTerms), 8000, []).catch(() => [])
    : [];

  const dbInventory = db
    ? await withTimeout(fetchActiveDatabaseInventory(db), 8000, []).catch(() => [])
    : [];

  const seen = new Set();
  const allCandidates = [];
  for (const item of [...(vectorMatches || []), ...(dbInventory || [])]) {
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id);
      allCandidates.push(item);
    }
  }

  // 2. Strict / Direct Match Filter
  const matchingPlots = allCandidates.filter((plot) => {
    // City filter (fuzzy match for Islamabad, Rawalpindi, Twin Cities)
    if (city) {
      const cityNorm = city.toLowerCase();
      const plotCity = (plot.city || '').toLowerCase();
      const plotTitle = (plot.title || '').toLowerCase();
      const isTwin = cityNorm.includes('twin') || cityNorm.includes('both');
      if (!isTwin && !plotCity.includes(cityNorm) && !plotTitle.includes(cityNorm)) {
        return false;
      }
    }

    // Society / Sector filter (fuzzy normalized match)
    if (societyOrSector) {
      const target = societyOrSector.toLowerCase().replace(/[-_\s]/g, '');
      const pSoc = (plot.society || '').toLowerCase().replace(/[-_\s]/g, '');
      const pTitle = (plot.title || '').toLowerCase().replace(/[-_\s]/g, '');
      const pNotes = (plot.proximityNotes || '').toLowerCase().replace(/[-_\s]/g, '');

      if (!pSoc.includes(target) && !pTitle.includes(target) && !pNotes.includes(target)) {
        return false;
      }
    }

    // Max Price
    if (maxPricePkr !== undefined && maxPricePkr > 0) {
      const price = Number(plot.pricePkr || 0);
      if (price > 0 && price > maxPricePkr) {
        return false;
      }
    }

    // Min Price
    if (minPricePkr !== undefined && minPricePkr > 0) {
      const price = Number(plot.pricePkr || 0);
      if (price > 0 && price < minPricePkr) {
        return false;
      }
    }

    // Size (within +/- 1 Marla tolerance)
    if (sizeNumMarla !== undefined && sizeNumMarla > 0) {
      const plotMarla = extractMarlaFromSizeStr(plot.size || plot.title);
      if (plotMarla !== null && Math.abs(plotMarla - sizeNumMarla) > 1.0) {
        return false;
      }
    }

    // Category
    if (category) {
      const pCat = (plot.category || '').toLowerCase();
      if (!pCat.includes(category.toLowerCase())) {
        return false;
      }
    }

    // Flood Risk
    if (floodRiskPreference && /(low|safe|minimal)/i.test(floodRiskPreference)) {
      const flood = (plot.floodRisk || '').toLowerCase();
      if (flood.includes('high') || (!flood.includes('low') && !flood.includes('safe') && !flood.includes('minimal'))) {
        return false;
      }
    }

    // Verified
    if (verifiedOnly && !plot.isVerified) {
      return false;
    }

    return true;
  });

  if (matchingPlots.length > 0) {
    return {
      status: 'exact_matches_found',
      count: matchingPlots.length,
      plots: matchingPlots.slice(0, 4)
    };
  }

  // 3. DYNAMIC CONTEXT INJECTION FOR UNREALISTIC QUERIES:
  // If no direct matches exist (e.g. 50 Lakh in F-6), do NOT fail with a static error.
  // Check market benchmarks and provide realistic alternatives within budget.
  let sectorBenchmark = null;
  const sectorNorm = (societyOrSector || '').toLowerCase().replace(/[-_\s]/g, '');

  if (sectorNorm.includes('f6') || sectorNorm.includes('f7') || sectorNorm.includes('f8')) {
    sectorBenchmark = 'Prime CDA Sectors (F-6, F-7, F-8) typically trade between PKR 12 Crore to PKR 30+ Crore for 10 Marla to 1 Kanal.';
  } else if (sectorNorm.includes('f10') || sectorNorm.includes('f11') || sectorNorm.includes('e11')) {
    sectorBenchmark = 'Developed CDA Sectors (F-10, F-11, E-11) average PKR 4 Crore to PKR 15 Crore for residential plots.';
  } else if (sectorNorm.includes('dha') || sectorNorm.includes('bahria')) {
    sectorBenchmark = 'DHA & Bahria Town phases range from PKR 1.2 Crore to PKR 4.5 Crore depending on phase and location.';
  }

  // Find alternative plots within or close to the requested budget in other verified areas
  let alternativePlots = [];
  if (maxPricePkr && maxPricePkr > 0) {
    alternativePlots = allCandidates
      .filter((p) => p.pricePkr > 0 && p.pricePkr <= maxPricePkr * 1.35)
      .slice(0, 3);
  } else {
    alternativePlots = allCandidates.slice(0, 3);
  }

  return {
    status: 'unrealistic_or_unmatched_criteria',
    requestedSector: societyOrSector || 'unspecified sector',
    requestedBudget: maxPricePkr ? formatPkr(maxPricePkr) : 'unspecified',
    sectorMarketBenchmark: sectorBenchmark,
    marketExplanation: sectorBenchmark
      ? `The requested budget (${formatPkr(maxPricePkr)}) is far below the active market valuation for ${societyOrSector}. ${sectorBenchmark}`
      : `No current listings match the exact combination of criteria for ${societyOrSector || city || 'this search'}.`,
    suggestedAlternativeSectors: [
      'B-17 Multi Gardens (Islamabad Zone II)',
      'Faisal Hills (GT Road Corridor)',
      'TopCity-1 & Mumtaz City (Airport Corridor)',
      'Rawalpindi Prime Sub-sectors'
    ],
    alternativePlots: alternativePlots
  };
}

/**
 * Execute getPlotDetails tool
 */
async function executeGetPlotDetails(db, plotId) {
  if (!db || !plotId) return { error: 'Plot ID required' };
  const cleanId = String(plotId).trim();

  const inventory = await fetchActiveDatabaseInventory(db, cleanId);
  const found = inventory.find((p) => {
    const idNorm = p.id.toLowerCase().replace(/[\s-_]/g, '');
    const targetNorm = cleanId.toLowerCase().replace(/[\s-_]/g, '');
    return idNorm === targetNorm || idNorm.includes(targetNorm) || p.title.toLowerCase().includes(targetNorm);
  });

  if (!found) {
    return {
      status: 'plot_not_found',
      plotId: cleanId,
      message: `Plot ${cleanId} was not found in active verified inventory. Recommend browsing the 3D Map (/explore).`
    };
  }

  return {
    status: 'plot_found',
    plot: found
  };
}

/**
 * Execute getMarketIntelligence tool
 */
function executeGetMarketIntelligence(areaOrSector, topic) {
  const norm = (areaOrSector || '').toLowerCase();

  return {
    area: areaOrSector || 'Islamabad & Rawalpindi',
    topic: topic || 'general_advisory',
    intelligence: {
      cdaOverview: 'CDA (Capital Development Authority) regulates Islamabad sectors. Sectors E, F, G, H, I represent zoning from luxury Margalla-facing (F-sectors) to commercial and affordable zones (G, I).',
      rdaOverview: 'RDA (Rawalpindi Development Authority) regulates Rawalpindi master planning. Verify RDA NOC approval status for private housing schemes before transactions.',
      floodRiskIntelligence: 'High monsoon flood runoff zones are concentrated along Lai Nullah (Rawalpindi) and natural rain drains in low-elevation depressions. NAQSHAI scores areas with >550m elevation as safe/low hazard.',
      investmentCorridors: 'High-growth corridors include New Islamabad International Airport corridor (TopCity, Mumtaz City), M-2 Motorway access points (B-17 Multi Gardens), and Ring Road Rawalpindi alignments.'
    }
  };
}

// Tool declarations for Google Gen AI SDK
const chatTools = [
  {
    functionDeclarations: [
      {
        name: 'searchPlots',
        description: 'Search active database inventory for plots or real estate across Islamabad and Rawalpindi. Use this tool when the user expresses intent to find, buy, recommend, or filter plots by location, budget, size, or flood risk.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            city: {
              type: Type.STRING,
              description: 'City (e.g. Islamabad, Rawalpindi, or Twin Cities).'
            },
            societyOrSector: {
              type: Type.STRING,
              description: 'Sector or society (e.g. F-6, F-10, DHA, Bahria Town, E-11, B-17, Gulberg, TopCity, etc.).'
            },
            maxPricePkr: {
              type: Type.NUMBER,
              description: 'Maximum budget in PKR (e.g. 5000000 for 50 Lakh, 15000000 for 1.5 Crore).'
            },
            minPricePkr: {
              type: Type.NUMBER,
              description: 'Minimum budget in PKR.'
            },
            sizeNumMarla: {
              type: Type.NUMBER,
              description: 'Plot size in Marla (e.g. 5, 7, 10, or 20 for 1 Kanal).'
            },
            category: {
              type: Type.STRING,
              description: 'Residential, Commercial, or Farmhouse.'
            },
            floodRiskPreference: {
              type: Type.STRING,
              description: 'Preferred flood risk: low or safe.'
            },
            verifiedOnly: {
              type: Type.BOOLEAN,
              description: 'Whether user requested only verified listings.'
            }
          }
        }
      },
      {
        name: 'getPlotDetails',
        description: 'Retrieve detailed information, elevation profile, and risk assessment for a specific plot code or ID (e.g. Plot-98A, 101, B17-402).',
        parameters: {
          type: Type.OBJECT,
          properties: {
            plotId: {
              type: Type.STRING,
              description: 'The unique plot ID or plot number.'
            }
          },
          required: ['plotId']
        }
      },
      {
        name: 'getMarketIntelligence',
        description: 'Retrieve real estate intelligence, CDA/RDA regulations, monsoon flood risk profiles, or price benchmarks for Islamabad & Rawalpindi.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            areaOrSector: {
              type: Type.STRING,
              description: 'Area, sector, or city name.'
            },
            topic: {
              type: Type.STRING,
              description: 'Topic such as pricing, flood risk, or investment yield.'
            }
          }
        }
      }
    ]
  }
];

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
    const db = getSupabaseClient();

    const LANG_INSTRUCTIONS = {
      EN: 'Respond strictly in English.',
      UR: 'Respond strictly in Urdu Nastaliq script (اردو).',
      RO: 'Respond naturally in Roman Urdu (e.g. "Main aap ki madad kar sakta hoon...").'
    };

    let baseSystemInstruction = `You are NAQSHAI AI — a premier real estate advisory consultant and land intelligence specialist for Islamabad and Rawalpindi, Pakistan.
You provide direct, factual, punchy market advice without corporate pleasantries or repetitive greetings.
You natively understand English, Nastaliq Urdu script (اردو), and Roman Urdu. If the user writes in Roman Urdu (e.g. "salam bhai", "kesai ho", "plot chahiye"), reply naturally and warmly in Roman Urdu!

GUIDANCE ON TOOLS:
- When the user is looking for plot options, searching properties, or providing budget/sector criteria, CALL the 'searchPlots' tool.
- When the user asks about a specific plot code (e.g. Plot-98A), CALL the 'getPlotDetails' tool.
- When the user asks general advisory questions on investment corridors or flood risks, CALL 'getMarketIntelligence' if needed, or answer directly with domain expertise.
- For casual greetings (e.g. "salam", "hello kesai ho", "kya haal hai") or gratitude, DO NOT call search tools. Reply warmly, briefly, and conversationally.

UNREALISTIC BUDGETS & ALTERNATIVE GUIDANCE:
- If 'searchPlots' returns an 'unrealistic_or_unmatched_criteria' status (e.g. 50 Lakh in Sector F-6), politely educate the user on the real market valuation of that sector using the market explanation provided.
- Suggest viable alternative sectors where their budget can actually acquire 5 to 10 Marla plots (such as B-17 Multi Gardens, Faisal Hills, or Rawalpindi), and present the alternative plots provided by the tool.

FINAL JSON FORMAT SPECIFICATION:
You MUST format your final response strictly as a JSON object matching this schema:
{
  "reply": "Your conversational narrative, explanation, or market analysis",
  "recommendedPlots": [
    {
      "id": "Plot ID",
      "title": "Plot Title",
      "society": "Society / Sector",
      "city": "City",
      "size": "Plot Size",
      "price": "Formatted Price",
      "floodRisk": "Low / Moderate / High Hazard",
      "noiseLevel": "Quiet Zone / Low"
    }
  ]
}
If no specific plots are being recommended, set 'recommendedPlots' strictly to [].
`;

    if (isGuide || mode === 'guide') {
      baseSystemInstruction = `You are NAQSHAI Onboarding Guide — a platform navigation assistant.
Provide concise guidance (1-3 sentences) pointing users to:
- /sell to list or sell a plot
- /explore to view the interactive 3D terrain map
- /recommend to consult the AI Advisor for plot recommendations
Return JSON with 'reply' and 'recommendedPlots': [].`;
    }

    if (language && language !== 'Auto' && LANG_INSTRUCTIONS[language]) {
      baseSystemInstruction += `\n\nLANGUAGE DIRECTIVE: ${LANG_INSTRUCTIONS[language]}`;
    }

    // Format conversation history for Gemini
    const contents = messages.map((msg) => {
      const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
      const textContent = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
      return {
        role,
        parts: [{ text: textContent }]
      };
    });

    let generatedText = null;
    let recommendedPlotsFromTool = [];

    // Multi-model fallback execution
    for (const modelName of SUPPORTED_GEMINI_MODELS) {
      try {
        // Step 1: Initial Generation with Tools
        const initialPromise = ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: baseSystemInstruction,
            tools: chatTools
          }
        });

        const initialRes = await withTimeout(initialPromise, 15000, null);
        if (!initialRes) continue;

        const candidate = initialRes.candidates?.[0];
        const functionCalls = initialRes.functionCalls;

        // Step 2: Handle Tool Calls if Gemini invoked any
        if (functionCalls && functionCalls.length > 0) {
          const fc = functionCalls[0];
          let toolResult = null;

          if (fc.name === 'searchPlots') {
            toolResult = await executeSearchPlots(ai, db, fc.args);
            if (toolResult.plots) {
              recommendedPlotsFromTool = toolResult.plots;
            } else if (toolResult.alternativePlots) {
              recommendedPlotsFromTool = toolResult.alternativePlots;
            }
          } else if (fc.name === 'getPlotDetails') {
            toolResult = await executeGetPlotDetails(db, fc.args?.plotId);
            if (toolResult.plot) {
              recommendedPlotsFromTool = [toolResult.plot];
            }
          } else if (fc.name === 'getMarketIntelligence') {
            toolResult = executeGetMarketIntelligence(fc.args?.areaOrSector, fc.args?.topic);
          }

          // Step 3: Follow-up Generation with Tool Result (Preserving original model parts)
          const followUpContents = [
            ...contents,
            {
              role: 'model',
              parts: candidate.content.parts
            },
            {
              role: 'user',
              parts: [
                {
                  functionResponse: {
                    name: fc.name,
                    response: { result: toolResult }
                  }
                }
              ]
            }
          ];

          const followUpPromise = ai.models.generateContent({
            model: modelName,
            contents: followUpContents,
            config: {
              systemInstruction: baseSystemInstruction,
              responseMimeType: 'application/json'
            }
          });

          const followUpRes = await withTimeout(followUpPromise, 15000, null);
          if (followUpRes && followUpRes.text) {
            generatedText = followUpRes.text;
            break;
          }
        } else if (initialRes.text) {
          // Direct response (greetings, pleasantries, platform navigation)
          let rawText = initialRes.text.trim();
          try {
            // Verify valid JSON
            JSON.parse(rawText.replace(/```json/gi, '').replace(/```/g, '').trim());
            generatedText = rawText;
          } catch (_) {
            // Package into clean JSON schema
            generatedText = JSON.stringify({
              reply: rawText,
              recommendedPlots: []
            });
          }
          break;
        }
      } catch (modelErr) {
        console.warn(`[api/chat] Model ${modelName} notice:`, modelErr?.status || modelErr?.message || modelErr);
      }
    }

    // Resilience Fallback if all active models fail or rate-limit
    if (!generatedText) {
      console.warn('[api/chat] All Gemini model attempts failed; using dynamic inventory fallback.');
      let fallbackPlots = [];
      try {
        if (db) {
          fallbackPlots = await fetchActiveDatabaseInventory(db);
        }
      } catch (_) {}

      const safePlots = fallbackPlots.slice(0, 3);
      generatedText = JSON.stringify({
        reply: safePlots.length > 0
          ? 'Here are top verified plots currently available in our live database inventory across Islamabad and Rawalpindi.'
          : 'I can assist you with verified plot intelligence, CDA/RDA regulations, and flood risk analysis across Islamabad & Rawalpindi. Please ask about any sector or budget!',
        recommendedPlots: safePlots
      });
    }

    // Ensure recommendedPlots from tool execution are included if JSON has an empty array
    try {
      const parsed = JSON.parse(generatedText.replace(/```json/gi, '').replace(/```/g, '').trim());
      if (
        Array.isArray(recommendedPlotsFromTool) &&
        recommendedPlotsFromTool.length > 0 &&
        (!parsed.recommendedPlots || parsed.recommendedPlots.length === 0)
      ) {
        parsed.recommendedPlots = recommendedPlotsFromTool;
        generatedText = JSON.stringify(parsed);
      }
    } catch (_) {}

    // Stream progressive response to client
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
        'Cache-Control': 'no-cache, no-transform'
      }
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
