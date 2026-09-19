/**
 * Automated Test Runner & Stress-Test Suite for NAQSHAI AI Advisor Chat Pipeline
 * Targets: /api/chat
 * Analyzes: Interceptors, Canned Responses, Semantic Blindspots, and Constraint Traps
 */

const API_URL = process.env.CHAT_API_URL || 'http://localhost:3000/api/chat';

const TEST_SUITES = [
  {
    name: 'Suite A: Roman Urdu / Multilingual Greetings',
    category: 'multilingual_greetings',
    cases: [
      {
        id: 'A1',
        prompt: 'hello kesai ho',
        expectedBehavior: 'Natural Roman Urdu friendly response via Gemini',
        interceptorRisk: 'conversationHelper spelling mismatch ("kesai" vs "kese/kaisay") -> falls through or fails'
      },
      {
        id: 'A2',
        prompt: 'salam bhai',
        expectedBehavior: 'Culturally aware greeting in Roman Urdu / Urdu',
        interceptorRisk: 'conversationHelper regex interceptor matches "salam" -> triggers static English greeting canned text under Auto language'
      },
      {
        id: 'A3',
        prompt: 'kya hal hai',
        expectedBehavior: 'Natural conversational reply',
        interceptorRisk: 'conversationHelper exact regex interceptor -> canned response bypassing Gemini'
      },
      {
        id: 'A4',
        prompt: 'assalam o alaikum kaise hain aap',
        expectedBehavior: 'Polite Urdu greeting in Roman Urdu',
        interceptorRisk: 'Partial token matching in conversationHelper vs Gemini fallback'
      }
    ]
  },
  {
    name: 'Suite B: Semantic Understanding & Geographic Synonyms',
    category: 'semantic_understanding',
    cases: [
      {
        id: 'B1',
        prompt: 'I need something in the capital territory',
        expectedBehavior: 'Recognize "capital territory" as Islamabad, trigger inventory/intelligence for Islamabad',
        interceptorRisk: 'classifyQueryIntent and parseUserConstraints only check for exact "islamabad" string -> city filter misses completely'
      },
      {
        id: 'B2',
        prompt: 'twin cities investment',
        expectedBehavior: 'Recognize "twin cities" as Islamabad & Rawalpindi, suggest high-yield sectors',
        interceptorRisk: 'cities = ["islamabad", "rawalpindi"] checks fail; classifyQueryIntent may classify as open_ended or general_advisory without city bounds'
      },
      {
        id: 'B3',
        prompt: 'safe property near pindi',
        expectedBehavior: 'Recognize "pindi" as Rawalpindi and evaluate low flood risk properties',
        interceptorRisk: '"pindi" is not in the hardcoded cities array ["islamabad", "rawalpindi"] -> rawalpindi constraint never set'
      },
      {
        id: 'B4',
        prompt: 'recommend an investment in isb',
        expectedBehavior: 'Recognize "isb" as Islamabad abbreviation and provide recommendations',
        interceptorRisk: '"isb" is not recognized by parseUserConstraints cities array'
      }
    ]
  },
  {
    name: 'Suite C: Inventory Constraints & Market Reality',
    category: 'inventory_constraints',
    cases: [
      {
        id: 'C1',
        prompt: '10 Marla plot under 50 Lakh in F-6',
        expectedBehavior: 'AI should provide realistic real estate intelligence explaining F-6 price dynamics (10-20+ Crore) rather than a rigid empty inventory notice',
        interceptorRisk: 'parseUserConstraints sets maxPrice=5000000 and sector=f-6; plotMatchesConstraints eliminates 100% of plots; triggers CRITICAL INVENTORY CONSTRAINTS NOTIFICATION canned narrative or fallback'
      },
      {
        id: 'C2',
        prompt: '5 Marla plot in F-10 under 2 Crore',
        expectedBehavior: 'Search database for F-10 plots or advise on typical F-10 pricing',
        interceptorRisk: 'plotMatchesConstraints hard in-memory filter -> zero plots if none match exact threshold'
      },
      {
        id: 'C3',
        prompt: 'show me plots in E-11',
        expectedBehavior: 'Recognize sector E-11 in Islamabad and search inventory',
        interceptorRisk: 'societiesSectors array lacks "e-11" -> sector filter completely omitted'
      }
    ]
  }
];

// Known canned response phrases from lib/conversationHelper.js and app/api/chat/route.js
const KNOWN_CANNED_SNIPPETS = [
  "I'm doing well, thank you! Welcome to NAQSHAI",
  "Main bilkul theek hoon, shukriya! NAQSHAI me khush aamdeed",
  "Hello and welcome to NAQSHAI! How can I help you find plots",
  "Salam! NAQSHAI me khush aamdeed! Main Islamabad aur Rawalpindi me verified plots",
  "I am NAQSHAI AI, your property advisor for verified plot listings",
  "You're welcome! Let me know if you have any other questions",
  "Goodbye! Feel free to return anytime",
  "I apologize, but there are currently no matching plots in our active database inventory",
  "Maazrat, hamari active database inventory me aap ki specific criteria",
  "Here are top verified plot listings matching your criteria",
  "I can assist you with real estate intelligence across Islamabad & Rawalpindi! Try asking about specific CDA sectors",
  "NAQSHAI features 3D terrain elevation analysis"
];

async function runSingleTest(testCase, language = 'Auto') {
  const startTime = Date.now();
  const payload = {
    messages: [{ role: 'user', content: testCase.prompt }],
    language: language
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const elapsedMs = Date.now() - startTime;
    const contentType = response.headers.get('content-type') || '';

    let rawText = '';
    let parsedJson = null;

    if (contentType.includes('text/event-stream') || response.body) {
      rawText = await response.text();
    }

    try {
      parsedJson = JSON.parse(rawText);
    } catch (_) {
      // Streamed chunk concatenation or raw text
      const replyMatch = rawText.match(/"reply"\s*:\s*"([^"]+)"/);
      parsedJson = {
        reply: replyMatch ? replyMatch[1] : rawText,
        recommendedPlots: []
      };
    }

    const reply = parsedJson?.reply || '';
    const recommendedPlots = parsedJson?.recommendedPlots || [];
    const isFallback = !!parsedJson?.isFallback;

    // Detect if response matched any hardcoded canned snippet
    const matchedCanned = KNOWN_CANNED_SNIPPETS.find((snippet) =>
      reply.toLowerCase().includes(snippet.toLowerCase())
    );

    // Fast response (< 80ms) usually indicates a zero-delay regex interceptor (no LLM call)
    const isInstantInterceptor = elapsedMs < 120;

    let routingDiagnosis = 'GEMINI_DYNAMIC_LLM';
    if (matchedCanned && isInstantInterceptor) {
      routingDiagnosis = 'HARDCODED_FAST_INTERCEPTOR (lib/conversationHelper.js)';
    } else if (isFallback || (matchedCanned && isFallback)) {
      routingDiagnosis = 'HARDCODED_SERVER_FALLBACK (app/api/chat/route.js lines 800-906)';
    } else if (matchedCanned) {
      routingDiagnosis = 'CANNED_SYSTEM_TEMPLATE_INJECTION';
    }

    return {
      id: testCase.id,
      prompt: testCase.prompt,
      status: response.status,
      elapsedMs,
      reply,
      recommendedPlotsCount: recommendedPlots.length,
      isFallback,
      routingDiagnosis,
      matchedCannedSnippet: matchedCanned || null,
      interceptorRisk: testCase.interceptorRisk
    };
  } catch (err) {
    return {
      id: testCase.id,
      prompt: testCase.prompt,
      status: 0,
      elapsedMs: Date.now() - startTime,
      reply: '',
      recommendedPlotsCount: 0,
      isFallback: false,
      routingDiagnosis: `NETWORK_OR_SERVER_ERROR: ${err.message}`,
      matchedCannedSnippet: null,
      interceptorRisk: testCase.interceptorRisk
    };
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log(' NAQSHAI AI ADVISOR PIPELINE STRESS TEST & ROUTING AUDIT');
  console.log(` Target Endpoint: ${API_URL}`);
  console.log(` Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(80));

  const allResults = [];

  for (const suite of TEST_SUITES) {
    console.log(`\n\n--- ${suite.name} ---`);
    for (const tc of suite.cases) {
      process.stdout.write(`Testing [${tc.id}] "${tc.prompt}"... `);
      const result = await runSingleTest(tc);
      allResults.push({ ...result, suite: suite.name, category: suite.category });
      console.log(`[${result.status}] in ${result.elapsedMs}ms -> ${result.routingDiagnosis}`);
      console.log(`   Reply Preview: "${result.reply.slice(0, 120)}${result.reply.length > 120 ? '...' : ''}"`);
      if (result.matchedCannedSnippet) {
        console.log(`   ⚠️ Intercepted by Canned Snippet: "${result.matchedCannedSnippet.slice(0, 60)}..."`);
      }
      if (result.recommendedPlotsCount > 0) {
        console.log(`   Plots Returned: ${result.recommendedPlotsCount}`);
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(' AUDIT SUMMARY & VULNERABILITY MAP');
  console.log('='.repeat(80));

  const hardcodedCount = allResults.filter((r) =>
    r.routingDiagnosis.includes('HARDCODED') || r.routingDiagnosis.includes('CANNED')
  ).length;
  const geminiCount = allResults.filter((r) => r.routingDiagnosis === 'GEMINI_DYNAMIC_LLM').length;

  console.log(`Total Payloads Tested: ${allResults.length}`);
  console.log(`Responses from Hardcoded / Canned Interceptors: ${hardcodedCount}`);
  console.log(`Responses from Dynamic Gemini LLM: ${geminiCount}`);
  console.log('\nDetailed Breakdown:');
  console.table(
    allResults.map((r) => ({
      ID: r.id,
      Prompt: r.prompt,
      Latency: `${r.elapsedMs}ms`,
      Routing: r.routingDiagnosis.split(' ')[0],
      Canned: r.matchedCannedSnippet ? 'YES' : 'NO'
    }))
  );

  return allResults;
}

main().catch((err) => {
  console.error('Fatal error running test suite:', err);
  process.exit(1);
});
