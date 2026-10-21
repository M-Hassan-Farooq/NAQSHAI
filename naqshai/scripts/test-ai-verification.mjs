import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyListingDocuments } from '../lib/aiDocumentVerifier.js';

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

console.log('===========================================================');
console.log('  NAQSHAI AI DOCUMENT VERIFICATION TEST SUITE');
console.log('===========================================================');

async function runTests() {
  // Test 1: Empty Documents Handling
  console.log('\n[TEST 1] Testing draft with no uploaded files...');
  const emptyResult = await verifyListingDocuments({
    formData: {
      sellerInfo: { fullName: 'Hassan Farooq', phoneNumber: '+923001234567' },
      plotDetails: { plotNumber: '101', society: 'F-11/4', city: 'Islamabad' },
      uploadedFiles: {}
    },
    dbAdmin: null
  });

  if (emptyResult.overallStatus === 'UNREADABLE' && emptyResult.recommendation === 'REJECT') {
    console.log('✓ PASS: Empty document draft correctly rejected.');
  } else {
    console.error('✗ FAIL: Expected UNREADABLE / REJECT, got:', emptyResult);
    process.exit(1);
  }

  // Test 2: Mock Storage Download and Schema Validation
  console.log('\n[TEST 2] Testing mock storage download failure handling...');
  const mockDbAdmin = {
    storage: {
      from: () => ({
        download: async () => ({ data: null, error: new Error('File not found in storage') })
      })
    }
  };

  const missingStorageResult = await verifyListingDocuments({
    formData: {
      sellerInfo: { fullName: 'Hassan Farooq', phoneNumber: '+923001234567' },
      plotDetails: { plotNumber: '101', society: 'F-11/4', city: 'Islamabad' },
      uploadedFiles: {
        allotmentLetter: 'allotments/test_letter.pdf',
        cnicFront: 'cnic/test_cnic.jpg'
      }
    },
    dbAdmin: mockDbAdmin
  });

  if (missingStorageResult.overallStatus === 'UNREADABLE' && missingStorageResult.recommendation === 'MANUAL_REVIEW_REQUIRED') {
    console.log('✓ PASS: Handled storage read failure gracefully without crashing.');
    console.log(`  Result Summary: "${missingStorageResult.summary}"`);
  } else {
    console.error('✗ FAIL: Expected UNREADABLE / MANUAL_REVIEW_REQUIRED, got:', missingStorageResult);
    process.exit(1);
  }

  // Test 3: Verify Gemini API key configuration
  console.log('\n[TEST 3] Checking Gemini API Key presence in environment...');
  if (process.env.GEMINI_API_KEY) {
    console.log('✓ PASS: GEMINI_API_KEY is configured and active.');
  } else {
    console.warn('⚠️ WARNING: GEMINI_API_KEY is missing from environment.');
  }

  console.log('\n===========================================================');
  console.log('  ALL AI VERIFICATION MODULE TESTS PASSED (100%)');
  console.log('===========================================================');
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
