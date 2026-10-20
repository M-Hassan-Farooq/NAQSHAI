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
    { name: 'NUST (National University of Sciences & Technology, H-12)', lat: 33.6425, lng: 72.993 },
    { name: 'FAST-NUCES Islamabad (H-11)', lat: 33.6555, lng: 73.0157 },
    { name: 'COMSATS University Islamabad (Park Road)', lat: 33.6518, lng: 73.1566 },
    { name: 'Quaid-i-Azam University (Secretariat/Diplomatic Enclave)', lat: 33.7483, lng: 73.1365 },
    { name: 'Air University (PAF Complex, E-9)', lat: 33.7175, lng: 73.0242 },
    { name: 'Bahria University Islamabad (E-8)', lat: 33.7153, lng: 73.0289 },
    { name: 'International Islamic University (IIUI, H-10)', lat: 33.6591, lng: 73.024 },
    { name: 'National University of Modern Languages (NUML, H-9)', lat: 33.6644, lng: 73.0515 },
    { name: 'National Defence University (NDU, E-9)', lat: 33.725, lng: 73.032 },
    { name: 'PIEAS University (Nilore, Islamabad)', lat: 33.654, lng: 73.258 },
    { name: 'Roots Millennium School (One World Campus, I-9)', lat: 33.7145, lng: 73.0315 },
    { name: 'Roots Millennium School (Capital Campus, G-11)', lat: 33.6678, lng: 72.9985 },
    { name: 'Roots Millennium School (Oxbridge Campus, F-8/4)', lat: 33.712, lng: 73.035 },
    { name: 'Roots Millennium School (Hill View Campus, D-12)', lat: 33.708, lng: 72.964 },
    { name: 'Beaconhouse School System (Margalla Campus, H-8)', lat: 33.6933, lng: 73.024 },
    { name: 'Beaconhouse School System (Potohar Campus, DHA Phase 2)', lat: 33.528, lng: 73.161 },
    { name: 'Beaconhouse Educational Complex (Rawalpindi Cantt)', lat: 33.585, lng: 73.062 },
    { name: 'The City School (Capital Campus, H-8)', lat: 33.682, lng: 73.065 },
    { name: 'The City School (Rawalpindi Campus, Satellite Town)', lat: 33.636, lng: 73.068 },
    { name: 'Froebel’s International School (F-7)', lat: 33.722, lng: 73.053 },
    { name: 'Froebel’s International School (Rawalpindi Cantt)', lat: 33.589, lng: 73.066 },
    { name: 'Super Nova School (F-8/1)', lat: 33.7125, lng: 73.045 },
    { name: 'Head Start School (Kuri Road Campus, Chak Shahzad)', lat: 33.669, lng: 73.138 },
    { name: 'Roots Millennium School (Rivertree Campus, Bahria Town)', lat: 33.535, lng: 73.109 },
    { name: 'Roots Ivy International University (Riverview, Chaklala Scheme 3)', lat: 33.578, lng: 73.091 },
    { name: 'Foundation University Islamabad (DHA Phase 1)', lat: 33.546, lng: 73.125 },
    { name: 'Army Public School & College (Westridge, Rawalpindi)', lat: 33.5978, lng: 73.0298 },
    { name: 'Army Public School & College (Fort Road, Rawalpindi Cantt)', lat: 33.588, lng: 73.0485 },
    { name: 'Army Public School & College (Hamza Camp, Rawalpindi)', lat: 33.642, lng: 73.081 },
    { name: 'Rawalpindi Medical University (Tipu Road)', lat: 33.6167, lng: 73.0722 },
    { name: 'Army Medical College (AMC, Abid Majeed Road, Rawalpindi)', lat: 33.5855, lng: 73.056 },
    { name: 'Riphah International University (I-14 Campus)', lat: 33.617, lng: 72.915 },
    { name: 'Riphah International University (Al-Mizan Campus, Rawalpindi)', lat: 33.596, lng: 73.039 },
    { name: 'Pir Mehr Ali Shah Arid Agriculture University (Murree Road)', lat: 33.649, lng: 73.078 },
    { name: 'Fatima Jinnah Women University (The Mall, Rawalpindi)', lat: 33.598, lng: 73.043 },
    { name: 'Institute of Space Technology (IST, Islamabad Expressway)', lat: 33.523, lng: 73.178 },
    { name: 'Cadet College / B-17 Sector Campus (Multi Gardens)', lat: 33.691, lng: 72.825 },
    { name: 'The Educators (G-13 Sector Campus)', lat: 33.654, lng: 72.969 },
    { name: 'Scholars Science College (The Mall / Saddar Rawalpindi)', lat: 33.592, lng: 73.051 },
    { name: 'OPF Boys College (H-8/4 Islamabad)', lat: 33.679, lng: 73.069 },
    { name: 'Islamabad Model College for Boys (F-8/4)', lat: 33.716, lng: 73.041 },
    { name: 'Islamabad Model College for Girls (F-7/2)', lat: 33.725, lng: 73.058 },
    { name: 'Dr. A.Q. Khan School & College (Bahria Town Phase 8)', lat: 33.504, lng: 73.095 },
    { name: 'Saint Mary’s Academy (Lalazar, Rawalpindi)', lat: 33.578, lng: 73.069 },
    { name: 'Pak-Turk Maarif International School (Chaklala Scheme 3)', lat: 33.583, lng: 73.085 }
  ],
  healthcare: [
    { name: 'Shifa International Hospital (H-8/4)', lat: 33.6766, lng: 73.0784 },
    { name: 'PIMS Hospital (Pakistan Institute of Medical Sciences, G-8)', lat: 33.7042, lng: 73.054 },
    { name: 'Federal Government Polyclinic Hospital (G-6, Islamabad)', lat: 33.7215, lng: 73.0792 },
    { name: 'Kulsum International Hospital (Blue Area)', lat: 33.7118, lng: 73.0588 },
    { name: 'Ali Medical Centre (F-8 Markaz)', lat: 33.7102, lng: 73.038 },
    { name: 'Maroof International Hospital (F-10)', lat: 33.6917, lng: 73.0118 },
    { name: 'Medicsi Hospital (F-10/4 Islamabad)', lat: 33.698, lng: 73.004 },
    { name: 'PAF Hospital (Margalla Road, E-9)', lat: 33.7225, lng: 73.0238 },
    { name: 'KRL Hospital (G-9/1 Islamabad)', lat: 33.6845, lng: 73.0312 },
    { name: 'NESCOM Hospital (H-11 Islamabad)', lat: 33.648, lng: 72.998 },
    { name: 'Quaid-e-Azam International Hospital (Peshawar Road)', lat: 33.6268, lng: 72.9754 },
    { name: 'CMH Rawalpindi (Combined Military Hospital, Cantt)', lat: 33.5828, lng: 73.0515 },
    { name: 'Military Hospital (MH Rawalpindi, The Mall)', lat: 33.593, lng: 73.049 },
    { name: 'Benazir Bhutto Hospital (Murree Road, Rawalpindi)', lat: 33.6205, lng: 73.0712 },
    { name: 'Holy Family Hospital (Satellite Town, Rawalpindi)', lat: 33.6335, lng: 73.0645 },
    { name: 'Rawalpindi Institute of Cardiology (RIC, Rawal Road)', lat: 33.6235, lng: 73.0832 },
    { name: 'Rawalpindi Institute of Urology & Transplantation (RIUT)', lat: 33.645, lng: 73.076 },
    { name: 'Fauji Foundation Hospital (Jhelum Road, Rawalpindi)', lat: 33.5714, lng: 73.1328 },
    { name: 'Al-Shifa Trust Eye Hospital (Jhelum Road, Rawalpindi)', lat: 33.5685, lng: 73.0825 },
    { name: 'Armed Forces Institute of Cardiology (AFIC / NIHD)', lat: 33.589, lng: 73.053 },
    { name: 'Armed Forces Institute of Pathology (AFIP, Cantt)', lat: 33.584, lng: 73.054 },
    { name: 'Cantonment General Hospital (Hospital Road, Rawalpindi)', lat: 33.599, lng: 73.045 },
    { name: 'Hearts International Hospital (The Mall, Rawalpindi)', lat: 33.591, lng: 73.055 },
    { name: 'Bahria International Hospital (Phase 8, Bahria Town)', lat: 33.5187, lng: 73.0989 },
    { name: 'Bahria Town Hospital (Safari Villas, Phase 3)', lat: 33.548, lng: 73.102 },
    { name: 'Begum Akhtar Rukhsana Memorial Hospital (Phase 8)', lat: 33.509, lng: 73.092 },
    { name: 'DHA Medical Centre (DHA Phase 2)', lat: 33.526, lng: 73.1585 },
    { name: 'DHA Phase 1 Medical Clinic & Care Hospital', lat: 33.544, lng: 73.122 },
    { name: 'Gulberg Greens Medical Complex / Riphah Healthcare', lat: 33.611, lng: 73.149 },
    { name: 'Islamabad Medical & Dental Hospital (Murree Road, Barakahu)', lat: 33.742, lng: 73.181 },
    { name: 'Akbar Niazi Teaching Hospital (IMDC Main Campus)', lat: 33.765, lng: 73.208 },
    { name: 'National Institute of Health (NIH, Chak Shahzad)', lat: 33.678, lng: 73.129 },
    { name: 'NORI Cancer Hospital (G-8/3 Islamabad)', lat: 33.702, lng: 73.051 },
    { name: 'CDA Hospital (G-6/2, Islamabad)', lat: 33.726, lng: 73.071 },
    { name: 'Bilal Hospital (Satellite Town, Sadiqabad Rawalpindi)', lat: 33.631, lng: 73.081 },
    { name: 'Attock Hospital (Attock Refinery / Morgah)', lat: 33.551, lng: 73.072 },
    { name: 'Rawal General & Dental Hospital (Lehtrar Road)', lat: 33.639, lng: 73.145 },
    { name: 'Al-Khidmat Hospital (E-11 / Golra)', lat: 33.694, lng: 72.977 },
    { name: 'Medicare Hospital (Saidpur Road / Commercial Market)', lat: 33.637, lng: 73.067 },
    { name: 'Life Care Hospital (G-10 Markaz)', lat: 33.678, lng: 73.011 },
    { name: 'Naval Anchorage Medical Centre', lat: 33.565, lng: 73.172 },
    { name: 'PWD Medical & Diagnostic Complex', lat: 33.582, lng: 73.144 },
    { name: 'TopCity-1 Healthcare Center Link', lat: 33.571, lng: 72.884 },
    { name: 'B-17 Multi Gardens Medical Care Clinic (Block B)', lat: 33.685, lng: 72.828 },
    { name: 'THQ Hospital Taxila Link (Zone 2 Border)', lat: 33.738, lng: 72.809 }
  ],
  commerce: [
    { name: 'The Centaurus Mall (Blue Area/F-8)', lat: 33.7077, lng: 73.0498 },
    { name: 'Safa Gold Mall (F-7 Markaz)', lat: 33.7214, lng: 73.0558 },
    { name: 'Beverly Centre & Blue Area Commercial Spine', lat: 33.717, lng: 73.064 },
    { name: 'F-6 Super Market & Kohsar Market', lat: 33.7289, lng: 73.0772 },
    { name: 'F-7 Jinnah Super Market', lat: 33.723, lng: 73.054 },
    { name: 'F-8 Markaz (Ayub Market)', lat: 33.7115, lng: 73.039 },
    { name: 'F-10 Markaz Commercial Hub', lat: 33.6934, lng: 73.0135 },
    { name: 'F-11 Markaz', lat: 33.6835, lng: 72.985 },
    { name: 'D-12 Markaz Commercial Square', lat: 33.704, lng: 72.968 },
    { name: 'E-11 Markaz (MPCHS / Fortune Arcade)', lat: 33.699, lng: 72.973 },
    { name: 'G-8 Markaz (Sitara Market)', lat: 33.698, lng: 73.041 },
    { name: 'G-9 Markaz (Karachi Company)', lat: 33.6885, lng: 73.0335 },
    { name: 'G-10 Markaz', lat: 33.678, lng: 73.012 },
    { name: 'G-11 Markaz', lat: 33.6673, lng: 72.9995 },
    { name: 'G-13 Markaz', lat: 33.652, lng: 72.966 },
    { name: 'G-14 Commercial Sub-Center', lat: 33.645, lng: 72.951 },
    { name: 'G-15 Markaz (JKCHS Commercial Market)', lat: 33.639, lng: 72.937 },
    { name: 'I-8 Markaz', lat: 33.6685, lng: 73.076 },
    { name: 'I-10 Markaz', lat: 33.648, lng: 73.042 },
    { name: 'Melody Market & Food Street (G-6 Markaz)', lat: 33.714, lng: 73.074 },
    { name: 'Fruit & Vegetable Wholesale Mandi (I-11)', lat: 33.652, lng: 73.018 },
    { name: 'Gulberg Greens Civic Center / D-Markaz', lat: 33.6063, lng: 73.1528 },
    { name: 'Gulberg Business Park (Main Boulevard)', lat: 33.618, lng: 73.141 },
    { name: 'B-17 Multi Gardens Commercial Square', lat: 33.6828, lng: 72.8225 },
    { name: 'Top City-1 Commercial Boulevard', lat: 33.562, lng: 72.871 },
    { name: 'Mumtaz City Commercial Hub', lat: 33.572, lng: 72.888 },
    { name: 'Bahria Enclave Commercial Broadway', lat: 33.682, lng: 73.235 },
    { name: 'Park View City Downtown Commercial', lat: 33.689, lng: 73.179 },
    { name: 'Giga Mall (DHA Phase 2 / GT Road)', lat: 33.5222, lng: 73.1558 },
    { name: 'Amazon Mall & Hyperstar (GT Road / DHA 2 Gateway)', lat: 33.5355, lng: 73.142 },
    { name: 'DHA Phase 2 Central Park Commercial', lat: 33.529, lng: 73.159 },
    { name: 'DHA Phase 1 Central Commercial Avenue', lat: 33.541, lng: 73.118 },
    { name: 'Bahria Town Civic Center (Phase 4)', lat: 33.5518, lng: 73.1092 },
    { name: 'Bahria Town River View Commercial (Phase 7)', lat: 33.532, lng: 73.118 },
    { name: 'Bahria Town Business District (Phase 8)', lat: 33.511, lng: 73.094 },
    { name: 'Saddar Commercial District Rawalpindi (Bank Rd / The Mall)', lat: 33.5935, lng: 73.0543 },
    { name: 'Commercial Market (Satellite Town, Rawalpindi)', lat: 33.639, lng: 73.071 },
    { name: 'Raja Bazaar (Rawalpindi Historic Hub)', lat: 33.6065, lng: 73.056 },
    { name: 'Chaklala Scheme 3 Commercial Market', lat: 33.582, lng: 73.088 },
    { name: 'PWD Main Double Road Commercial Corridor', lat: 33.585, lng: 73.149 },
    { name: 'Soan Gardens Commercial Broadway', lat: 33.568, lng: 73.157 },
    { name: 'Naval Anchorage Commercial Centre', lat: 33.562, lng: 73.169 },
    { name: 'Jinnah Garden Commercial Main Market', lat: 33.579, lng: 73.165 },
    { name: 'Adyala Road Commercial Market (Rawalpindi)', lat: 33.553, lng: 73.042 },
    { name: 'Peshawar Road Commercial Hub (Chur Harpal)', lat: 33.612, lng: 73.016 }
  ],
  transit: [
    { name: 'Islamabad Expressway (Zero Point Interchange)', lat: 33.6922, lng: 73.0645 },
    { name: 'Srinagar / Kashmir Highway (G-9 Interchange)', lat: 33.6784, lng: 73.0232 },
    { name: '7th Avenue & Srinagar Highway Interchange', lat: 33.699, lng: 73.073 },
    { name: '9th Avenue & IJP Road Interchange (Shaheen Chowk)', lat: 33.655, lng: 73.051 },
    { name: 'Metro Bus Station (Peshawar Morr Central Hub)', lat: 33.674, lng: 73.037 },
    { name: 'Metro Bus Station (Secretariat Terminal)', lat: 33.7383, lng: 73.0978 },
    { name: 'Metro Bus Station (Faizabad Interchange)', lat: 33.6635, lng: 73.0848 },
    { name: 'Metro Bus Station (Chaman Station, Murree Road)', lat: 33.648, lng: 73.075 },
    { name: 'Metro Bus Station (Rehmanabad Station, Murree Road)', lat: 33.638, lng: 73.071 },
    { name: 'Metro Bus Station (Chandni Chowk Station, Rawalpindi)', lat: 33.626, lng: 73.067 },
    { name: 'Metro Bus Station (Liaquat Bagh Station)', lat: 33.612, lng: 73.062 },
    { name: 'Metro Bus Station (Saddar Station Rawalpindi)', lat: 33.5985, lng: 73.0515 },
    { name: 'Metro Bus Station (Golra Morr / NUST Gateway)', lat: 33.641, lng: 72.988 },
    { name: 'Metro Bus Station (G-13 / G-14 Sector Station)', lat: 33.648, lng: 72.964 },
    { name: 'Metro Bus Orange Line (Airport Terminal Station)', lat: 33.559, lng: 72.833 },
    { name: 'Islamabad International Airport (Passenger Terminal)', lat: 33.5565, lng: 72.828 },
    { name: 'Islamabad International Airport Motorway Link (M-2)', lat: 33.5658, lng: 72.8465 },
    { name: 'Thalian Interchange (M-2 Motorway & Airport Link)', lat: 33.518, lng: 72.876 },
    { name: 'Fateh Jang Road Interchange (M-2 / Airport North)', lat: 33.588, lng: 72.842 },
    { name: 'Peshawar Road Interchange (Chur Chowk / M-1 Gateway)', lat: 33.619, lng: 72.998 },
    { name: 'Margalla Avenue Interlink (D-12 / B-17 Sector Corridor)', lat: 33.702, lng: 72.946 },
    { name: 'Margalla Avenue Interchange (Sangjani / GT Road N-5)', lat: 33.676, lng: 72.858 },
    { name: 'B-17 Multi Gardens M-1 Motorway Interchange', lat: 33.692, lng: 72.805 },
    { name: 'Rawalpindi Railway Station (Saddar)', lat: 33.5955, lng: 73.0585 },
    { name: 'Islamabad Railway Station (H-9 / I-9 Link)', lat: 33.6705, lng: 73.048 },
    { name: 'Chaklala Railway Station (Chaklala Cantt)', lat: 33.598, lng: 73.078 },
    { name: 'Golra Sharif Railway Heritage Junction', lat: 33.673, lng: 72.978 },
    { name: 'IJP Principal Road (Double Road Junction)', lat: 33.6492, lng: 73.0673 },
    { name: 'IJP Road & Pirwadhai Interchange', lat: 33.642, lng: 73.029 },
    { name: 'Pirwadhai General Bus & Coach Stand', lat: 33.638, lng: 73.036 },
    { name: 'Khanna Pul Interchange (Islamabad Expressway)', lat: 33.634, lng: 73.111 },
    { name: 'Islamabad Expressway (Koral Interchange)', lat: 33.6083, lng: 73.1362 },
    { name: 'Gulberg Greens Interchange (Islamabad Expressway)', lat: 33.599, lng: 73.142 },
    { name: 'Naval Anchorage Interchange (Islamabad Expressway)', lat: 33.571, lng: 73.159 },
    { name: 'Rawal Chowk Interchange (Park Road & Murree Road bypass)', lat: 33.688, lng: 73.109 },
    { name: 'Chak Shahzad Interchange (Park Road & Lehtrar Road link)', lat: 33.665, lng: 73.141 },
    { name: 'Taramri Chowk (Lehtrar Road)', lat: 33.636, lng: 73.161 },
    { name: 'GT Road (Rawat Junction)', lat: 33.4998, lng: 73.1932 },
    { name: 'T-Chowk Rawat Interchange (Expressway & GT Road)', lat: 33.501, lng: 73.195 },
    { name: 'GT Road Soan Bridge Junction (Rawalpindi / DHA-1 Entry)', lat: 33.552, lng: 73.101 },
    { name: 'DHA Phase 2 Gate 1 Interchange (GT Road)', lat: 33.524, lng: 73.152 },
    { name: 'Bahria Town Phase 8 Master Access Expressway', lat: 33.502, lng: 73.089 },
    { name: 'Chaklala Cantt Airport Road Junction (Ammar Chowk)', lat: 33.601, lng: 73.093 },
    { name: 'Kachehri Chowk Junction (The Mall / Jhelum Road)', lat: 33.581, lng: 73.064 },
    { name: 'Rawalpindi Ring Road Junction (Southern Bypass Gateway)', lat: 33.5358, lng: 73.0289 }
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
