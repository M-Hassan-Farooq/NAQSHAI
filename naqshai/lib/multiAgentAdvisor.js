import { GoogleGenAI } from '@google/genai';
import { checkRegulatoryStatus } from './regulatoryRegistry.js';
import { computeEnvironmentalMetrics } from './environmentalMetrics.js';

/**
 * NAQSHAI Autonomous Multi-Agent Real Estate Intelligence Architecture
 * 
 * Model Strategy:
 * 1. WORKER SPECIALISTS (Cadastral, Regulatory, Environmental):
 *    Powered by `gemini-3.5-flash-lite` (latency < 800ms).
 *    Laser-focused, deterministic data extraction and domain lookup.
 * 
 * 2. CHIEF SYNTHESIZER (Strategic Advisory & Voice):
 *    Powered by `gemini-3.5-flash` (with fallback to `gemini-3.5-flash-lite`).
 *    Deep domain reasoning, trade-off analysis, and fluid multilingual output (EN/UR/RO).
 */

const WORKER_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
];

const SYNTHESIZER_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-lite-latest',
];

export function withTimeout(promise, ms, fallbackValue) {
  let timer;
  const timeoutPromise = new Promise((resolve) => {
    timer = setTimeout(() => resolve(fallbackValue), ms);
  });
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    timeoutPromise
  ]);
}

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

/**
 * Fast greeting detector: avoids unnecessary agent swarm instantiation for simple "hi" / "salam"
 */
export function isCasualGreeting(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim().toLowerCase();
  if (trimmed.length > 50) return false;
  return /^(salam|assalam|aoa|hello|hi|hey|kya hal|kaise ho|kesai ho|thanks|thank you|shukriya)[\s!?.a-z0-9]*$/i.test(trimmed);
}

// -----------------------------------------------------------------------------
// AGENT 1: Cadastral & Valuation Specialist
// -----------------------------------------------------------------------------
export async function runCadastralAndPriceAgent({ ai, db, userMessage }) {
  console.log('[Multi-Agent Swarm] ⚡ Launching Agent 1: Cadastral & Valuation Specialist...');
  
  let candidates = [];
  try {
    if (db) {
      const { data, error } = await withTimeout(
        db.from('plots').select('id, title, city, price_pkr, size_dimensions, category, flood_risk, noise_level, is_verified').limit(15),
        4000,
        { data: [] }
      );
      if (!error && Array.isArray(data)) {
        candidates = data.map((row) => {
          const env = computeEnvironmentalMetrics(row);
          const society = extractSociety(row.title);
          const reg = checkRegulatoryStatus(society, row.city);
          return {
            id: row.id,
            title: row.title,
            society,
            city: row.city,
            size: row.size_dimensions || '10 Marla',
            price: formatPkr(row.price_pkr),
            pricePkr: Number(row.price_pkr) || 0,
            floodRisk: row.flood_risk || env.floodRisk,
            regulatoryStatus: `${reg.badgeText} - ${reg.statusLabel}`,
          };
        });
      }
    }
  } catch (err) {
    console.warn('[Agent 1] DB candidate fetch warning:', err?.message || err);
  }

  const prompt = `Analyze this Pakistani real estate inquiry from a purely financial and cadastral perspective:
"${userMessage}"

Database inventory sample:
${JSON.stringify(candidates.slice(0, 5), null, 2)}

Provide concise factual findings:
1. Target budget in PKR Crore/Lakh (and whether it is realistic for the target area)
2. Target plot sizes in Marla or Kanal
3. Identified corridors/societies
4. 2-3 best matching plots from inventory if applicable.`;

  for (const model of WORKER_MODELS) {
    try {
      const res = await withTimeout(
        ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: 'You are NAQSHAI Cadastral & Price Specialist. Extract exact plot dimensions, calculate price per Marla, evaluate budget feasibility in Islamabad/Rawalpindi, and recommend matching plots.',
          }
        }),
        8000,
        null
      );
      if (res?.text) {
        console.log('[Multi-Agent Swarm] ✓ Agent 1 (Cadastral) complete.');
        return {
          findings: res.text.trim(),
          candidatePlots: candidates.slice(0, 4)
        };
      }
    } catch (_) {}
  }

  return {
    findings: 'Budget and cadastral analysis: Average 10 Marla plots in Zone-2 (B-17) range from 1.5–2.5 Cr; DHA Phase 2 ranges from 2.5–4.0 Cr; Airport corridor (TopCity) ranges from 1.6–2.4 Cr.',
    candidatePlots: candidates.slice(0, 3)
  };
}

// -----------------------------------------------------------------------------
// AGENT 2: Legal & Regulatory Clearance Specialist
// -----------------------------------------------------------------------------
export async function runRegulatoryAndLegalAgent({ ai, userMessage }) {
  console.log('[Multi-Agent Swarm] ⚡ Launching Agent 2: Legal & Regulatory Specialist...');

  const prompt = `Evaluate the legal tenure and regulatory compliance for this Islamabad/Rawalpindi property inquiry:
"${userMessage}"

Key Authorities to analyze if mentioned:
- CDA (Capital Development Authority - Zone 1 to Zone 5, NDC slip transfer, computerized allotment)
- RDA (Rawalpindi Development Authority, Digital RDA, Punjab Land Records Authority / PLRA Computerized Fard, e-Stamp)
- Private Societies (DHA Islamabad, Bahria Town, TopCity-1, Mumtaz City allotment letters)

Detail:
1. Transfer mechanism differences (PLRA Fard vs CDA NDC computerized slip vs society transfer letter)
2. On-ground balloted possession plots vs non-balloted files risk
3. Regulatory warnings or NOC caveats to watch out for.`;

  for (const model of WORKER_MODELS) {
    try {
      const res = await withTimeout(
        ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: 'You are NAQSHAI Regulatory & Legal Compliance Specialist. Detail CDA Zone 1-5 planning regulations, RDA jurisdictions, PLRA Computerized Fards, Punjab e-Stamp verification, and NOC approvals.',
          }
        }),
        8000,
        null
      );
      if (res?.text) {
        console.log('[Multi-Agent Swarm] ✓ Agent 2 (Regulatory) complete.');
        return res.text.trim();
      }
    } catch (_) {}
  }

  return 'Legal & Regulatory Analysis: CDA Zone-1 plots enjoy sovereign government leasehold/freehold tenure with 100% legal security via CDA One-Window NDC slips. PLRA Computerized Fards govern Rawalpindi revenue mouzas with computerized biometric registry. Private society transfers rely on society allotment certificates; balloted possession plots are mandatory for safe immediate construction.';
}

// -----------------------------------------------------------------------------
// AGENT 3: Environmental & Geospatial Hazard Specialist
// -----------------------------------------------------------------------------
export async function runEnvironmentalAndTerrainAgent({ ai, userMessage }) {
  console.log('[Multi-Agent Swarm] ⚡ Launching Agent 3: Environmental & Terrain Specialist...');

  const prompt = `Analyze the environmental, hydrological, and geotechnical risk factors for this twin cities property query:
"${userMessage}"

Key Environmental factors to cover:
1. Monsoon flood hazard and seasonal nullah drainage (Nullah Lai basin in Rawalpindi, Soan River flood plain, Margalla natural run-off channels)
2. Solid ground (pucca zameen) vs filled soil (khadda / bhrati zameen) foundation cost impact
3. Noise levels and proximity to major commercial corridors or aviation paths (Islamabad International Airport).`;

  for (const model of WORKER_MODELS) {
    try {
      const res = await withTimeout(
        ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: 'You are NAQSHAI Environmental & Geospatial Hazard Specialist. Assess monsoon flood risks, soil filling foundation costs, seasonal nullah overflow, and noise levels across Islamabad and Rawalpindi.',
          }
        }),
        8000,
        null
      );
      if (res?.text) {
        console.log('[Multi-Agent Swarm] ✓ Agent 3 (Environmental) complete.');
        return res.text.trim();
      }
    } catch (_) {}
  }

  return 'Environmental & Topographical Assessment: Low-lying sectors near Nullah Lai and Soan River suffer seasonal monsoon flash flood risks and high water tables requiring specialized raft foundations. Plots located on filled land (bhrati zameen) can increase foundation excavation and structural piling costs by 15-25%. Solid elevated ground in CDA Zone-2 or DHA elevated sectors represents minimal hazard.';
}

// -----------------------------------------------------------------------------
// AGENT 4: Chief Real Estate Synthesizer & Voice Agent
// -----------------------------------------------------------------------------
export async function synthesizeMultiAgentBrief({
  ai,
  userMessage,
  conversationHistory,
  cadastralData,
  regulatoryData,
  environmentalData,
  language = 'Auto'
}) {
  console.log('[Multi-Agent Swarm] 🎯 Synthesizing final advisory brief from 3 specialist reports...');

  const LANG_DIRECTIVE = {
    UR: 'Respond strictly in Urdu Nastaliq script (اردو).',
    RO: 'Respond naturally in Roman Urdu (e.g. "Main aap ko detail mein guide karta hoon...").',
    EN: 'Respond strictly in professional English.'
  }[language] || 'Respond in the natural language and style of the user prompt (if Roman Urdu, reply in Roman Urdu).';

  const systemInstruction = `You are NAQSHAI AI — Chief Real Estate Investment Advisor for Islamabad and Rawalpindi.
You have received real-time intelligence reports from your 3 specialized subagents:
1. Cadastral & Price Specialist Report
2. Legal & Regulatory Clearance Specialist Report
3. Environmental & Topographical Risk Specialist Report

Synthesize these 3 specialist findings into a unified, decisive, high-authority advisory response.
Address every question in the user's prompt directly, clearly comparing the corridors, legal safety, flood hazards, and capital ROI.
Deliver an executive verdict on where capital should be allocated today.

LANGUAGE DIRECTIVE:
${LANG_DIRECTIVE}

OUTPUT FORMAT:
Return strictly a valid JSON object matching:
{
  "reply": "Your cohesive narrative synthesis answering all points thoroughly and punchily.",
  "recommendedPlots": [
    {
      "id": "Plot ID",
      "title": "Plot Title",
      "society": "Society / Sector",
      "city": "City",
      "size": "Plot Size",
      "price": "Formatted Price",
      "floodRisk": "Low Hazard / Moderate",
      "noiseLevel": "Quiet Zone / Low",
      "regulatoryStatus": "e.g. CDA Approved or CDA Zone 1"
    }
  ]
}`;

  const synthesisPrompt = `USER INQUIRY:
"${userMessage}"

--- AGENT 1 (CADASTRAL & VALUATION REPORT) ---
${cadastralData?.findings || 'Standard market pricing.'}

--- AGENT 2 (LEGAL & REGULATORY REPORT) ---
${regulatoryData || 'Standard regulatory checks.'}

--- AGENT 3 (ENVIRONMENTAL & TERRAIN REPORT) ---
${environmentalData || 'Low flood hazard terrain.'}

Synthesize these reports into the final JSON output now.`;

  for (const model of SYNTHESIZER_MODELS) {
    try {
      const res = await withTimeout(
        ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: synthesisPrompt }] }],
          config: {
            systemInstruction,
            responseMimeType: 'application/json'
          }
        }),
        25000,
        null
      );

      if (res?.text) {
        const cleaned = res.text.trim().replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && parsed.reply) {
          if (!parsed.recommendedPlots || parsed.recommendedPlots.length === 0) {
            if (cadastralData?.candidatePlots && cadastralData.candidatePlots.length > 0) {
              parsed.recommendedPlots = cadastralData.candidatePlots;
            }
          }
          console.log('[Multi-Agent Swarm] ✓ Synthesis successfully completed via', model);
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`[Synthesizer] Model ${model} retry note:`, err?.message || err);
    }
  }

  // Graceful synthesis fallback
  return {
    reply: `${cadastralData?.findings || ''}\n\n**Legal & Tenure:**\n${regulatoryData || ''}\n\n**Environmental Risk:**\n${environmentalData || ''}`,
    recommendedPlots: cadastralData?.candidatePlots || []
  };
}
