import { GoogleGenAI } from '@google/genai';
import { calculatePolygonArea, verifyAreaMatch } from './areaCalculator.js';
import { decryptDocument, isEncryptedDocument } from './documentCipher.js';

export const SUPPORTED_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-2.5-flash',
];

/**
 * Detect MIME type from file path or buffer magic bytes
 */
function getMimeType(filePath = '', buffer = null) {
  if (buffer && buffer.length >= 4) {
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return 'application/pdf';
    }
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return 'image/png';
    }
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      return 'image/webp';
    }
  }
  const ext = String(filePath).split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

/**
 * Downloads a file from Supabase Storage and converts it into a base64 inline part
 */
async function fetchDocumentPart(dbAdmin, bucketName, filePath) {
  if (!filePath) return null;
  try {
    const { data, error } = await dbAdmin.storage.from(bucketName).download(filePath);
    if (error || !data) {
      console.warn(`[aiDocumentVerifier] Failed to download "${filePath}":`, error?.message || error);
      return null;
    }

    let rawBuffer = null;
    if (typeof data.arrayBuffer === 'function') {
      const arrayBuffer = await data.arrayBuffer();
      rawBuffer = Buffer.from(arrayBuffer);
    } else if (Buffer.isBuffer(data)) {
      rawBuffer = data;
    } else if (data instanceof ArrayBuffer) {
      rawBuffer = Buffer.from(data);
    } else {
      rawBuffer = Buffer.from(data);
    }

    // Decrypt AES-256-GCM encrypted payload in memory before AI audit
    if (rawBuffer && isEncryptedDocument(rawBuffer)) {
      try {
        rawBuffer = decryptDocument(rawBuffer);
      } catch (decErr) {
        console.warn(`[aiDocumentVerifier] Failed to decrypt document "${filePath}":`, decErr?.message || decErr);
        return null;
      }
    }

    const base64Data = rawBuffer.toString('base64');
    const detectedMime = getMimeType(filePath, rawBuffer);

    return {
      inlineData: {
        data: base64Data,
        mimeType: detectedMime,
      },
    };
  } catch (err) {
    console.warn(`[aiDocumentVerifier] Exception fetching file "${filePath}":`, err?.message || err);
    return null;
  }
}

/**
 * Builds a standardized fallback report if models or storage fail
 */
function buildFallbackReport(reason = 'Verification could not be processed automatically.') {
  const now = new Date().toISOString();
  const isNoDocs = reason.toLowerCase().includes('no documents');
  return {
    confidence_score: 0,
    verdict: 'UNREADABLE',
    extracted_owner_name: null,
    extracted_cnic: null,
    extracted_plot_number: null,
    extracted_society_or_sector: null,
    extracted_size: null,
    extracted_serial_or_qr: null,
    detected_authority: 'UNKNOWN',
    checks: {
      name_matches_claim: false,
      plot_matches_claim: false,
      size_matches_claim: false,
      polygon_area_reasonable: false,
      serial_number_present: false,
    },
    flags: [reason],
    summary: reason,
    ai_verified_at: now,

    // Backward compatibility aliases
    overallStatus: 'UNREADABLE',
    confidenceScore: 0,
    cnicAudit: { detected: false, notes: reason },
    allotmentAudit: { detected: false, notes: reason },
    redFlags: [reason],
    recommendation: isNoDocs ? 'REJECT' : 'MANUAL_REVIEW_REQUIRED',
    verifiedAt: now,
  };
}

/**
 * Extracts all candidate document storage paths from form_data
 */
function extractCandidateDocPaths(formData = {}) {
  const paths = [];
  const addPath = (path, label) => {
    if (!path || typeof path !== 'string') return;
    const clean = path.trim();
    // Guard against directory traversal
    if (clean.includes('..') || clean.includes('\\')) return;
    if (clean && !paths.some((p) => p.path === clean)) {
      paths.push({ path: clean, label: label || 'Document' });
    }
  };

  const docs = formData.documents;
  if (Array.isArray(docs)) {
    for (const d of docs) {
      if (typeof d === 'string') addPath(d, 'Document');
      else if (d?.path) addPath(d.path, d.label || d.name || 'Document');
    }
  } else if (docs && typeof docs === 'object') {
    for (const [k, v] of Object.entries(docs)) {
      if (typeof v === 'string') addPath(v, k);
      else if (v?.path) addPath(v.path, v.label || v.name || k);
    }
  }

  const uploaded = formData.uploadedFiles || {};
  if (uploaded.allotmentLetter) {
    const p = typeof uploaded.allotmentLetter === 'string' ? uploaded.allotmentLetter : uploaded.allotmentLetter.path;
    addPath(p, 'Allotment / Transfer / Fard Slip');
  }
  if (uploaded.cnicFront) {
    const p = typeof uploaded.cnicFront === 'string' ? uploaded.cnicFront : uploaded.cnicFront.path;
    addPath(p, 'CNIC Front');
  }
  if (uploaded.cnicBack) {
    const p = typeof uploaded.cnicBack === 'string' ? uploaded.cnicBack : uploaded.cnicBack.path;
    addPath(p, 'CNIC Back');
  }

  // Fallbacks for top level keys
  if (formData.allotmentLetter) {
    addPath(typeof formData.allotmentLetter === 'string' ? formData.allotmentLetter : formData.allotmentLetter.path, 'Allotment Letter');
  }
  if (formData.cnicFront) {
    addPath(typeof formData.cnicFront === 'string' ? formData.cnicFront : formData.cnicFront.path, 'CNIC Front');
  }
  if (formData.cnicBack) {
    addPath(typeof formData.cnicBack === 'string' ? formData.cnicBack : formData.cnicBack.path, 'CNIC Back');
  }

  return paths;
}

/**
 * Performs Multimodal AI Verification on listing documents against metadata.
 *
 * @param {Object} params
 * @param {Object} params.formData - Entire listing draft form_data
 * @param {Object} params.dbAdmin - Privileged Supabase client
 * @returns {Promise<Object>} Verification audit report matching strict JSON schema
 */
export async function auditListingDocumentsWithVision({ formData = {}, dbAdmin }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return buildFallbackReport('AI Verification unavailable: GEMINI_API_KEY is not configured on the server.');
  }

  const seller = formData.sellerInfo || {};
  const plot = formData.plotDetails || {};
  const sellerName = seller.fullName || formData.seller_name || '';
  const phoneNumber = seller.phoneNumber || formData.phone || '';
  const city = plot.city || formData.city || '';
  const society = plot.society || formData.society || '';
  const plotNumber = plot.plotNumber || formData.plot_number || '';
  const sizeDimensions = plot.sizeDimensions || formData.size_dimensions || '';
  const demandPrice = plot.pricePkr ? `PKR ${plot.pricePkr}` : (formData.price_pkr ? `PKR ${formData.price_pkr}` : 'Not specified');
  const authorityDocType = formData.authority_doc_type || formData.authorityDocType || 'UNKNOWN';
  const documentSerialNumber = formData.document_serial_number || formData.documentSerialNumber || '';

  // Extract storage paths
  const docCandidates = extractCandidateDocPaths(formData);
  if (!docCandidates.length) {
    return buildFallbackReport('No documents attached to this draft for verification.');
  }

  // Download all parts from private 'plot-documents' bucket
  const partsWithLabels = await Promise.all(
    docCandidates.map(async (c) => {
      const part = await fetchDocumentPart(dbAdmin, 'plot-documents', c.path);
      return part ? { label: c.label, part } : null;
    })
  );

  const validParts = partsWithLabels.filter(Boolean);
  if (!validParts.length) {
    return buildFallbackReport('Uploaded documents could not be read from storage bucket.');
  }

  // Geodesic area calculation on polygon coordinates
  const polygon = formData.polygon_coordinates || formData.polygonCoordinates || [];
  let polygonAreaInfo = 'No polygon boundary coordinates provided.';
  let areaCheck = null;
  if (Array.isArray(polygon) && polygon.length >= 3) {
    const calc = calculatePolygonArea(polygon);
    areaCheck = verifyAreaMatch(polygon, sizeDimensions || '10 Marla (35x70)');
    polygonAreaInfo = `Calculated Geodesic Surface Area: ${Math.round(calc.sqFt)} sq ft (~${calc.marla.toFixed(2)} Marla / ${calc.kanal.toFixed(3)} Kanal). Area Match with declared size (${sizeDimensions || '10 Marla'}): ${areaCheck.isValid ? 'VALID MATCH' : (areaCheck.isOversized ? 'OVERSIZED ENCHROACHMENT RISK' : 'UNDERSIZED BOUNDARY')} (${areaCheck.percentage}% coverage).`;
  }

  const systemInstruction = `You are the NAQSHAI Legal & Land Registry AI Verification Specialist, an expert cadastral and document auditor for real estate transactions in Islamabad (CDA) and Rawalpindi/Punjab (PLRA Punjab Zameen, Punjab e-Stamp, RDA).
Your role is to rigorously inspect uploaded official property documents (Computerized PLRA Fard, Punjab e-Stamp Registry, CDA Verification Slip / NDC / Allotment Letter, Society Allotment Letter) and CNIC images, cross-matching them against the seller's declared listing metadata and cadastral polygon area.

KEY VERIFICATION OBJECTIVES:
1. OFFICIAL SERIAL & TRACKING NUMBER EXTRACTION (Anti-Forgery):
   - Extract any official cryptographic Serial Number, Tracking Number, Diary Number, Barcode number, or e-Stamp 16-digit verification code visible on the document.
   - Examples of Pakistani official serial formats:
     * PLRA Fard: e.g. "FARD-...", "PB-RWP-...", "RWP-...", "BKT-..." or 10-16 digit document serial / tracking number.
     * Punjab e-Stamp: 16-digit alphanumeric e-Stamp ID (e.g. "PB-RWP-2024-...", "ES-...").
     * CDA Islamabad: Diary No, NDC No, or Verification Slip tracking code.
     * Society: Allotment reference / Member Reg # (e.g. "DHA-ISB-...", "BT-...", "PR-...", "MS-...").
   - Compare with the declared "document_serial_number". If the seller declared a serial number, check if it matches the document or is a substring/variation.
   - Set detected_authority to "PLRA" | "ESTAMP" | "CDA" | "SOCIETY" | "UNKNOWN".

2. SELLER & IDENTITY CROSS-MATCH:
   - Extract the legal owner/allottee name and CNIC number from the ownership document and the CNIC front/back.
   - Compare with DECLARED SELLER NAME. Allow for standard Pakistani transliteration variants (e.g. "Muhammad" vs "Mohd" vs "M.", "Syed", honorifics "Chaudhry", "Malik", "Raja", "Khan").
   - Flag if the names fundamentally mismatch or belong to a different individual.

3. PROPERTY DETAILS CROSS-MATCH:
   - Extract Plot Number, Street/Sector/Block, and Housing Society / City.
   - Compare with declared Plot Number and declared Society / Sector.
   - Extract Plot Size / Area from the document (e.g. "5 Marla", "10 Marla", "1 Kanal", or dimensions like "30x60", "35x70", "50x90", or square yards).
   - Compare extracted size with claimed plot size AND with the calculated polygon area from the drawn map boundary.
   - Is the polygon area consistent with the document's stated land size? (1 Marla is approx 225 sq ft in CDA/Islamabad and 225-272 sq ft in Punjab).

4. AUTHENTICITY & QUALITY CHECKS:
   - Check for signs of tampering, digital editing, font inconsistencies, blurring, cut-off seals, or fraudulent document templates.
   - If text is unreadable or non-property files were uploaded, set verdict to "UNREADABLE".

5. CONFIDENCE SCORE & VERDICT:
   - confidence_score: integer from 0 to 100.
     * >= 80: High confidence, official stamps/serials present, all claimed details match.
     * 50-79: Moderate confidence or minor naming/size variations.
     * < 50: Severe mismatches or unverified documents.
   - verdict: MUST be one of "MATCH" | "PARTIAL_MATCH" | "MISMATCH" | "UNREADABLE".
     * "MATCH": High confidence (>= 80), owner name, plot number, and size match.
     * "PARTIAL_MATCH": Minor discrepancy, partial OCR readability, or slight size tolerance difference.
     * "MISMATCH": Direct contradiction in owner name, plot number, or society.
     * "UNREADABLE": Low resolution, illegible, missing key pages, or invalid file.

STRICT JSON OUTPUT FORMAT (Respond ONLY with valid JSON matching this schema, no markdown wrapping, no extra commentary):
{
  "confidence_score": 0,
  "verdict": "MATCH | PARTIAL_MATCH | MISMATCH | UNREADABLE",
  "extracted_owner_name": "string or null",
  "extracted_cnic": "string or null",
  "extracted_plot_number": "string or null",
  "extracted_society_or_sector": "string or null",
  "extracted_size": "string or null",
  "extracted_serial_or_qr": "string or null",
  "detected_authority": "PLRA | ESTAMP | CDA | SOCIETY | UNKNOWN",
  "checks": {
    "name_matches_claim": true,
    "plot_matches_claim": true,
    "size_matches_claim": true,
    "polygon_area_reasonable": true,
    "serial_number_present": true
  },
  "flags": ["Array of any discrepancies, tampering signs, or missing fields"],
  "summary": "Concise 1-2 sentence audit summary for the compliance operator."
}`;

  const declaredMetadataText = `=== DECLARED SELLER CLAIMED METADATA ===
- Declared Seller Full Name: "${sellerName || 'Not specified'}"
- Declared Seller Phone: "${phoneNumber || 'Not specified'}"
- Declared Document Type / Authority: "${authorityDocType}"
- Declared Document Serial / Tracking #: "${documentSerialNumber || 'Not provided'}"
- Declared Plot Number: "${plotNumber || 'Not specified'}"
- Declared Society / Sector: "${society || 'Not specified'}"
- Declared City: "${city || 'Not specified'}"
- Declared Plot Size: "${sizeDimensions || 'Not specified'}"
- Demand Price: "${demandPrice}"
- Cadastral Mapped Boundary Area: ${polygonAreaInfo}

=== ATTACHED DOCUMENTS FOR OCR & AUDIT ===`;

  const contents = [declaredMetadataText];
  for (const item of validParts) {
    contents.push(`--- [${item.label}] ---`);
    contents.push(item.part);
  }

  const ai = new GoogleGenAI({ apiKey });
  let rawOutput = null;
  let lastModelError = '';

  for (const modelName of SUPPORTED_MODELS) {
    try {
      console.log(`[aiDocumentVerifier] Attempting vision document audit via: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = typeof response?.text === 'function'
        ? response.text()
        : (typeof response?.text === 'string' ? response.text : response?.candidates?.[0]?.content?.parts?.[0]?.text);

      if (text && typeof text === 'string' && text.trim().length > 0) {
        rawOutput = text.trim();
        console.log(`[aiDocumentVerifier] Successfully audited documents with model: ${modelName}`);
        break;
      }
    } catch (err) {
      lastModelError = err?.message || String(err);
      console.warn(`[aiDocumentVerifier] Model ${modelName} failed (${lastModelError}), trying next fallback...`);
    }
  }

  if (!rawOutput) {
    return buildFallbackReport(`AI models were unable to process document images: ${lastModelError || 'Execution failed'}`);
  }

  try {
    const cleaned = rawOutput.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    const confidenceScore = Math.min(100, Math.max(0, Number(parsed.confidence_score ?? parsed.confidenceScore) || 0));
    let verdict = parsed.verdict;
    if (!['MATCH', 'PARTIAL_MATCH', 'MISMATCH', 'UNREADABLE'].includes(verdict)) {
      if (confidenceScore >= 80) verdict = 'MATCH';
      else if (confidenceScore >= 50) verdict = 'PARTIAL_MATCH';
      else verdict = 'MISMATCH';
    }

    const checks = {
      name_matches_claim: Boolean(parsed.checks?.name_matches_claim ?? parsed.cnicAudit?.nameMatch),
      plot_matches_claim: Boolean(parsed.checks?.plot_matches_claim ?? parsed.allotmentAudit?.plotMatch),
      size_matches_claim: Boolean(parsed.checks?.size_matches_claim ?? (parsed.allotmentAudit?.sizeMatch !== false)),
      polygon_area_reasonable: Boolean(
        parsed.checks?.polygon_area_reasonable ?? (areaCheck ? areaCheck.isValid : true)
      ),
      serial_number_present: Boolean(
        parsed.checks?.serial_number_present ?? (parsed.extracted_serial_or_qr || documentSerialNumber)
      ),
    };

    const flags = Array.isArray(parsed.flags)
      ? parsed.flags
      : (Array.isArray(parsed.redFlags) ? parsed.redFlags : []);

    const now = new Date().toISOString();

    return {
      confidence_score: confidenceScore,
      verdict,
      extracted_owner_name: parsed.extracted_owner_name || parsed.cnicAudit?.extractedName || parsed.allotmentAudit?.allotteeName || null,
      extracted_cnic: parsed.extracted_cnic || parsed.cnicAudit?.extractedCnic || null,
      extracted_plot_number: parsed.extracted_plot_number || parsed.allotmentAudit?.plotNumber || null,
      extracted_society_or_sector: parsed.extracted_society_or_sector || parsed.allotmentAudit?.society || null,
      extracted_size: parsed.extracted_size || parsed.allotmentAudit?.size || null,
      extracted_serial_or_qr: parsed.extracted_serial_or_qr || documentSerialNumber || null,
      detected_authority: parsed.detected_authority || (authorityDocType !== 'UNKNOWN' ? authorityDocType : 'UNKNOWN'),
      checks,
      flags,
      summary: parsed.summary || 'Document audit completed.',
      ai_verified_at: now,

      // Backward compatibility aliases
      overallStatus: verdict === 'MATCH' ? 'VERIFIED' : (verdict === 'PARTIAL_MATCH' ? 'CAUTION' : verdict),
      confidenceScore,
      recommendation: verdict === 'MATCH' ? 'APPROVE' : (verdict === 'MISMATCH' ? 'REJECT' : 'MANUAL_REVIEW_REQUIRED'),
      cnicAudit: {
        detected: Boolean(parsed.extracted_cnic || parsed.extracted_owner_name),
        extractedName: parsed.extracted_owner_name || null,
        extractedCnic: parsed.extracted_cnic || null,
        nameMatch: checks.name_matches_claim,
        notes: checks.name_matches_claim ? 'Name matches claimed seller.' : 'Name discrepancy detected.',
      },
      allotmentAudit: {
        detected: Boolean(parsed.extracted_plot_number || parsed.extracted_serial_or_qr),
        allotteeName: parsed.extracted_owner_name || null,
        plotNumber: parsed.extracted_plot_number || null,
        society: parsed.extracted_society_or_sector || null,
        size: parsed.extracted_size || null,
        plotMatch: checks.plot_matches_claim,
        societyMatch: checks.plot_matches_claim,
        sizeMatch: checks.size_matches_claim,
        ownerMatchesCnic: checks.name_matches_claim,
        notes: parsed.summary || '',
      },
      redFlags: flags,
      verifiedAt: now,
    };
  } catch (parseErr) {
    console.error('[aiDocumentVerifier] Failed to parse JSON response:', parseErr, rawOutput);
    return buildFallbackReport('AI processed documents but returned invalid JSON format.');
  }
}

/**
 * Legacy wrapper function for existing callers
 */
export async function verifyListingDocuments({ formData = {}, dbAdmin }) {
  return auditListingDocumentsWithVision({ formData, dbAdmin });
}
