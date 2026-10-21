import { GoogleGenAI } from '@google/genai';

const SUPPORTED_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite'
];

/**
 * Detect MIME type from file path or fallback
 */
function getMimeType(filePath = '') {
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

    const arrayBuffer = await data.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = data.type || getMimeType(filePath);

    return {
      inlineData: {
        data: base64Data,
        mimeType: mimeType === 'application/octet-stream' ? getMimeType(filePath) : mimeType
      }
    };
  } catch (err) {
    console.warn(`[aiDocumentVerifier] Exception fetching file "${filePath}":`, err?.message || err);
    return null;
  }
}

/**
 * Performs Multimodal AI Verification on listing documents against metadata.
 *
 * @param {Object} params
 * @param {Object} params.formData - Entire listing draft form_data
 * @param {Object} params.dbAdmin - Privileged Supabase client
 * @returns {Promise<Object>} Verification audit result
 */
export async function verifyListingDocuments({ formData = {}, dbAdmin }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      overallStatus: 'UNREADABLE',
      confidenceScore: 0,
      summary: 'AI Verification unavailable: GEMINI_API_KEY is not configured on the server.',
      cnicAudit: { detected: false, notes: 'Missing API key' },
      allotmentAudit: { detected: false, notes: 'Missing API key' },
      redFlags: ['Server API key missing for Gemini OCR engine.'],
      recommendation: 'MANUAL_REVIEW_REQUIRED',
      verifiedAt: new Date().toISOString()
    };
  }

  const seller = formData.sellerInfo || {};
  const plot = formData.plotDetails || {};
  const uploaded = formData.uploadedFiles || {};

  // Extract storage paths
  const allotmentPath = typeof uploaded.allotmentLetter === 'string'
    ? uploaded.allotmentLetter
    : uploaded.allotmentLetter?.path;
  const cnicFrontPath = typeof uploaded.cnicFront === 'string'
    ? uploaded.cnicFront
    : uploaded.cnicFront?.path;
  const cnicBackPath = typeof uploaded.cnicBack === 'string'
    ? uploaded.cnicBack
    : uploaded.cnicBack?.path;

  if (!allotmentPath && !cnicFrontPath) {
    return {
      overallStatus: 'UNREADABLE',
      confidenceScore: 0,
      summary: 'No documents were uploaded to verify.',
      cnicAudit: { detected: false, notes: 'No CNIC uploaded' },
      allotmentAudit: { detected: false, notes: 'No Allotment Letter uploaded' },
      redFlags: ['Required ownership documents are missing from this draft.'],
      recommendation: 'REJECT',
      verifiedAt: new Date().toISOString()
    };
  }

  // Fetch document parts
  const [allotmentPart, cnicFrontPart, cnicBackPart] = await Promise.all([
    fetchDocumentPart(dbAdmin, 'plot-documents', allotmentPath),
    fetchDocumentPart(dbAdmin, 'plot-documents', cnicFrontPath),
    fetchDocumentPart(dbAdmin, 'plot-documents', cnicBackPath)
  ]);

  if (!allotmentPart && !cnicFrontPart) {
    return {
      overallStatus: 'UNREADABLE',
      confidenceScore: 0,
      summary: 'Uploaded document files could not be read from storage.',
      cnicAudit: { detected: false, notes: 'File read error' },
      allotmentAudit: { detected: false, notes: 'File read error' },
      redFlags: ['Storage read failed for uploaded documents.'],
      recommendation: 'MANUAL_REVIEW_REQUIRED',
      verifiedAt: new Date().toISOString()
    };
  }

  const systemInstruction = `
You are the NAQSHAI Legal & Identity Verification AI, an expert auditor for Pakistani property transactions in Islamabad (CDA) and Rawalpindi (RDA).
Your role is to rigorously inspect uploaded property documents (Allotment / Transfer Letter, CNIC Front and CNIC Back) and cross-reference them against the seller's declared listing metadata.

TASK & CHECKS:
1. CNIC IDENTITY AUDIT:
   - Identify whether a Pakistani National Identity Card (CNIC/NICOP) is present.
   - Extract the seller's full legal name and CNIC number.
   - Compare with DECLARED SELLER NAME. Allow for standard Pakistani naming variations (e.g. "Muhammad" vs "Mohd" vs "M.", honorifics like "Chaudhry" or "Raja").
   - Flag if the names completely mismatch.

2. ALLOTMENT / TRANSFER LETTER AUDIT:
   - Identify whether an official Allotment Letter, Transfer Letter, or Possession Certificate is present.
   - Extract the Allottee / Transferee Name, Plot Number, Block/Sector, Housing Society Name, and Plot Size.
   - Cross-check:
     a) Does the extracted Allottee Name match the CNIC name / seller name?
     b) Does the extracted Plot Number match the declared Plot Number?
     c) Does the extracted Society / Block match the declared Society?
     d) Does the extracted Size match the declared Size?

3. QUALITY, LEGIBILITY & AUTHENTICITY:
   - Flag if text is illegible, severely blurred, cut off, or appears edited/doctored.
   - Flag if non-property or dummy images (e.g., screenshots, random photos) were uploaded.

4. OVERALL STATUS & RECOMMENDATION:
   - overallStatus MUST be one of:
     * "VERIFIED" (All names, plot numbers, and society match with high clarity, confidence >= 85)
     * "CAUTION" (Minor discrepancies, e.g. slight spelling differences or partial block info, confidence 60-84)
     * "MISMATCH" (Severe mismatch in seller identity, wrong plot number, wrong society, confidence < 60)
     * "UNREADABLE" (Blurry, incomplete, or non-document uploads)
   - recommendation: "APPROVE" | "MANUAL_REVIEW_REQUIRED" | "REJECT"

RESPONSE FORMAT:
You MUST respond with valid, parseable JSON only. Do NOT include markdown code blocks or any extraneous text.
JSON Structure:
{
  "overallStatus": "VERIFIED" | "CAUTION" | "MISMATCH" | "UNREADABLE",
  "confidenceScore": number (0 to 100),
  "summary": "1-2 sentence executive verdict",
  "cnicAudit": {
    "detected": boolean,
    "extractedName": string or null,
    "extractedCnic": string or null,
    "nameMatch": boolean,
    "notes": string
  },
  "allotmentAudit": {
    "detected": boolean,
    "allotteeName": string or null,
    "plotNumber": string or null,
    "society": string or null,
    "size": string or null,
    "plotMatch": boolean,
    "societyMatch": boolean,
    "ownerMatchesCnic": boolean,
    "notes": string
  },
  "redFlags": [string],
  "recommendation": "APPROVE" | "MANUAL_REVIEW_REQUIRED" | "REJECT"
}
`;

  const declaredMetadataText = `
=== DECLARED LISTING METADATA ===
- Seller Full Name: "${seller.fullName || 'Not specified'}"
- Seller Phone: "${seller.phoneNumber || 'Not specified'}"
- Declared Plot Number: "${plot.plotNumber || 'Not specified'}"
- Declared Society / Sector: "${plot.society || 'Not specified'}"
- Declared City: "${plot.city || 'Not specified'}"
- Declared Size: "${plot.sizeDimensions || 'Not specified'}"
- Demand Price: "${plot.pricePkr ? `PKR ${plot.pricePkr}` : 'Not specified'}"

=== ATTACHED DOCUMENTS FOR VERIFICATION ===
`;

  const contents = [declaredMetadataText];

  if (cnicFrontPart) {
    contents.push('--- [DOCUMENT 1: CNIC FRONT] ---');
    contents.push(cnicFrontPart);
  }
  if (cnicBackPart) {
    contents.push('--- [DOCUMENT 2: CNIC BACK] ---');
    contents.push(cnicBackPart);
  }
  if (allotmentPart) {
    contents.push('--- [DOCUMENT 3: ALLOTMENT / TRANSFER LETTER] ---');
    contents.push(allotmentPart);
  }

  const ai = new GoogleGenAI({ apiKey });

  let rawOutput = null;

  for (const modelName of SUPPORTED_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });

      const text = typeof response?.text === 'function' ? response.text() : response?.text;
      if (text) {
        rawOutput = text;
        break;
      }
    } catch (err) {
      console.warn(`[aiDocumentVerifier] Model ${modelName} call failed:`, err?.message || err);
    }
  }

  if (!rawOutput) {
    return {
      overallStatus: 'UNREADABLE',
      confidenceScore: 0,
      summary: 'AI verification models were unable to process the uploaded documents at this time.',
      cnicAudit: { detected: false, notes: 'Model execution timeout or error' },
      allotmentAudit: { detected: false, notes: 'Model execution timeout or error' },
      redFlags: ['AI analysis request failed. Manual audit required.'],
      recommendation: 'MANUAL_REVIEW_REQUIRED',
      verifiedAt: new Date().toISOString()
    };
  }

  try {
    const cleaned = rawOutput.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      overallStatus: parsed.overallStatus || 'CAUTION',
      confidenceScore: Math.min(100, Math.max(0, Number(parsed.confidenceScore) || 50)),
      summary: parsed.summary || 'Document audit completed.',
      cnicAudit: {
        detected: !!parsed.cnicAudit?.detected,
        extractedName: parsed.cnicAudit?.extractedName || null,
        extractedCnic: parsed.cnicAudit?.extractedCnic || null,
        nameMatch: !!parsed.cnicAudit?.nameMatch,
        notes: parsed.cnicAudit?.notes || ''
      },
      allotmentAudit: {
        detected: !!parsed.allotmentAudit?.detected,
        allotteeName: parsed.allotmentAudit?.allotteeName || null,
        plotNumber: parsed.allotmentAudit?.plotNumber || null,
        society: parsed.allotmentAudit?.society || null,
        size: parsed.allotmentAudit?.size || null,
        plotMatch: !!parsed.allotmentAudit?.plotMatch,
        societyMatch: !!parsed.allotmentAudit?.societyMatch,
        ownerMatchesCnic: !!parsed.allotmentAudit?.ownerMatchesCnic,
        notes: parsed.allotmentAudit?.notes || ''
      },
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
      recommendation: parsed.recommendation || 'MANUAL_REVIEW_REQUIRED',
      verifiedAt: new Date().toISOString()
    };
  } catch (parseErr) {
    console.error('[aiDocumentVerifier] Failed to parse JSON response:', parseErr, rawOutput);
    return {
      overallStatus: 'CAUTION',
      confidenceScore: 50,
      summary: 'AI processed the documents but returned a non-standard response structure.',
      cnicAudit: { detected: false, notes: 'Parse warning' },
      allotmentAudit: { detected: false, notes: 'Parse warning' },
      redFlags: ['Structured output parsing error.'],
      recommendation: 'MANUAL_REVIEW_REQUIRED',
      verifiedAt: new Date().toISOString()
    };
  }
}
