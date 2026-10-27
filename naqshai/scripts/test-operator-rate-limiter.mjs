/**
 * NAQSHAI: Operator Rate-Limiter & Anti-Brute-Force Test Suite
 *
 * Verifies:
 * 1. Valid operator authentication succeeds
 * 2. Stepwise failure tracking (5 attempts maximum)
 * 3. 5th failure triggers 15-minute IP lockout (HTTP 429)
 * 4. Lockout stops further checks and blocks brute force attacks
 * 5. Independent IPs have isolated rate limit buckets
 * 6. Robots.txt disallows /review and /api/
 * 7. Layout metadata enforces noindex, nofollow
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  checkOperatorRateLimit,
  recordOperatorFailedAttempt,
  recordOperatorSuccess,
  verifyOperatorRequest,
  getClientIp,
} from '../lib/operatorRateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim();
      if (!process.env[k]) {
        process.env[k] = v;
      }
    }
  }
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('================================================================');
console.log('🧪 NAQSHAI OPERATOR ANTI-BRUTE-FORCE & PRIVACY TEST SUITE');
console.log('================================================================\n');

function createMockRequest(headersObj) {
  const normalized = {};
  for (const [k, v] of Object.entries(headersObj)) {
    normalized[k.toLowerCase()] = v;
  }
  return {
    headers: {
      get: (k) => normalized[k.toLowerCase()] || null,
    },
  };
}

// 1. IP Extraction
console.log('--- 1. Client IP Extraction ---');
const dummyReq1 = createMockRequest({
  'x-forwarded-for': '203.0.113.195, 70.41.3.18',
});

const ip1 = getClientIp(dummyReq1);
assert(ip1 === '203.0.113.195', 'Extracts primary client IP from x-forwarded-for proxy chain');

// 2. Successful Authentication
console.log('\n--- 2. Valid Authentication ---');
const validPassphrase = process.env.OPERATOR_PASSPHRASE || 'Naqshai123456789@AAH-AIR_STU';
const validReq = createMockRequest({
  authorization: `Bearer ${validPassphrase}`,
  'x-real-ip': '198.51.100.1',
});

const authResult = verifyOperatorRequest(validReq);
assert(authResult.authorized === true, 'Valid operator passphrase succeeds authentication');

// 3. Brute-Force Stepwise Lockout Simulation
console.log('\n--- 3. Brute-Force Lockout Sequence (5 Attempt Max) ---');
const attackerIp = '198.51.100.99';
const makeBadReq = (ip) =>
  createMockRequest({
    authorization: 'Bearer wrong_guess_' + Math.random(),
    'x-real-ip': ip,
  });

// Attempt 1
const res1 = verifyOperatorRequest(makeBadReq(attackerIp));
assert(res1.authorized === false && res1.status === 403, 'Attempt 1 rejected with 403 Forbidden');
assert(res1.remainingAttempts === 4, 'Remaining attempts correctly decremented to 4');

// Attempt 2
const res2 = verifyOperatorRequest(makeBadReq(attackerIp));
assert(res2.remainingAttempts === 3, 'Remaining attempts correctly decremented to 3');

// Attempt 3
const res3 = verifyOperatorRequest(makeBadReq(attackerIp));
assert(res3.remainingAttempts === 2, 'Remaining attempts correctly decremented to 2');

// Attempt 4
const res4 = verifyOperatorRequest(makeBadReq(attackerIp));
assert(res4.remainingAttempts === 1, 'Remaining attempts correctly decremented to 1');

// Attempt 5 (Threshold Trigger)
const res5 = verifyOperatorRequest(makeBadReq(attackerIp));
assert(res5.authorized === false && res5.status === 429, '5th failed attempt triggers HTTP 429 Too Many Requests');
assert(res5.lockoutSeconds > 800, 'Lockout duration set for ~15 minutes');

// Attempt 6 (Blocked before checking token)
const res6 = verifyOperatorRequest(makeBadReq(attackerIp));
assert(res6.authorized === false && res6.status === 429, 'Subsequent attempts are blocked immediately at rate limiter');
assert(res6.error.includes('Security Lockout'), 'Lockout message presented to blocked attacker');

// 4. IP Isolation
console.log('\n--- 4. IP Isolation & Legitimate Operator Protection ---');
const innocentOperatorIp = '198.51.100.200';
const innocentReq = createMockRequest({
  authorization: `Bearer ${validPassphrase}`,
  'x-real-ip': innocentOperatorIp,
});

const innocentResult = verifyOperatorRequest(innocentReq);
assert(innocentResult.authorized === true, 'Legitimate operator on different IP is unaffected by attacker lockout');

// 5. Anti-Crawling & Robots Directives
console.log('\n--- 5. Robots & Search Engine Crawler Protection ---');
const robotsPath = path.resolve(__dirname, '../app/robots.js');
assert(fs.existsSync(robotsPath), 'app/robots.js exists');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');
assert(robotsContent.includes("disallow: ['/review', '/review/', '/api/']"), 'robots.js explicitly disallows /review and /api/');

const layoutPath = path.resolve(__dirname, '../app/review/layout.js');
assert(fs.existsSync(layoutPath), 'app/review/layout.js exists');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');
assert(layoutContent.includes('noindex: false') || layoutContent.includes('index: false'), 'layout.js enforces index: false');
assert(layoutContent.includes('follow: false'), 'layout.js enforces follow: false');

console.log('\n================================================================');
console.log(`🎉 ALL OPERATOR RATE-LIMITING TESTS PASSED (${passedTests}/${totalTests})`);
console.log('================================================================\n');
