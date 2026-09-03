/**
 * NAQSHAI Geospatial Neighborhood Amenity Calculation Engine
 * Evaluates coordinates (lat, lng) against regional amenity landmarks
 * across Islamabad & Rawalpindi to produce normalized accessibility scores (0-100).
 */

// Haversine spherical distance formula in kilometers
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Curated geospatial landmark registry for Islamabad and Rawalpindi
export const REGIONAL_AMENITIES = {
  education: [
    { name: 'NUST (National University of Sciences & Technology)', lat: 33.6425, lng: 72.993 },
    { name: 'FAST-NUCES Islamabad', lat: 33.6555, lng: 73.0157 },
    { name: 'COMSATS University Islamabad', lat: 33.6518, lng: 73.1566 },
    { name: 'Quaid-i-Azam University', lat: 33.7483, lng: 73.1365 },
    { name: 'Roots Millennium School (One World Campus)', lat: 33.7145, lng: 73.0315 },
    { name: 'Beaconhouse School System (Margalla Campus)', lat: 33.6933, lng: 73.024 },
    { name: 'Army Public School & College (Westridge)', lat: 33.5978, lng: 73.0298 },
    { name: 'Roots Millennium School (Capital Campus, G-11)', lat: 33.6678, lng: 72.9985 },
    { name: 'Froebel’s International School (F-7)', lat: 33.722, lng: 73.053 },
    { name: 'Bahria University Islamabad', lat: 33.7153, lng: 73.0289 },
    { name: 'Roots Millennium School (Rivertree Campus, Bahria Town)', lat: 33.535, lng: 73.109 }
  ],
  healthcare: [
    { name: 'Shifa International Hospital', lat: 33.6766, lng: 73.0784 },
    { name: 'PIMS Hospital (Pakistan Institute of Medical Sciences)', lat: 33.7042, lng: 73.054 },
    { name: 'Quaid-e-Azam International Hospital', lat: 33.6268, lng: 72.9754 },
    { name: 'Kulsum International Hospital (Blue Area)', lat: 33.7118, lng: 73.0588 },
    { name: 'Benazir Bhutto Hospital (Murree Road, Rawalpindi)', lat: 33.6205, lng: 73.0712 },
    { name: 'Holy Family Hospital (Satellite Town, Rawalpindi)', lat: 33.6335, lng: 73.0645 },
    { name: 'Fauji Foundation Hospital', lat: 33.5714, lng: 73.1328 },
    { name: 'Bahria International Hospital (Phase 8)', lat: 33.5187, lng: 73.0989 },
    { name: 'Ali Medical Centre (F-8 Markaz)', lat: 33.7102, lng: 73.038 },
    { name: 'Maroof International Hospital (F-10)', lat: 33.6917, lng: 73.0118 }
  ],
  commerce: [
    { name: 'The Centaurus Mall (Blue Area/F-8)', lat: 33.7077, lng: 73.0498 },
    { name: 'Giga Mall (DHA Phase 2 / GT Road)', lat: 33.5222, lng: 73.1558 },
    { name: 'Safa Gold Mall (F-7 Markaz)', lat: 33.7214, lng: 73.0558 },
    { name: 'F-6 Super Market', lat: 33.7289, lng: 73.0772 },
    { name: 'F-10 Markaz Commercial Hub', lat: 33.6934, lng: 73.0135 },
    { name: 'G-11 Markaz', lat: 33.6673, lng: 72.9995 },
    { name: 'Gulberg Greens Civic Center / D-Markaz', lat: 33.6063, lng: 73.1528 },
    { name: 'Bahria Town Civic Center (Phase 4)', lat: 33.5518, lng: 73.1092 },
    { name: 'Saddar Commercial District Rawalpindi', lat: 33.5935, lng: 73.0543 },
    { name: 'B-17 Multi Gardens Commercial Square', lat: 33.6828, lng: 72.8225 }
  ],
  transit: [
    { name: 'Islamabad Expressway (Zero Point Interchange)', lat: 33.6922, lng: 73.0645 },
    { name: 'Srinagar / Kashmir Highway (G-9 Interchange)', lat: 33.6784, lng: 73.0232 },
    { name: 'Metro Bus Station (Secretariat Terminal)', lat: 33.7383, lng: 73.0978 },
    { name: 'Metro Bus Station (Faizabad Interchange)', lat: 33.6635, lng: 73.0848 },
    { name: 'Metro Bus Station (Saddar Station Rawalpindi)', lat: 33.5985, lng: 73.0515 },
    { name: 'GT Road (Rawat Junction)', lat: 33.4998, lng: 73.1932 },
    { name: 'Islamabad International Airport Motorway Link (M-2)', lat: 33.5658, lng: 72.8465 },
    { name: 'IJP Principal Road (Double Road Junction)', lat: 33.6492, lng: 73.0673 },
    { name: 'Islamabad Expressway (Koral Interchange)', lat: 33.6083, lng: 73.1362 },
    { name: 'Rawalpindi Ring Road Junction', lat: 33.5358, lng: 73.0289 }
  ]
};

// Proximity scoring configuration
const PROXIMITY_CONFIG = {
  maxScoreRadiusKm: 1.5, // 100 points if within 1.5 km
  zeroScoreRadiusKm: 5.0, // 0 points if beyond 5.0 km
  weights: {
    healthcare: 0.30,
    education: 0.25,
    commerce: 0.25,
    transit: 0.20
  }
};

/**
 * Normalizes distance to score (0-100) using linear decay
 */
function distanceToScore(distKm) {
  if (distKm <= PROXIMITY_CONFIG.maxScoreRadiusKm) return 100;
  if (distKm >= PROXIMITY_CONFIG.zeroScoreRadiusKm) return 10; // baseline 10 for accessibility awareness
  const range = PROXIMITY_CONFIG.zeroScoreRadiusKm - PROXIMITY_CONFIG.maxScoreRadiusKm;
  const delta = distKm - PROXIMITY_CONFIG.maxScoreRadiusKm;
  const score = Math.round(100 - (delta / range) * 90);
  return Math.max(10, Math.min(100, score));
}

/**
 * Qualitative tiering for amenity score
 */
export function getAmenityRating(score) {
  if (score >= 85) return { label: 'Elite Proximity', color: 'emerald', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  if (score >= 70) return { label: 'High Accessibility', color: 'teal', badge: 'bg-teal-50 text-teal-800 border-teal-200' };
  if (score >= 50) return { label: 'Moderate Convenience', color: 'amber', badge: 'bg-amber-50 text-amber-800 border-amber-200' };
  return { label: 'Developing Zone', color: 'slate', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
}

/**
 * Calculates nearest amenities and normalized score for given coordinates
 */
export function calculateAmenityScores(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  const categories = {};
  let weightedSum = 0;

  for (const [catKey, items] of Object.entries(REGIONAL_AMENITIES)) {
    let nearest = null;
    let minDistance = Infinity;

    for (const item of items) {
      const dist = calculateHaversineDistance(lat, lng, item.lat, item.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = item;
      }
    }

    const roundedDist = Math.round(minDistance * 10) / 10;
    const score = distanceToScore(roundedDist);
    const weight = PROXIMITY_CONFIG.weights[catKey] || 0.25;
    weightedSum += score * weight;

    categories[catKey] = {
      score,
      distanceKm: roundedDist,
      nearestName: nearest ? nearest.name : 'Regional Hub',
      weightPercentage: Math.round(weight * 100)
    };
  }

  const overallScore = Math.round(weightedSum);
  const rating = getAmenityRating(overallScore);

  return {
    overallScore,
    rating,
    categories: {
      healthcare: categories.healthcare,
      education: categories.education,
      commerce: categories.commerce,
      transit: categories.transit
    },
    calculatedAt: new Date().toISOString()
  };
}
