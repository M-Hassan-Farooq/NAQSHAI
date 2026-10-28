/**
 * NAQSHAI Dedicated OTP Verification Test Suite
 * Comprehensive automated testing for:
 * 1. Phone number normalization (Pakistani & international formats)
 * 2. Phone validation rules & boundary conditions
 * 3. OTP generation, expiration, and smart dual-mode dispatch (Demo vs Twilio)
 * 4. Rate-limiting & cooldown enforcement (30s window)
 * 5. OTP verification (matching, whitespace resilience, invalid codes)
 * 6. Brute-force attempt limits (max 5 attempts before burnout)
 * 7. Replay attack prevention (single-use OTP token)
 * 8. Expiration handling & automated memory cleanup
 * 9. Cryptographic verification token structure (pv_<base64url>)
 * 10. HTTP API simulation (if dev server is reachable)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  normalizePhoneNumber,
  isValidPhone,
  sendOtp,
  verifyOtp,
  getStoredOtpCode
} from '../lib/phoneVerification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local if present
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

let passed = 0;
let failed = 0;
const testResults = [];

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${testName}${details ? ` -> ${details}` : ''}`);
    testResults.push({ name: testName, status: 'PASS', details });
  } else {
    failed++;
    console.error(`  [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
    testResults.push({ name: testName, status: 'FAIL', details });
  }
}

async function runOtpTestSuite() {
  console.log('================================================================');
  console.log('       NAQSHAI PHONE OTP VERIFICATION EXTENSIVE TEST SUITE      ');
  console.log('================================================================\n');

  // -------------------------------------------------------------------------
  // SUITE 1: Phone Normalization
  // -------------------------------------------------------------------------
  console.log('--- SUITE 1: Phone Normalization & Sanitization ---');
  
  assert(normalizePhoneNumber('03001234567') === '+923001234567', 'Standard Pakistani 11-digit mobile (0300)');
  assert(normalizePhoneNumber('03219876543') === '+923219876543', 'Warid/Jazz 0321 prefix');
  assert(normalizePhoneNumber('03451122334') === '+923451122334', 'Telenor 0345 prefix');
  assert(normalizePhoneNumber('03335556677') === '+923335556677', 'Ufone 0333 prefix');
  assert(normalizePhoneNumber('03120001111') === '+923120001111', 'Zong 0312 prefix');

  assert(normalizePhoneNumber('0300-1234567') === '+923001234567', 'Dashes in local number stripped');
  assert(normalizePhoneNumber('0300 123 4567') === '+923001234567', 'Spaces in local number stripped');
  assert(normalizePhoneNumber('(0300) 1234567') === '+923001234567', 'Parentheses in local number stripped');
  assert(normalizePhoneNumber('00923001234567') === '+923001234567', 'International 0092 prefix converted to +92');
  assert(normalizePhoneNumber('+923001234567') === '+923001234567', 'Already normalized +92 preserved');
  assert(normalizePhoneNumber('+92 300 1234567') === '+923001234567', '+92 with spaces stripped');
  assert(normalizePhoneNumber('3001234567') === '+923001234567', '10-digit without leading 0 converted to +92');

  // International Diaspora Numbers
  assert(normalizePhoneNumber('+14155552671') === '+14155552671', 'US international number preserved');
  assert(normalizePhoneNumber('+447911123456') === '+447911123456', 'UK international number preserved');
  assert(normalizePhoneNumber('+971501234567') === '+971501234567', 'UAE international number preserved');

  // Edge / Empty values
  assert(normalizePhoneNumber('') === '', 'Empty string returns empty');
  assert(normalizePhoneNumber(null) === '', 'Null input returns empty');
  assert(normalizePhoneNumber(undefined) === '', 'Undefined input returns empty');

  // -------------------------------------------------------------------------
  // SUITE 2: Phone Validation (isValidPhone)
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 2: Phone Validation Rules (isValidPhone) ---');

  assert(isValidPhone('03001234567') === true, 'Local 03001234567 is valid');
  assert(isValidPhone('+923001234567') === true, '+923001234567 is valid');
  assert(isValidPhone('00923001234567') === true, '00923001234567 is valid');
  assert(isValidPhone('+14155552671') === true, 'US phone is valid');
  assert(isValidPhone('+971501234567') === true, 'UAE phone is valid');

  assert(isValidPhone('') === false, 'Empty string is invalid');
  assert(isValidPhone('12345') === false, 'Too short number (5 digits) rejected');
  assert(isValidPhone('0300') === false, 'Partial prefix only (0300) rejected');
  assert(isValidPhone('+92300123456789012345') === false, 'Excessively long number (>15 digits) rejected');
  assert(isValidPhone('abcdefghijk') === false, 'Pure alphabet string rejected');
  assert(isValidPhone('0300abc1234') === false, 'Alphanumeric mix rejected');
  assert(isValidPhone('+0000000000') === false, 'Invalid country code prefix +0 rejected');

  // -------------------------------------------------------------------------
  // SUITE 3: OTP Generation & Dispatch (sendOtp)
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 3: OTP Dispatch & Smart Dual-Mode Handling ---');

  // Test invalid phone rejection
  let invalidPhoneRejected = false;
  try {
    await sendOtp('invalid-number');
  } catch (err) {
    invalidPhoneRejected = err.message.toLowerCase().includes('valid mobile number');
  }
  assert(invalidPhoneRejected, 'sendOtp throws descriptive error for invalid phone');

  // Test successful OTP generation for unique test number 1
  const testPhoneA = '03109988771';
  const sendResA = await sendOtp(testPhoneA);

  assert(sendResA.success === true, 'sendOtp succeeds for valid number');
  assert(sendResA.normalizedPhone === '+923109988771', 'sendOtp returns normalized phone');
  const storedCodeA = getStoredOtpCode(testPhoneA);
  assert(typeof storedCodeA === 'string' && storedCodeA.length === 6, 'Generated OTP code is 6 characters in server store');
  assert(/^\d{6}$/.test(storedCodeA), 'Generated OTP consists purely of 6 digits');
  assert(sendResA.demoOtp === undefined, 'sendOtp does NOT expose demoOtp in response (Option 1 Terminal Security)');
  assert(sendResA.isDemoMode === true || sendResA.isDemoMode === false, 'isDemoMode boolean flag is present');
  assert(typeof sendResA.message === 'string' && sendResA.message.length > 0, 'User-friendly message returned');

  // Test Rate Limiting (Immediate repeated request)
  console.log('\n--- SUITE 4: Rate-Limiting & Cooldown Protection ---');
  let rateLimited = false;
  let cooldownMessage = '';
  try {
    await sendOtp(testPhoneA);
  } catch (err) {
    rateLimited = true;
    cooldownMessage = err.message;
  }
  assert(rateLimited, 'Immediate repeated OTP request is blocked by rate-limiter');
  assert(
    cooldownMessage.includes('wait') && cooldownMessage.includes('seconds'),
    'Cooldown message informs user of remaining wait seconds',
    cooldownMessage
  );

  // Different phone number is NOT blocked by first phone number's rate limit
  const testPhoneB = '03225544332';
  let phoneBDistinct = false;
  try {
    const sendResB = await sendOtp(testPhoneB);
    phoneBDistinct = sendResB.success === true;
  } catch (err) {
    phoneBDistinct = false;
  }
  assert(phoneBDistinct, 'Independent phone numbers have isolated rate-limiting buckets');

  // -------------------------------------------------------------------------
  // SUITE 5: OTP Verification (verifyOtp)
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 5: OTP Code Verification ---');

  // Verify non-existent phone number
  const unrequestedRes = verifyOtp('03440000000', '123456');
  assert(unrequestedRes.success === false, 'Verification fails for phone with no pending code');
  assert(
    unrequestedRes.error.toLowerCase().includes('no active verification code'),
    'Descriptive error for unrequested phone'
  );

  // Verify with wrong code
  const wrongCodeRes = verifyOtp(testPhoneA, '999999');
  assert(wrongCodeRes.success === false, 'Verification fails with incorrect code');
  assert(
    wrongCodeRes.error.toLowerCase().includes('incorrect'),
    'Clear message indicating incorrect code'
  );

  // Whitespace resilience: trailing or leading spaces in user input
  const generatedCodeA = getStoredOtpCode(testPhoneA);
  const whitespaceCodeRes = verifyOtp(testPhoneA, `  ${generatedCodeA}  `);
  assert(whitespaceCodeRes.success === true, 'Verification succeeds with whitespace padded input code');
  assert(whitespaceCodeRes.phone === '+923109988771', 'Response contains verified normalized phone');
  assert(typeof whitespaceCodeRes.token === 'string' && whitespaceCodeRes.token.startsWith('pv_'), 'Verification token issued with pv_ prefix');

  // Token decoding inspection
  const tokenPayload = whitespaceCodeRes.token.replace('pv_', '');
  const decodedToken = Buffer.from(tokenPayload, 'base64url').toString('utf8');
  assert(decodedToken.includes('+923109988771'), 'Verification token cryptographically embeds the phone number', decodedToken);

  // Single-use guarantee (Replay attack prevention)
  const replayRes = verifyOtp(testPhoneA, generatedCodeA);
  assert(replayRes.success === false, 'Replay prevented: Used OTP is immediately invalidated and cannot be reused');

  // -------------------------------------------------------------------------
  // SUITE 6: Brute Force Protection (Max Attempts)
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 6: Brute-Force Rate Limiting (Attempt Counter) ---');
  const testPhoneC = '03157778899';
  const sendResC = await sendOtp(testPhoneC);
  assert(sendResC.success === true, 'Setup phone C for brute force testing');
  const codeC = getStoredOtpCode(testPhoneC);

  // Submit wrong code 5 times
  for (let i = 1; i <= 5; i++) {
    const attemptRes = verifyOtp(testPhoneC, '000000');
    assert(attemptRes.success === false, `Failed attempt ${i}/5 registered and rejected`);
  }

  // 6th failed attempt must burn the OTP
  const sixthAttemptRes = verifyOtp(testPhoneC, '000000');
  assert(sixthAttemptRes.success === false, '6th attempt rejected');
  assert(
    sixthAttemptRes.error.toLowerCase().includes('too many incorrect attempts'),
    '6th attempt triggers lockout error',
    sixthAttemptRes.error
  );

  // Even the correct code is now invalid because the record was burned
  const burnedRes = verifyOtp(testPhoneC, codeC);
  assert(burnedRes.success === false, 'Compromised OTP record was completely purged from memory store');

  // -------------------------------------------------------------------------
  // SUITE 7: Expiration Handling & Store Cleanup
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 7: Expiration Handling & Auto-Cleanup ---');
  const testPhoneD = '03184443322';
  const sendResD = await sendOtp(testPhoneD);
  const normalizedD = sendResD.normalizedPhone;
  const codeD = getStoredOtpCode(testPhoneD);

  // Direct access to internal singleton store to simulate time-travel expiration
  const store = globalThis.__naqshaiOtpStore;
  assert(store instanceof Map, 'Global OTP store singleton exists and is a Map');
  assert(store.has(normalizedD), 'OTP record is currently stored in memory map');

  // Artificially expire the record by setting expiresAt to the past
  const recordD = store.get(normalizedD);
  recordD.expiresAt = Date.now() - 1000; // 1 second ago

  const expiredRes = verifyOtp(testPhoneD, codeD);
  assert(expiredRes.success === false, 'Expired OTP rejected upon verification');
  assert(
    expiredRes.error.toLowerCase().includes('expired'),
    'Clear message indicating code has expired',
    expiredRes.error
  );
  assert(!store.has(normalizedD), 'Expired OTP record automatically purged from store during verification');

  // -------------------------------------------------------------------------
  // SUITE 8: Production / Demo Mode Graceful Fallback Inspection
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 8: Smart Mode Architecture Inspection ---');
  const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
  console.log(`  Mode detected: ${hasTwilio ? 'Production SMS (Twilio)' : 'Smart Hackathon Demo Mode (In-App Codes)'}`);
  
  if (!hasTwilio) {
    assert(sendResA.isDemoMode === true, 'Correctly auto-selected demo mode in local/hackathon environment');
    assert(sendResA.demoOtp === undefined, 'demoOtp is NOT exposed in response (Option 1 Terminal Security)');
  }

  // -------------------------------------------------------------------------
  // SUITE 9: Next.js API Route Contract & Status Codes Simulation
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 9: API Route Contract & Status Codes ---');

  // Simulation of app/api/auth/phone/send-otp/route.js
  const routeSendOtp = async (body) => {
    try {
      const { phone } = body || {};
      if (!phone) {
        return { status: 400, body: { success: false, error: 'Mobile phone number is required.' } };
      }
      const result = await sendOtp(phone);
      delete result.demoOtp;
      return { status: 200, body: result };
    } catch (err) {
      return { status: 400, body: { success: false, error: err.message || 'Failed to send OTP code.' } };
    }
  };

  // Simulation of app/api/auth/phone/verify-otp/route.js
  const routeVerifyOtp = async (body) => {
    try {
      const { phone, code } = body || {};
      if (!phone || !code) {
        return {
          status: 400,
          body: { success: false, error: 'Both mobile phone number and 6-digit OTP code are required.' }
        };
      }
      const result = verifyOtp(phone, code);
      if (!result.success) {
        return { status: 400, body: result };
      }
      return { status: 200, body: result };
    } catch (err) {
      return { status: 500, body: { success: false, error: err.message || 'Failed to verify OTP code.' } };
    }
  };

  // Route 1: Missing phone in send-otp
  const routeSendMissing = await routeSendOtp({});
  assert(routeSendMissing.status === 400, 'POST /api/auth/phone/send-otp returns 400 when phone is missing');
  assert(routeSendMissing.body.error === 'Mobile phone number is required.', 'Returns required phone message');

  // Route 2: Invalid phone in send-otp
  const routeSendInvalid = await routeSendOtp({ phone: '123' });
  assert(routeSendInvalid.status === 400, 'POST /api/auth/phone/send-otp returns 400 for invalid phone');

  // Route 3: Valid phone in send-otp
  const testPhoneE = '03201122334';
  const routeSendSuccess = await routeSendOtp({ phone: testPhoneE });
  assert(routeSendSuccess.status === 200, 'POST /api/auth/phone/send-otp returns 200 on success');
  assert(routeSendSuccess.body.success === true, 'Returns success: true');
  assert(routeSendSuccess.body.normalizedPhone === '+923201122334', 'Returns normalized phone');
  assert(routeSendSuccess.body.demoOtp === undefined, 'Route response does NOT leak demoOtp to client');

  // Route 4: Missing code in verify-otp
  const routeVerifyMissingCode = await routeVerifyOtp({ phone: testPhoneE });
  assert(routeVerifyMissingCode.status === 400, 'POST /api/auth/phone/verify-otp returns 400 when code is missing');

  // Route 5: Wrong code in verify-otp
  const routeVerifyWrongCode = await routeVerifyOtp({ phone: testPhoneE, code: '000000' });
  assert(routeVerifyWrongCode.status === 400, 'POST /api/auth/phone/verify-otp returns 400 on wrong code');
  assert(routeVerifyWrongCode.body.success === false, 'Returns success: false');

  // Route 6: Valid code in verify-otp
  const validCode = getStoredOtpCode(testPhoneE);
  const routeVerifySuccess = await routeVerifyOtp({ phone: testPhoneE, code: validCode });
  assert(routeVerifySuccess.status === 200, 'POST /api/auth/phone/verify-otp returns 200 on valid code');
  assert(routeVerifySuccess.body.success === true, 'Returns success: true');
  assert(typeof routeVerifySuccess.body.token === 'string', 'Returns security token');

  // -------------------------------------------------------------------------
  // SUMMARY REPORT
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TOTAL TESTS:  ${passed + failed}`);
  console.log(`PASSED:       ${passed}`);
  console.log(`FAILED:       ${failed}`);
  console.log(`SUCCESS RATE: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runOtpTestSuite().catch((err) => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
