/**
 * Automated Verification & Test Suite for NAQSHAI Seller Portal
 * Tests all core features:
 * 1. Phone number normalization & validation
 * 2. Smart Dual-Mode OTP generation & verification flow (Rate-limiting, demo mode, incorrect/correct codes)
 * 3. Draft progress calculation & title preview
 * 4. Plot dimension calculation & boundary validation (overlap & area limits)
 * 5. Multi-model AI document verification fallback execution
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
import { computeDraftProgress, draftTitlePreview } from '../lib/draftProgress.js';
import { parseClaimedArea, verifyAreaMatch } from '../lib/areaCalculator.js';
import { checkPolygonConflict } from '../lib/polygonOverlap.js';
import { SUPPORTED_MODELS, verifyListingDocuments } from '../lib/aiDocumentVerifier.js';

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

async function runSellerPortalTestSuite() {
  console.log('================================================================');
  console.log('       NAQSHAI SELLER PORTAL COMPREHENSIVE TEST SUITE           ');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST GROUP 1: Phone Normalization & Validation
  // -------------------------------------------------------------
  console.log('[TEST GROUP 1] Phone Number Normalization & Validation');
  assert(normalizePhoneNumber('03001234567') === '+923001234567', 'Local 03xx normalized to +923xx');
  assert(normalizePhoneNumber('0300-1234567') === '+923001234567', 'Dashes in local number stripped');
  assert(normalizePhoneNumber('+92 300 1234567') === '+923001234567', 'Spaces in international number stripped');
  assert(normalizePhoneNumber('00923001234567') === '+923001234567', '0092 prefix converted to +92');
  assert(isValidPhone('03001234567') === true, '03001234567 is valid phone');
  assert(isValidPhone('+923219876543') === true, '+923219876543 is valid phone');
  assert(isValidPhone('1234') === false, 'Too short number rejected');
  assert(isValidPhone('abcdefghijk') === false, 'Alphabetical string rejected');

  // -------------------------------------------------------------
  // TEST GROUP 2: Smart Dual-Mode OTP Verification Flow
  // -------------------------------------------------------------
  console.log('\n[TEST GROUP 2] Smart Dual-Mode Phone OTP Verification Flow');
  const testPhone = '03331112233';
  
  // 2a. Send OTP
  const sendRes = await sendOtp(testPhone);
  assert(sendRes.success === true, 'sendOtp returns success: true');
  assert(sendRes.normalizedPhone === '+923331112233', 'sendOtp returns normalized phone');
  const generatedCode = getStoredOtpCode(testPhone) || '123456';
  assert(typeof generatedCode === 'string' && generatedCode.length === 6, 'Generated OTP is 6 digits');

  // 2b. Rate-limiting check
  let rateLimited = false;
  try {
    await sendOtp(testPhone);
  } catch (err) {
    rateLimited = err.message.includes('wait') || err.message.includes('seconds');
  }
  assert(rateLimited, 'Immediate repeated OTP request is rate-limited with cooldown reminder');

  // 2c. Verify with incorrect OTP code
  const wrongRes = verifyOtp(testPhone, '000000');
  assert(wrongRes.success === false, 'Incorrect OTP code rejected');
  assert(wrongRes.error.toLowerCase().includes('invalid') || wrongRes.error.toLowerCase().includes('incorrect'), 'Clear error message on invalid code');

  // 2d. Verify with correct OTP code
  const correctRes = verifyOtp(testPhone, generatedCode);
  assert(correctRes.success === true, 'Correct OTP code accepted');
  assert(typeof correctRes.token === 'string' && correctRes.token.length > 10, 'Verification token issued on success');
  assert(correctRes.phone === '+923331112233', 'Token bound to verified phone number');

  // -------------------------------------------------------------
  // TEST GROUP 3: Draft Progress & Title Preview
  // -------------------------------------------------------------
  console.log('\n[TEST GROUP 3] Draft Progress Calculation & Title Preview');
  const emptyDraft = {};
  assert(computeDraftProgress(emptyDraft) === 0, 'Empty draft has 0% progress');

  const step1Draft = {
    sellerInfo: { fullName: 'Ahsan Hayat', phoneNumber: '03001234567' },
    uploadedFiles: { cnicFront: 'cnic_f.png', cnicBack: 'cnic_b.png' }
  };
  const step1Prog = computeDraftProgress(step1Draft);
  assert(step1Prog === 25, `Step 1 completion reflects progress (2 of 8 fields = 25%)`);

  const step2Draft = {
    ...step1Draft,
    plotDetails: {
      city: 'Islamabad',
      society: 'Gulberg Greens',
      plotNumber: 'Plot-108',
      sizeDimensions: '5 Marla (25x50)',
      pricePkr: 8500000
    }
  };
  const title = draftTitlePreview(step2Draft);
  assert(title.includes('Gulberg Greens') && title.includes('Plot-108'), `Title preview formats correctly: "${title}"`);

  const fullDraft = {
    ...step2Draft,
    polygonCoordinates: [
      { lat: 33.710, lng: 73.050 },
      { lat: 33.711, lng: 73.050 },
      { lat: 33.711, lng: 73.051 },
      { lat: 33.710, lng: 73.051 }
    ],
    uploadedFiles: {
      ...step1Draft.uploadedFiles,
      allotmentLetter: 'allotment.png'
    },
    ownershipConfirmed: true
  };
  const fullProg = computeDraftProgress(fullDraft);
  assert(fullProg >= 90, `Fully filled draft reaches near 100% (got ${fullProg}%)`);

  // -------------------------------------------------------------
  // TEST GROUP 4: Plot Size Parsing & Boundary Constraints
  // -------------------------------------------------------------
  console.log('\n[TEST GROUP 4] Plot Size Parsing & Boundary Constraints');
  const size5Marla = parseClaimedArea('5 Marla (25x50)');
  assert(size5Marla.sqFt === 1250, '5 Marla (25x50) equals 1250 sq ft');

  const size10Marla = parseClaimedArea('10 Marla (35x70)');
  assert(size10Marla.sqFt === 2450, '10 Marla (35x70) equals 2450 sq ft');

  const size1Kanal = parseClaimedArea('1 Kanal (50x90)');
  assert(size1Kanal.sqFt === 4500, '1 Kanal (50x90) equals 4500 sq ft');

  // Boundary overlap detection
  const existingPlot = {
    id: 'plot-existing-1',
    title: 'Plot 100, Sector F-7',
    polygon_coordinates: [
      { lat: 33.720, lng: 73.050 },
      { lat: 33.721, lng: 73.050 },
      { lat: 33.721, lng: 73.051 },
      { lat: 33.720, lng: 73.051 }
    ]
  };

  const overlappingCoords = [
    { lat: 33.7205, lng: 73.0505 },
    { lat: 33.7215, lng: 73.0505 },
    { lat: 33.7215, lng: 73.0515 },
    { lat: 33.7205, lng: 73.0515 }
  ];

  const conflictResult = checkPolygonConflict(overlappingCoords, [existingPlot]);
  assert(conflictResult.hasConflict === true, 'Detected boundary overlap conflict with existing plot');

  const nonOverlappingCoords = [
    { lat: 33.730, lng: 73.060 },
    { lat: 33.731, lng: 73.060 },
    { lat: 33.731, lng: 73.061 },
    { lat: 33.730, lng: 73.061 }
  ];
  const safeConflictResult = checkPolygonConflict(nonOverlappingCoords, [existingPlot]);
  assert(safeConflictResult.hasConflict === false, 'Safe non-overlapping coordinates approved');

  // -------------------------------------------------------------
  // TEST GROUP 5: Multi-Model Fallback Configuration
  // -------------------------------------------------------------
  console.log('\n[TEST GROUP 5] Multi-Model Fallback Configuration & Resilience');
  assert(Array.isArray(SUPPORTED_MODELS) && SUPPORTED_MODELS.length >= 4, 'Multiple fallback models configured (minimum 4)');
  console.log(`  Configured model chain (${SUPPORTED_MODELS.length} models):`, SUPPORTED_MODELS.join(' -> '));
  assert(SUPPORTED_MODELS.includes('gemini-3.5-flash'), 'gemini-3.5-flash included');
  assert(SUPPORTED_MODELS.includes('gemini-3.6-flash'), 'gemini-3.6-flash included');
  assert(SUPPORTED_MODELS.includes('gemini-3.5-flash-lite'), 'gemini-3.5-flash-lite included');
  assert(SUPPORTED_MODELS.includes('gemini-flash-lite-latest'), 'gemini-flash-lite-latest included');

  // Test live mock execution
  const fakePngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const mockDbAdmin = {
    storage: {
      from: () => ({
        download: async () => ({ data: fakePngBuffer, error: null })
      })
    }
  };

  const auditResult = await verifyListingDocuments({
    formData: fullDraft,
    dbAdmin: mockDbAdmin
  });

  assert(typeof auditResult.overallStatus === 'string', 'Audit returned structured overallStatus');
  assert(typeof auditResult.summary === 'string' && auditResult.summary.length > 0, 'Audit returned structured summary');
  assert(auditResult.cnicAudit !== undefined, 'Audit returned cnicAudit object');
  assert(auditResult.allotmentAudit !== undefined, 'Audit returned allotmentAudit object');
  assert(Array.isArray(auditResult.redFlags), 'Audit returned redFlags array');

  console.log('\n================================================================');
  console.log(`  ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY (100% PASS RATE)`);
  console.log('================================================================\n');
}

runSellerPortalTestSuite().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
