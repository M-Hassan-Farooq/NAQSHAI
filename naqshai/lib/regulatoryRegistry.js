/**
 * NAQSHAI Regulatory Compliance & Housing Authority Clearance Engine
 * Evaluates listings and plots against official Capital Development Authority (CDA)
 * and Rawalpindi Development Authority (RDA) regulatory datasets.
 */

/**
 * Curated registry of Islamabad & Rawalpindi Housing Societies and Sectors
 * Based on official CDA & RDA Gazettes, NOC Registers, and Public Warning Lists.
 */
export const REGULATORY_REGISTRY = [
  // =========================================================================
  // 1. CDA ZONE 1 MUNICIPAL SECTORS (100% Government Master Plan Land)
  // =========================================================================
  {
    canonicalName: 'CDA Municipal Sectors (Islamabad Zone 1)',
    aliases: [
      'f-6', 'f-7', 'f-8', 'f-10', 'f-11',
      'g-6', 'g-7', 'g-8', 'g-9', 'g-10', 'g-11', 'g-13', 'g-14', 'g-15',
      'i-8', 'i-9', 'i-10', 'i-11', 'i-12', 'i-14',
      'd-12', 'c-15', 'c-16', 'e-7', 'e-11', 'h-8', 'h-9', 'h-11', 'h-12', 'h-13',
      'sector f', 'sector g', 'sector i', 'sector d', 'sector e', 'sector c', 'sector h',
      'blue area', 'diplomatic enclave', 'shakarparian'
    ],
    authority: 'CDA',
    jurisdiction: 'Islamabad Zone 1 (Core Capital)',
    tier: 'government',
    statusLabel: 'CDA Municipal Sector',
    badgeText: 'CDA Sector (Zone 1)',
    nocNumber: 'CDA Master Plan Ordinance 1960 (Gazetted)',
    lopStatus: 'Fully Approved (CDA Directorate of Planning)',
    riskTier: 'low',
    summary: 'Official Capital Development Authority municipal sector. Complete legal tenure with direct CDA one-window transfer.',
    warning: null,
    officialVerificationUrl: 'https://cda.gov.pk'
  },

  // =========================================================================
  // 2. CDA APPROVED PRIVATE HOUSING SOCIETIES (Valid NOC & Approved LOP)
  // =========================================================================
  {
    canonicalName: 'Multi Gardens (Sector B-17)',
    aliases: ['b-17', 'b17', 'multi gardens', 'mpchs', 'sector b-17'],
    authority: 'CDA',
    jurisdiction: 'Islamabad Zone 2',
    tier: 'approved',
    statusLabel: 'CDA Approved Society',
    badgeText: 'CDA Approved (Zone 2)',
    nocNumber: 'CDA/PLW-HS(RP)2(44)/2005/Vol-V/363',
    lopStatus: 'Approved (Blocks A, B, C, D, E, F, G)',
    riskTier: 'low',
    summary: 'Approved housing scheme sponsored by MPCHS. Valid NOC and approved Layout Plan across residential blocks.',
    warning: null,
    officialVerificationUrl: 'https://cda.gov.pk'
  },
  {
    canonicalName: 'Gulberg Greens & Residencia',
    aliases: ['gulberg', 'gulberg greens', 'gulberg residencia', 'ibechs'],
    authority: 'CDA',
    jurisdiction: 'Islamabad Zone 4 & 5',
    tier: 'approved',
    statusLabel: 'CDA Approved Society',
    badgeText: 'CDA Approved (Zone 4/5)',
    nocNumber: 'CDA/PLW-HS(RP)2(44)/04/Vol-II/438',
    lopStatus: 'Approved (Agro Farms & Residential Master Plan)',
    riskTier: 'low',
    summary: 'Approved by CDA under Intelligence Bureau Employees Cooperative Housing Society (IBECHS).',
    warning: null,
    officialVerificationUrl: 'https://cda.gov.pk'
  },
  {
    canonicalName: 'Faisal Town (Sector F-18)',
    aliases: ['faisal town', 'f-18', 'f18', 'zedem'],
    authority: 'CDA',
    jurisdiction: 'Islamabad Zone 2',
    tier: 'approved',
    statusLabel: 'CDA Approved Society',
    badgeText: 'CDA Approved (Zone 2)',
    nocNumber: 'CDA/PLW/HS(90)/2014',
    lopStatus: 'Approved (Blocks A, B, C)',
    riskTier: 'low',
    summary: 'Fully approved private housing scheme sponsored by Zedem International on GT Road / Motorway corridor.',
    warning: null,
    officialVerificationUrl: 'https://cda.gov.pk'
  },
  {
    canonicalName: 'TopCity-1',
    aliases: ['topcity', 'top city', 'topcity-1', 'top city 1'],
    authority: 'CDA / RDA',
    jurisdiction: 'Islamabad Zone 2 / Airport Corridor',
    tier: 'approved',
    statusLabel: 'CDA & RDA Approved',
    badgeText: 'CDA Approved (Zone 2)',
    nocNumber: 'CDA/PLW/HS(RP)2(69)/2005/Vol-II/118',
    lopStatus: 'Approved (Phase 1 Layout Plan)',
    riskTier: 'low',
    summary: 'Approved project by Dynast Associates at the junction of M-1/M-2 and Srinagar Highway.',
    warning: null,
    officialVerificationUrl: 'https://cda.gov.pk'
  },
  {
    canonicalName: 'Mumtaz City',
    aliases: ['mumtaz city', 'mumtaz'],
    authority: 'CDA',
    jurisdiction: 'Islamabad Zone 2',
    tier: 'approved',
    statusLabel: 'CDA Approved Society',
    badgeText: 'CDA Approved (Zone 2)',
    nocNumber: 'CDA/PLW-HS(RP)2(75)/06/Vol-II/406',
    lopStatus: 'Approved Layout Plan',
    riskTier: 'low',
    summary: 'Approved housing scheme sponsored by Chenab Developers adjacent to Islamabad International Airport.',
    warning: null,
    officialVerificationUrl: 'https://cda.gov.pk'
  },
  {
    canonicalName: 'Naval Anchorage',
    aliases: ['naval anchorage', 'anchorage', 'pakistan navy housing'],
    authority: 'CDA',
    jurisdiction: 'Islamabad Zone 5',
    tier: 'approved',
    statusLabel: 'CDA Approved Society',
    badgeText: 'CDA Approved (Zone 5)',
    nocNumber: 'CDA/PLW/HS(RP)2(33)/99/Vol-II/129',
    lopStatus: 'Approved Master Plan',
    riskTier: 'low',
    summary: 'Official Pakistan Navy Welfare housing scheme on Islamabad Expressway. Valid CDA NOC.',
    warning: null,
    officialVerificationUrl: 'https://cda.gov.pk'
  },
  {
    canonicalName: 'Tele Gardens (Sector F-17)',
    aliases: ['f-17', 'f17', 'tele gardens', 't&t', 'telecom housing'],
    authority: 'CDA',
    jurisdiction: 'Islamabad Zone 2',
    tier: 'approved',
    statusLabel: 'CDA Approved Society',
    badgeText: 'CDA Approved (Zone 2)',
    nocNumber: 'CDA/PLW/HS(RP)2(51)/2005',
    lopStatus: 'Approved',
    riskTier: 'low',
    summary: 'Approved housing scheme sponsored by T&T Employees Cooperative Housing Society.',
    warning: null,
    officialVerificationUrl: 'https://cda.gov.pk'
  },
  {
    canonicalName: 'River Garden',
    aliases: ['river garden', 'krl housing'],
    authority: 'CDA',
    jurisdiction: 'Islamabad Zone 5',
    tier: 'approved',
    statusLabel: 'CDA Approved Society',
    badgeText: 'CDA Approved (Zone 5)',
    nocNumber: 'CDA/PLW-HS(RP)2(23)/93',
    lopStatus: 'Approved Layout Plan',
    riskTier: 'low',
    summary: 'Approved scheme for KRL Employees Cooperative Housing on Islamabad Expressway.',
    warning: null,
    officialVerificationUrl: 'https://cda.gov.pk'
  },
  {
    canonicalName: 'Cabinet Division Employees Housing (E-16/E-17)',
    aliases: ['cabinet division', 'e-16', 'e-17', 'e16', 'e17'],
    authority: 'CDA',
    jurisdiction: 'Islamabad Zone 2',
    tier: 'approved',
    statusLabel: 'CDA Approved Society',
    badgeText: 'CDA Approved (Zone 2)',
    nocNumber: 'CDA/PLW-HS(RP)2(46)/2004',
    lopStatus: 'Approved',
    riskTier: 'low',
    summary: 'Approved housing scheme for federal cabinet division employees.',
    warning: null,
    officialVerificationUrl: 'https://cda.gov.pk'
  },
  {
    canonicalName: 'Soan Gardens (Phase 1)',
    aliases: ['soan gardens', 'soan garden', 'cechs'],
    authority: 'CDA',
    jurisdiction: 'Islamabad Zone 5',
    tier: 'approved',
    statusLabel: 'CDA Approved Society',
    badgeText: 'CDA Approved (Zone 5)',
    nocNumber: 'CDA/PLW-HS(RP)2(4)/89/Vol-II/540',
    lopStatus: 'Approved (Phase 1)',
    riskTier: 'low',
    summary: 'Approved for Phase 1 by Civilian Employees Cooperative Housing Society (CECHS).',
    warning: null,
    officialVerificationUrl: 'https://cda.gov.pk'
  },

  // =========================================================================
  // 3. RDA & DEFENCE HOUSING AUTHORITIES (Approved Schemes in Rawalpindi)
  // =========================================================================
  {
    canonicalName: 'DHA Islamabad-Rawalpindi (Phases 1 - 5)',
    aliases: ['dha', 'dha phase 1', 'dha phase 2', 'dha phase 3', 'dha phase 5', 'dha valley', 'defence'],
    authority: 'DHA / Federal Statutory Authority',
    jurisdiction: 'Islamabad Zone 5 & Rawalpindi',
    tier: 'approved',
    statusLabel: 'DHA Statutory Authority',
    badgeText: 'DHA Statutory Approved',
    nocNumber: 'DHA Act 2013 (National Assembly of Pakistan)',
    lopStatus: 'Approved Master Plan',
    riskTier: 'low',
    summary: 'Statutory Defence Housing Authority project with independent master-planned layout and sovereign tenure.',
    warning: null,
    officialVerificationUrl: 'https://dhai-r.com.pk'
  },
  {
    canonicalName: 'Bahria Town Rawalpindi (Phases 1 - 6)',
    aliases: ['bahria town', 'bahria phase 1', 'bahria phase 2', 'bahria phase 3', 'bahria phase 4', 'bahria phase 5', 'bahria phase 6', 'safari villas'],
    authority: 'RDA',
    jurisdiction: 'Rawalpindi Tehsil',
    tier: 'approved',
    statusLabel: 'RDA Approved Scheme',
    badgeText: 'RDA Approved Layout',
    nocNumber: 'RDA/MP&TE/F-PHS-18/125',
    lopStatus: 'Approved (Phases 1 through 6)',
    riskTier: 'low',
    summary: 'Approved layout plans for initial phases 1-6 under Rawalpindi Development Authority jurisdiction.',
    warning: null,
    officialVerificationUrl: 'https://rda.gop.pk'
  },
  {
    canonicalName: 'Faisal Hills',
    aliases: ['faisal hills', 'faisal hill', 'zedem taxila'],
    authority: 'RDA',
    jurisdiction: 'Rawalpindi / Taxila',
    tier: 'approved',
    statusLabel: 'RDA Approved Scheme',
    badgeText: 'RDA Approved Layout',
    nocNumber: 'RDA/MP&TE/F-PHS-104/2019',
    lopStatus: 'Approved (Blocks A, B, C, D)',
    riskTier: 'low',
    summary: 'Approved housing scheme sponsored by Zedem International near Margalla Hills Taxila.',
    warning: null,
    officialVerificationUrl: 'https://rda.gop.pk'
  },
  {
    canonicalName: 'Rawalpindi Cantt / Civil Lines',
    aliases: ['cantt', 'rawalpindi cantt', 'saddar rawalpindi', 'westridge', 'chaklala scheme', 'scheme 3'],
    authority: 'Military Lands & Cantonment (ML&C)',
    jurisdiction: 'Rawalpindi Cantonment Board',
    tier: 'government',
    statusLabel: 'Cantonment Board Land',
    badgeText: 'Cantt Board Gazetted',
    nocNumber: 'Cantonments Act 1924 (Ministry of Defence)',
    lopStatus: 'Fully Approved (RCB / CCB Directorates)',
    riskTier: 'low',
    summary: 'Official Cantonment Board municipal land with high regulatory security and clear leasehold tenure.',
    warning: null,
    officialVerificationUrl: 'https://mlc.gov.pk'
  },

  // =========================================================================
  // 4. PHASED / CONDITIONAL APPROVAL / EXTENSION UNDER REVIEW
  // =========================================================================
  {
    canonicalName: 'Park View City',
    aliases: ['park view city', 'park view', 'vision developers'],
    authority: 'CDA',
    jurisdiction: 'Islamabad Zone 4',
    tier: 'conditional',
    statusLabel: 'Phased / Extension Under Review',
    badgeText: 'CDA Phased Approval (Zone 4)',
    nocNumber: 'CDA/PLW/HS(RP)2(86)/2013 (Initial 1,067 Kanals)',
    lopStatus: 'Partially Approved (Phase 1 Approved, Extensions Under Review)',
    riskTier: 'moderate',
    summary: 'Core Phase 1 layout holds CDA approval. Subsequent block expansions and perimeter boundaries remain under regulatory scrutiny.',
    warning: 'Verify that the specific plot number falls within the approved 1,067 Kanal master plan boundary.',
    officialVerificationUrl: 'https://cda.gov.pk'
  },
  {
    canonicalName: 'Bahria Enclave (Islamabad)',
    aliases: ['bahria enclave', 'enclave islamabad'],
    authority: 'CDA',
    jurisdiction: 'Islamabad Zone 4',
    tier: 'conditional',
    statusLabel: 'Conditional Approval (Zone 4)',
    badgeText: 'CDA Conditional (Zone 4)',
    nocNumber: 'CDA/PLW-HS(RP)2(89)/2010',
    lopStatus: 'Approved Layout with Ecological Scrutiny',
    riskTier: 'moderate',
    summary: 'Initial layout approved by CDA; certain hill-cutting sectors and commercial avenues require environmental re-verification.',
    warning: 'Ensure environmental and contour compliance clearance for elevated blocks.',
    officialVerificationUrl: 'https://cda.gov.pk'
  },
  {
    canonicalName: 'Bahria Town Rawalpindi (Phase 8 Extensions)',
    aliases: ['bahria phase 8', 'phase 8 extension', 'bahria sector f', 'bahria sector g', 'bahria sector m'],
    authority: 'RDA',
    jurisdiction: 'Rawalpindi Tehsil',
    tier: 'conditional',
    statusLabel: 'Extension Under Scrutiny',
    badgeText: 'RDA Extension Under Review',
    nocNumber: 'RDA Planning Permission (Amended LOP Pending)',
    lopStatus: 'Under Scrutiny for Extension Acreage',
    riskTier: 'moderate',
    summary: 'Large-scale residential development with planning permission, but several peripheral extension sectors are pending final LOP clearance.',
    warning: 'Confirm plot possession and registry status before acquiring non-possession extension files.',
    officialVerificationUrl: 'https://rda.gop.pk'
  },
  {
    canonicalName: 'Capital Smart City',
    aliases: ['capital smart city', 'csc', 'smart city'],
    authority: 'RDA',
    jurisdiction: 'Rawalpindi / M-2 Corridor',
    tier: 'conditional',
    statusLabel: 'Preliminary NOC Granted',
    badgeText: 'RDA Preliminary NOC',
    nocNumber: 'RDA/MP&TE/F-PHS-IOM/2017 (Initial Acreage)',
    lopStatus: 'Approved Initial Layout (Expansion Under Review)',
    riskTier: 'moderate',
    summary: 'Holds initial planning permission and valid NOC for approved territory. Subsequent phase expansion under regular review.',
    warning: 'Verify whether specific block falls into the formally notified master boundary.',
    officialVerificationUrl: 'https://rda.gop.pk'
  },

  // =========================================================================
  // 5. PROMINENTLY FLAGGED / UNAUTHORIZED / ILLEGAL SCHEMES
  // (Official CDA / RDA Public Blacklist / Warning Notices)
  // =========================================================================
  {
    canonicalName: 'Ghauri Town',
    aliases: ['ghauri town', 'ghoori town', 'ghouri', 'ghori town'],
    authority: 'CDA',
    jurisdiction: 'Islamabad Zone 4 & 5',
    tier: 'unauthorized',
    statusLabel: 'Flagged Unauthorized Scheme',
    badgeText: 'CDA Illegal Schemes List',
    nocNumber: 'None (Listed on Official CDA Illegal Register)',
    lopStatus: 'Rejected / Operating Without Approval',
    riskTier: 'critical',
    summary: 'Operating without valid CDA approval. Repeatedly notified by CDA Directorate of Housing for building violations and utility ban.',
    warning: 'CRITICAL RISK: Society has NO valid CDA NOC. SNGPL & IESCO utility connections are legally barred by court orders.',
    officialVerificationUrl: 'https://cda.gov.pk'
  },
  {
    canonicalName: 'Abdullah City',
    aliases: ['abdullah city', 'abdullah town chakri'],
    authority: 'RDA',
    jurisdiction: 'Rawalpindi (Chakri Road)',
    tier: 'unauthorized',
    statusLabel: 'Flagged Unauthorized Scheme',
    badgeText: 'RDA Illegal Schemes List',
    nocNumber: 'None (Operating Without Legal NOC)',
    lopStatus: 'Unapproved / Banned',
    riskTier: 'critical',
    summary: 'Formally blacklisted on RDA list of illegal housing societies. FIRs registered against unauthorized marketing.',
    warning: 'CRITICAL RISK: Illegal scheme. Investment is not protected by Punjab Land Authorities.',
    officialVerificationUrl: 'https://rda.gop.pk'
  },
  {
    canonicalName: 'Blue World City',
    aliases: ['blue world city', 'bwc', 'blue world'],
    authority: 'RDA',
    jurisdiction: 'Rawalpindi (Chakri Road)',
    tier: 'unauthorized',
    statusLabel: 'Flagged / Unapproved Marketing',
    badgeText: 'RDA Public Warning Issued',
    nocNumber: 'NOC Cancelled / Not Issued for Advertised Land',
    lopStatus: 'Not Approved by RDA',
    riskTier: 'critical',
    summary: 'RDA has issued multiple public notices and legal notices warning against booking in unapproved blocks.',
    warning: 'CRITICAL RISK: Operating vast unapproved phases beyond permissible limits. Exercise extreme caution.',
    officialVerificationUrl: 'https://rda.gop.pk'
  },
  {
    canonicalName: 'Burma Town & Royal City (Lehtrar Road)',
    aliases: ['burma town', 'royal city', 'royal avenue', 'japan valley', 'ghouri gardens'],
    authority: 'CDA',
    jurisdiction: 'Islamabad Zone 4',
    tier: 'unauthorized',
    statusLabel: 'CDA Blacklisted Housing Scheme',
    badgeText: 'CDA Unauthorized List',
    nocNumber: 'None',
    lopStatus: 'Illegal Sub-Division',
    riskTier: 'critical',
    summary: 'Unplanned peri-urban sub-division lacking master sewerage, municipal zoning, or valid CDA layout plan.',
    warning: 'CRITICAL RISK: Illegal encroachment zone under CDA enforcement jurisdiction.',
    officialVerificationUrl: 'https://cda.gov.pk'
  }
];

/**
 * Checks whether centroid coordinates fall inside Islamabad Zone 1 Municipal Boundary
 */
function isInsideIslamabadZone1(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  // Bounding box for Sectors F, G, H, I, D-12, E-7, Blue Area
  return lat >= 33.630 && lat <= 33.755 && lng >= 72.945 && lng <= 73.135;
}

/**
 * Analyzes society name, city, and coordinates to return official CDA/RDA clearance status
 *
 * @param {string} [societyName='']
 * @param {string} [cityName='']
 * @param {Array|Object} [coordinates=null] - Polygon points array or {lat, lng} centroid
 * @returns {Object} Comprehensive regulatory profile
 */
export function checkRegulatoryStatus(societyName = '', cityName = '', coordinates = null) {
  const normSociety = String(societyName || '').trim().toLowerCase();
  const normCity = String(cityName || '').trim().toLowerCase();

  // Extract centroid if coordinates provided
  let lat = null;
  let lng = null;
  if (coordinates) {
    if (coordinates.lat && coordinates.lng) {
      lat = Number(coordinates.lat);
      lng = Number(coordinates.lng);
    } else if (Array.isArray(coordinates) && coordinates.length > 0) {
      const valid = coordinates.filter((p) => p && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)));
      if (valid.length > 0) {
        lat = valid.reduce((s, p) => s + Number(p.lat), 0) / valid.length;
        lng = valid.reduce((s, p) => s + Number(p.lng), 0) / valid.length;
      }
    }
  }

  // 1. Direct Alias / Canonical Name Match
  for (const entry of REGULATORY_REGISTRY) {
    // Check if society text matches entry canonical name
    if (normSociety.includes(entry.canonicalName.toLowerCase())) {
      return formatRegulatoryResult(entry, true);
    }
    // Check aliases
    for (const alias of entry.aliases) {
      // Word boundary match or exact substring match
      const regex = new RegExp(`(^|\\b|\\s)${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\b|\\s|$)`, 'i');
      if (regex.test(normSociety)) {
        return formatRegulatoryResult(entry, true);
      }
    }
  }

  // 2. Fallback: Sector pattern match (e.g., "G-13/2", "F-10", "Sector I-8")
  const sectorPattern = /\b([c-i]|d)[- ]?([5-9]|1[0-7])\b/i;
  if (sectorPattern.test(normSociety) && (normCity.includes('islamabad') || normCity === '')) {
    const zone1Entry = REGULATORY_REGISTRY[0]; // CDA Municipal Sectors
    return formatRegulatoryResult(zone1Entry, true);
  }

  // 3. Fallback: Coordinate bounding check inside Islamabad Zone 1
  if (lat && lng && isInsideIslamabadZone1(lat, lng) && normCity.includes('islamabad')) {
    const zone1Entry = REGULATORY_REGISTRY[0];
    return formatRegulatoryResult(zone1Entry, true);
  }

  // 4. Unknown / Unverified Private Society Fallback
  const isIslamabad = normCity.includes('islamabad');
  const primaryAuth = isIslamabad ? 'CDA' : 'RDA';

  return {
    isRecognized: false,
    canonicalName: societyName || 'Unregistered Housing Scheme',
    authority: primaryAuth,
    jurisdiction: isIslamabad ? 'Islamabad Capital Territory' : 'Rawalpindi District',
    tier: 'unknown',
    statusLabel: `${primaryAuth} Verification Pending`,
    badgeText: `${primaryAuth} Scrutiny Required`,
    badgeColor: 'amber',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    nocNumber: 'Not Registered in Verified Public Directory',
    lopStatus: 'Unverified / Pending Manual Scrutiny',
    riskTier: 'moderate',
    summary: `Society name is not listed in the verified ${primaryAuth} approved registry. Independent title deed & NOC verification is recommended before token payment.`,
    warning: 'NOC verification pending. Many private housing schemes operate without a valid layout plan.',
    officialVerificationUrl: isIslamabad ? 'https://cda.gov.pk' : 'https://rda.gop.pk'
  };
}

/**
 * Formats a matched registry entry into a standardized payload
 */
function formatRegulatoryResult(entry, isRecognized) {
  let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let badgeColor = 'slate';

  switch (entry.tier) {
    case 'government':
    case 'approved':
      badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      badgeColor = 'emerald';
      break;
    case 'conditional':
      badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
      badgeColor = 'amber';
      break;
    case 'unauthorized':
      badgeClass = 'bg-amber-50 text-amber-900 border-amber-300';
      badgeColor = 'amber';
      break;
  }

  return {
    isRecognized,
    canonicalName: entry.canonicalName,
    authority: entry.authority,
    jurisdiction: entry.jurisdiction,
    tier: entry.tier,
    statusLabel: entry.statusLabel,
    badgeText: entry.badgeText,
    badgeColor,
    badgeClass,
    nocNumber: entry.nocNumber,
    lopStatus: entry.lopStatus,
    riskTier: entry.riskTier,
    summary: entry.summary,
    warning: entry.warning,
    officialVerificationUrl: entry.officialVerificationUrl
  };
}
