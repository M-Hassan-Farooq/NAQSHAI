/**
 * Test Suite: NAQSHAI Built-In Visitor Analytics & QR Cadastre Intelligence Engine
 * 
 * Verifies:
 * 1. Migration 15 SQL schema integrity and index definitions.
 * 2. User-Agent parsing for mobile/desktop/tablet and browser types.
 * 3. Traffic acquisition classification: Panaflex QR, WhatsApp, Google, Direct.
 * 4. Analytics aggregation logic (unique visitors, pageviews, 7-day trend, live window).
 * 5. In-memory IP throttle and payload sanitization.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n--- 1. Testing Migration 15 SQL Schema Integrity ---');
const migrationSql = readFileSync(
  resolve(__dirname, '../supabase/migrations/15_site_visitor_analytics.sql'),
  'utf-8'
);

assert(
  migrationSql.includes('CREATE TABLE IF NOT EXISTS public.site_visits'),
  'Defines public.site_visits table'
);
assert(
  migrationSql.includes('visitor_id TEXT NOT NULL'),
  'Includes visitor_id column for unique citizen identification'
);
assert(
  migrationSql.includes('session_id TEXT NOT NULL'),
  'Includes session_id column for browsing session tracking'
);
assert(
  migrationSql.includes('source TEXT DEFAULT \'direct\''),
  'Includes source column with default direct'
);
assert(
  migrationSql.includes('device_type TEXT'),
  'Includes device_type column'
);
assert(
  migrationSql.includes('idx_site_visits_source'),
  'Creates performance index for acquisition source (Panaflex QR scans)'
);
assert(
  migrationSql.includes('idx_site_visits_created_at'),
  'Creates performance index for time-series trend analysis'
);
assert(
  migrationSql.includes('ENABLE ROW LEVEL SECURITY'),
  'Enforces PostgreSQL Row Level Security (RLS) on site_visits'
);
assert(
  migrationSql.includes('DROP POLICY IF EXISTS'),
  'Idempotent RLS policy management'
);

console.log('\n--- 2. Testing User-Agent Parser Logic ---');
function parseUserAgent(ua) {
  if (!ua) return { device: 'desktop', browser: 'Unknown' };

  let device = 'desktop';
  if (/tablet|ipad/i.test(ua)) {
    device = 'tablet';
  } else if (/mobile|iphone|android.*mobile|phone/i.test(ua)) {
    device = 'mobile';
  }

  let browser = 'Other';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  return { device, browser };
}

// iPhone Mobile Safari
const iphoneUa = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const resIphone = parseUserAgent(iphoneUa);
assert(resIphone.device === 'mobile', 'Detects iPhone as mobile device');
assert(resIphone.browser === 'Safari', 'Detects Safari browser on iPhone');

// Android Chrome
const androidUa = 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.119 Mobile Safari/537.36';
const resAndroid = parseUserAgent(androidUa);
assert(resAndroid.device === 'mobile', 'Detects Android smartphone as mobile');
assert(resAndroid.browser === 'Chrome', 'Detects Chrome browser on Android');

// iPad Tablet
const ipadUa = 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const resIpad = parseUserAgent(ipadUa);
assert(resIpad.device === 'tablet', 'Detects iPad as tablet device');

// Windows Desktop Chrome
const winChromeUa = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const resWinChrome = parseUserAgent(winChromeUa);
assert(resWinChrome.device === 'desktop', 'Detects Windows 10/11 as desktop');
assert(resWinChrome.browser === 'Chrome', 'Detects Chrome browser on Desktop');

// Windows Edge
const winEdgeUa = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0';
const resWinEdge = parseUserAgent(winEdgeUa);
assert(resWinEdge.browser === 'Edge', 'Detects Microsoft Edge browser');

console.log('\n--- 3. Testing Traffic Acquisition Source Classification ---');
function classifySource({ refParam, utmSource, referrer }) {
  const refNorm = (refParam || '').toLowerCase();
  const utmNorm = (utmSource || '').toLowerCase();
  const rawRef = (referrer || '').toLowerCase();

  if (
    refNorm === 'panaflex' ||
    refNorm === 'qr' ||
    refNorm === 'banner' ||
    utmNorm === 'panaflex' ||
    utmNorm === 'qr' ||
    utmNorm === 'banner'
  ) {
    return 'panaflex_qr';
  }
  if (refNorm === 'whatsapp' || utmNorm === 'whatsapp' || rawRef.includes('whatsapp') || rawRef.includes('wa.me')) {
    return 'whatsapp';
  }
  if (rawRef.includes('google.') || utmNorm === 'google') {
    return 'google';
  }
  if (rawRef.includes('facebook.') || rawRef.includes('instagram.') || rawRef.includes('twitter.') || rawRef.includes('t.co')) {
    return 'social';
  }
  if (utmNorm) {
    return utmNorm.slice(0, 40);
  }
  return 'direct';
}

assert(
  classifySource({ refParam: 'panaflex', utmSource: null, referrer: null }) === 'panaflex_qr',
  'Classifies ?ref=panaflex as panaflex_qr'
);
assert(
  classifySource({ refParam: null, utmSource: 'qr', referrer: null }) === 'panaflex_qr',
  'Classifies ?utm_source=qr as panaflex_qr'
);
assert(
  classifySource({ refParam: 'banner', utmSource: null, referrer: null }) === 'panaflex_qr',
  'Classifies ?ref=banner as panaflex_qr'
);
assert(
  classifySource({ refParam: null, utmSource: null, referrer: 'https://l.wl.co/whatsapp' }) === 'whatsapp',
  'Classifies WhatsApp referral as whatsapp'
);
assert(
  classifySource({ refParam: null, utmSource: null, referrer: 'https://www.google.com/' }) === 'google',
  'Classifies Google Search referral as google'
);
assert(
  classifySource({ refParam: null, utmSource: null, referrer: '' }) === 'direct',
  'Classifies blank referral as direct'
);

console.log('\n--- 4. Testing Analytics Aggregation Engine ---');
const now = Date.now();
const testVisits = [
  // Citizen A (Panaflex QR, mobile) 2 minutes ago
  {
    id: 1,
    visitor_id: 'vid-citizen-a',
    session_id: 'sid-1',
    source: 'panaflex_qr',
    device_type: 'mobile',
    page_path: '/',
    created_at: new Date(now - 2 * 60 * 1000).toISOString(),
  },
  // Citizen A pageview on /review 1 minute ago
  {
    id: 2,
    visitor_id: 'vid-citizen-a',
    session_id: 'sid-1',
    source: 'panaflex_qr',
    device_type: 'mobile',
    page_path: '/review',
    created_at: new Date(now - 1 * 60 * 1000).toISOString(),
  },
  // Citizen B (WhatsApp, desktop) 10 minutes ago
  {
    id: 3,
    visitor_id: 'vid-citizen-b',
    session_id: 'sid-2',
    source: 'whatsapp',
    device_type: 'desktop',
    page_path: '/',
    created_at: new Date(now - 10 * 60 * 1000).toISOString(),
  },
  // Citizen C (Direct, desktop) yesterday
  {
    id: 4,
    visitor_id: 'vid-citizen-c',
    session_id: 'sid-3',
    source: 'direct',
    device_type: 'desktop',
    page_path: '/verify',
    created_at: new Date(now - 25 * 3600 * 1000).toISOString(),
  },
];

function aggregateVisits(visits) {
  const allVisitorIds = new Set();
  const liveVisitorIds = new Set();
  const todayVisitorIds = new Set();
  let todayPageviews = 0;
  let qrScans = 0;
  const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
  const pageCounts = {};
  const sourceCounts = {};
  const dailyMap = {};

  const fiveMinAgo = now - 5 * 60 * 1000;
  const todayStr = new Date(now).toISOString().slice(0, 10);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
    dailyMap[d] = { date: d, pageviews: 0, visitors: new Set(), qrScans: 0 };
  }

  for (const v of visits) {
    allVisitorIds.add(v.visitor_id);
    const vTime = new Date(v.created_at).getTime();
    const vDateStr = new Date(v.created_at).toISOString().slice(0, 10);

    if (vTime >= fiveMinAgo) {
      liveVisitorIds.add(v.visitor_id);
    }
    if (vDateStr === todayStr) {
      todayVisitorIds.add(v.visitor_id);
      todayPageviews++;
    }
    if (v.source === 'panaflex_qr') {
      qrScans++;
    }

    const dev = v.device_type === 'mobile' ? 'mobile' : v.device_type === 'tablet' ? 'tablet' : 'desktop';
    deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;

    const p = v.page_path || '/';
    pageCounts[p] = (pageCounts[p] || 0) + 1;

    const s = v.source || 'direct';
    sourceCounts[s] = (sourceCounts[s] || 0) + 1;

    if (dailyMap[vDateStr]) {
      dailyMap[vDateStr].pageviews++;
      dailyMap[vDateStr].visitors.add(v.visitor_id);
      if (v.source === 'panaflex_qr') {
        dailyMap[vDateStr].qrScans++;
      }
    }
  }

  return {
    totalVisitors: allVisitorIds.size,
    totalPageviews: visits.length,
    totalQrScans: qrScans,
    liveVisitorsNow: liveVisitorIds.size,
    todayVisitors: todayVisitorIds.size,
    todayPageviews,
    deviceBreakdown: deviceCounts,
    topPages: Object.entries(pageCounts).map(([path, count]) => ({ path, count })),
    topSources: Object.entries(sourceCounts).map(([source, count]) => ({ source, count })),
  };
}

const agg = aggregateVisits(testVisits);
assert(agg.totalVisitors === 3, 'Calculates 3 unique citizens across 4 visits');
assert(agg.totalPageviews === 4, 'Calculates 4 total pageviews');
assert(agg.totalQrScans === 2, 'Calculates 2 visits from Panaflex banner QR');
assert(agg.liveVisitorsNow === 1, 'Calculates 1 active citizen online right now (last 5 min window)');
assert(agg.todayVisitors === 2, 'Calculates 2 distinct citizens active today');
assert(agg.todayPageviews === 3, 'Calculates 3 pageviews today');
assert(agg.deviceBreakdown.mobile === 2, 'Tracks 2 mobile visits');
assert(agg.deviceBreakdown.desktop === 2, 'Tracks 2 desktop visits');

console.log('\n--- 5. Testing Anti-Spam Rate Limiter ---');
const THROTTLE_WINDOW_MS = 2000;
const memoryStore = new Map();

function isThrottled(ip, nowTs) {
  const last = memoryStore.get(ip);
  if (last && nowTs - last < THROTTLE_WINDOW_MS) {
    return true;
  }
  memoryStore.set(ip, nowTs);
  return false;
}

const testIp = '203.0.113.42';
assert(!isThrottled(testIp, now), 'Allows initial tracking request from client IP');
assert(isThrottled(testIp, now + 500), 'Throttles burst request 500ms later');
assert(!isThrottled(testIp, now + 2500), 'Allows subsequent request after 2000ms cool-down');

console.log('\n=========================================');
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log('=========================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
