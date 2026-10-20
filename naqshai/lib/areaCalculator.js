/**
 * NAQSHAI Plot Area Calculation & Verification Engine
 *
 * Computes geodesic real-world surface area for drawn polygons and
 * verifies mapped area against claimed plot size (e.g. 5 Marla, 10 Marla, 1 Kanal)
 * enforcing a minimum 90% threshold to prevent fraudulent or inaccurate boundaries.
 */

import { normalizePolygon } from './polygonOverlap.js';

// Standard Pakistani Real Estate Land Measure (Islamabad / Rawalpindi CDA/RDA standard)
export const SQFT_PER_MARLA = 225; // 225 sq ft per Marla (CDA standard: 25x50 = 1250 sq ft for 5 Marla)
export const MARLA_PER_KANAL = 20;  // 20 Marla = 1 Kanal (4500 sq ft)
export const SQFT_PER_SQMETER = 10.7639104;
export const MIN_AREA_MATCH_RATIO = 0.90; // At least 90% of claimed area required

/**
 * Parses claimed area string (e.g. "5 Marla (25x50)", "1 Kanal (50x90)") into numerical sq ft & sq meters.
 *
 * @param {string} sizeDimensions
 * @returns {{ sqFt: number, sqMeters: number, marla: number, label: string }}
 */
export function parseClaimedArea(sizeDimensions = '') {
  const str = String(sizeDimensions || '').trim();

  // 1. Check for explicit dimensions e.g. (25x50) or 35x70 or 50*90
  const dimMatch = str.match(/(\d+(?:\.\d+)?)\s*[xX*×]\s*(\d+(?:\.\d+)?)/);
  if (dimMatch) {
    const w = parseFloat(dimMatch[1]);
    const l = parseFloat(dimMatch[2]);
    if (w > 0 && l > 0) {
      const sqFt = w * l;
      const sqMeters = sqFt / SQFT_PER_SQMETER;
      const marla = sqFt / SQFT_PER_MARLA;
      return { sqFt, sqMeters, marla, label: str };
    }
  }

  // 2. Check for Kanal e.g. "1 Kanal", "2.5 Kanal"
  const kanalMatch = str.match(/(\d+(?:\.\d+)?)\s*kanal/i);
  if (kanalMatch) {
    const kanals = parseFloat(kanalMatch[1]);
    if (kanals > 0) {
      const sqFt = kanals * MARLA_PER_KANAL * SQFT_PER_MARLA;
      const sqMeters = sqFt / SQFT_PER_SQMETER;
      return { sqFt, sqMeters, marla: kanals * MARLA_PER_KANAL, label: str };
    }
  }

  // 3. Check for Marla e.g. "5 Marla", "10 Marla"
  const marlaMatch = str.match(/(\d+(?:\.\d+)?)\s*marla/i);
  if (marlaMatch) {
    const marlas = parseFloat(marlaMatch[1]);
    if (marlas > 0) {
      const sqFt = marlas * SQFT_PER_MARLA;
      const sqMeters = sqFt / SQFT_PER_SQMETER;
      return { sqFt, sqMeters, marla: marlas, label: str };
    }
  }

  // 4. Check for square yards / square feet
  const sqYdMatch = str.match(/(\d+(?:\.\d+)?)\s*sq(?:uare)?\s*(?:yd|yard)/i);
  if (sqYdMatch) {
    const sqYds = parseFloat(sqYdMatch[1]);
    const sqFt = sqYds * 9;
    return { sqFt, sqMeters: sqFt / SQFT_PER_SQMETER, marla: sqFt / SQFT_PER_MARLA, label: str };
  }

  const sqFtMatch = str.match(/(\d+(?:\.\d+)?)\s*sq(?:uare)?\s*f(?:ee)?t/i);
  if (sqFtMatch) {
    const sqFt = parseFloat(sqFtMatch[1]);
    return { sqFt, sqMeters: sqFt / SQFT_PER_SQMETER, marla: sqFt / SQFT_PER_MARLA, label: str };
  }

  // Default fallback: 10 Marla (35x70) = 2450 sq ft
  const defaultSqFt = 2450;
  return {
    sqFt: defaultSqFt,
    sqMeters: defaultSqFt / SQFT_PER_SQMETER,
    marla: defaultSqFt / SQFT_PER_MARLA,
    label: str || '10 Marla (35x70)',
  };
}

/**
 * Calculates geodesic real-world surface area of a polygon in square meters and square feet.
 * Uses the spherical excess formula for spherical Earth (R = 6378137m).
 *
 * @param {Array<{ lat: number, lng: number }>} polygonCoordinates
 * @returns {{ sqMeters: number, sqFt: number, marla: number, kanal: number }}
 */
export function calculatePolygonArea(polygonCoordinates) {
  const poly = normalizePolygon(polygonCoordinates);
  if (poly.length < 3) {
    return { sqMeters: 0, sqFt: 0, marla: 0, kanal: 0 };
  }

  const R = 6378137; // Earth's mean radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  let total = 0;
  const n = poly.length;

  for (let i = 0; i < n; i++) {
    const prev = poly[(i + n - 1) % n];
    const next = poly[(i + 1) % n];
    const curr = poly[i];
    total += (toRad(next.lng) - toRad(prev.lng)) * Math.sin(toRad(curr.lat));
  }

  const sqMeters = Math.abs((total * R * R) / 2);
  const sqFt = sqMeters * SQFT_PER_SQMETER;
  const marla = sqFt / SQFT_PER_MARLA;
  const kanal = marla / MARLA_PER_KANAL;

  return {
    sqMeters,
    sqFt,
    marla,
    kanal,
  };
}

/**
 * Verifies calculated polygon area against claimed plot size.
 * Enforces that calculated area must be >= 90% of claimed area.
 *
 * @param {Array<{ lat: number, lng: number }>} polygonCoordinates
 * @param {string} claimedSizeDimensions
 * @param {number} [minRatio=0.90]
 * @returns {object} Full verification breakdown
 */
export function verifyAreaMatch(polygonCoordinates, claimedSizeDimensions, minRatio = MIN_AREA_MATCH_RATIO) {
  const claimed = parseClaimedArea(claimedSizeDimensions);
  const calculated = calculatePolygonArea(polygonCoordinates);

  const ratio = claimed.sqFt > 0 ? calculated.sqFt / claimed.sqFt : 0;
  const percentage = Math.round(ratio * 100);
  const minRequiredPercentage = Math.round(minRatio * 100);
  const isValid = percentage >= minRequiredPercentage || ratio >= minRatio;

  const minRequiredSqFt = Math.round(claimed.sqFt * minRatio);

  let message = '';
  if (calculated.sqFt === 0) {
    message = 'Draw at least 3 points to calculate plot boundary area.';
  } else if (isValid) {
    message = `Area Verified: Mapped area covers ${percentage}% of claimed size (exceeds ${Math.round(minRatio * 100)}% minimum).`;
  } else {
    message = `Area Verification Failed: Mapped boundary covers only ${Math.round(calculated.sqFt)} sq ft (${percentage}%), which is below the mandatory ${Math.round(minRatio * 100)}% threshold (${minRequiredSqFt} sq ft).`;
  }

  return {
    isValid,
    ratio: Math.round(ratio * 1000) / 1000,
    percentage,
    minRequiredRatio: minRatio,
    minRequiredSqFt,
    claimed: {
      raw: claimedSizeDimensions,
      sqFt: Math.round(claimed.sqFt),
      sqMeters: Math.round(claimed.sqMeters),
      marla: Math.round(claimed.marla * 10) / 10,
    },
    calculated: {
      sqFt: Math.round(calculated.sqFt),
      sqMeters: Math.round(calculated.sqMeters),
      marla: Math.round(calculated.marla * 10) / 10,
    },
    status: isValid ? 'verified' : 'rejected',
    message,
  };
}
