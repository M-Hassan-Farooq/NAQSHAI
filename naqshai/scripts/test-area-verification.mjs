// Automated test suite for NAQSHAI Plot Area Calculation & Verification Engine
import { parseClaimedArea, calculatePolygonArea, verifyAreaMatch, SQFT_PER_MARLA } from '../lib/areaCalculator.js';

console.log('--- TEST 1: Parsing Claimed Plot Sizes ---');
const testCases = [
  { input: '5 Marla (25x50)', expectedSqFt: 1250 },
  { input: '10 Marla (35x70)', expectedSqFt: 2450 },
  { input: '1 Kanal (50x90)', expectedSqFt: 4500 },
  { input: '2 Kanal (75x120)', expectedSqFt: 9000 },
  { input: '3 Marla (20x34)', expectedSqFt: 680 },
  { input: '7 Marla (30x55)', expectedSqFt: 1650 },
  { input: 'Commercial 4 Marla (30x30)', expectedSqFt: 900 },
  { input: 'Commercial 2 Marla (20x25)', expectedSqFt: 500 },
  { input: 'Commercial 8 Marla (40x45)', expectedSqFt: 1800 },
  { input: 'Commercial 10 Marla (50x45)', expectedSqFt: 2250 },
  { input: '5 Marla', expectedSqFt: 5 * SQFT_PER_MARLA },
  { input: '1 Kanal', expectedSqFt: 20 * SQFT_PER_MARLA },
  { input: '1800 sq ft', expectedSqFt: 1800 },
];

let parseFailed = false;
for (const tc of testCases) {
  const res = parseClaimedArea(tc.input);
  const diff = Math.abs(res.sqFt - tc.expectedSqFt);
  if (diff < 1) {
    console.log(`✓ "${tc.input}" parsed to ${res.sqFt} sq ft (~${res.marla.toFixed(1)} Marla)`);
  } else {
    console.error(`✗ "${tc.input}" expected ${tc.expectedSqFt} sq ft, got ${res.sqFt}`);
    parseFailed = true;
  }
}

if (parseFailed) {
  process.exit(1);
}

console.log('\n--- TEST 2: Geodesic Surface Area of Known Geo Polygon ---');
// In Islamabad (lat ~33.71, lng ~73.06):
// 1 deg latitude ≈ 111,139 meters. 1 ft ≈ 0.3048 m.
// A 25ft by 50ft plot:
// Width (25 ft) = 7.62 m.
// At lat 33.71, 1 deg lon ≈ 111,139 * cos(33.71°) = 92,442 meters.
// dLon for 25 ft = 7.62 / 92,442 ≈ 0.00008243 deg.
// Length (50 ft) = 15.24 m.
// dLat for 50 ft = 15.24 / 111,139 ≈ 0.00013712 deg.
const baseLat = 33.710000;
const baseLng = 73.060000;
const dLat = 0.00013712;
const dLng = 0.00008243;

const mock5MarlaBox = [
  { lat: baseLat, lng: baseLng },
  { lat: baseLat, lng: baseLng + dLng },
  { lat: baseLat + dLat, lng: baseLng + dLng },
  { lat: baseLat + dLat, lng: baseLng },
];

const calculated5Marla = calculatePolygonArea(mock5MarlaBox);
console.log(`Calculated mock 5-Marla box area: ${Math.round(calculated5Marla.sqFt)} sq ft (${calculated5Marla.marla.toFixed(2)} Marla)`);
const areaRatioAgainst1250 = calculated5Marla.sqFt / 1250;
console.log(`Ratio to 1250 sq ft: ${(areaRatioAgainst1250 * 100).toFixed(1)}%`);

if (areaRatioAgainst1250 < 0.95 || areaRatioAgainst1250 > 1.05) {
  console.error('✗ Area calculation diverged from expected ~1250 sq ft by more than 5%!');
  process.exit(1);
}
console.log('✓ Geodesic spherical area formula matched expected geographic rectangle accurately.');

console.log('\n--- TEST 3: Area Verification Threshold (90% minimum rule) ---');

// Test 3A: Full 5 Marla plot verified
const checkFull = verifyAreaMatch(mock5MarlaBox, '5 Marla (25x50)', 0.90);
console.log(`Scenario A (Full 5 Marla): ${checkFull.isValid ? 'PASSED (Verified)' : 'FAILED'} - ${checkFull.percentage}% coverage`);
if (!checkFull.isValid || checkFull.status !== 'verified') {
  console.error('✗ Scenario A failed verification unexpectedly');
  process.exit(1);
}

// Test 3B: Drawn polygon covers only 70% of claimed area (e.g. drawn 35ft instead of 50ft)
const mockSmallBox = [
  { lat: baseLat, lng: baseLng },
  { lat: baseLat, lng: baseLng + dLng },
  { lat: baseLat + dLat * 0.70, lng: baseLng + dLng },
  { lat: baseLat + dLat * 0.70, lng: baseLng },
];
const checkSmall = verifyAreaMatch(mockSmallBox, '5 Marla (25x50)', 0.90);
console.log(`Scenario B (70% Under-drawn boundary): ${!checkSmall.isValid ? 'REJECTED AS EXPECTED' : 'FAILED TO REJECT'} - ${checkSmall.percentage}% coverage`);
if (checkSmall.isValid || checkSmall.status !== 'rejected') {
  console.error('✗ Scenario B should have been rejected for being below 90% threshold');
  process.exit(1);
}

// Test 3C: Drawn polygon covers 92% of claimed area (within tolerance)
const mock92PercentBox = [
  { lat: baseLat, lng: baseLng },
  { lat: baseLat, lng: baseLng + dLng },
  { lat: baseLat + dLat * 0.92, lng: baseLng + dLng },
  { lat: baseLat + dLat * 0.92, lng: baseLng },
];
const check92 = verifyAreaMatch(mock92PercentBox, '5 Marla (25x50)', 0.90);
console.log(`Scenario C (92% boundary within 10% flexibility): ${check92.isValid ? 'PASSED (Verified)' : 'FAILED'} - ${check92.percentage}% coverage`);
if (!check92.isValid || check92.status !== 'verified') {
  console.error('✗ Scenario C should pass under 90% flexibility threshold');
  process.exit(1);
}

// Test 3D: Drawn polygon covers 88% of claimed area (just below 90% threshold)
const mock88PercentBox = [
  { lat: baseLat, lng: baseLng },
  { lat: baseLat, lng: baseLng + dLng },
  { lat: baseLat + dLat * 0.88, lng: baseLng + dLng },
  { lat: baseLat + dLat * 0.88, lng: baseLng },
];
const check88 = verifyAreaMatch(mock88PercentBox, '5 Marla (25x50)', 0.90);
console.log(`Scenario D (88% boundary just below threshold): ${!check88.isValid ? 'REJECTED AS EXPECTED' : 'FAILED TO REJECT'} - ${check88.percentage}% coverage`);
if (check88.isValid || check88.status !== 'rejected') {
  console.error('✗ Scenario D should be rejected because 88% < 90%');
  process.exit(1);
}

console.log('\n--- ALL AREA VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
