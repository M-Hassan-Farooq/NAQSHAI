import crypto from 'crypto';

/**
 * NAQSHAI Document Security & Cryptographic Cipher Module
 *
 * Provides:
 * 1. AES-256-GCM authenticated encryption & decryption for uploaded documents.
 * 2. Cryptographic SHA-256 file hashing for anti-tamper verification.
 * 3. File magic-byte format inspection (PDF, JPEG, PNG, WEBP) barring dangerous files.
 * 4. Time-bounded, tamper-proof HMAC access tokens for authorized file streaming.
 */

// 4-byte Magic Header for NAQSHAI Encrypted Documents ("NQENC1" -> 0x4E, 0x51, 0x45, 0x01)
const MAGIC_HEADER = Buffer.from([0x4E, 0x51, 0x45, 0x01]);
const IV_LENGTH = 12; // 96-bit IV standard for AES-GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag
const HEADER_TOTAL_LENGTH = MAGIC_HEADER.length + IV_LENGTH + AUTH_TAG_LENGTH; // 4 + 12 + 16 = 32 bytes

// Cache key in memory to avoid repeated derivations
let cachedKey = null;

/**
 * Returns a 32-byte Buffer encryption key.
 * Prioritizes DOCUMENT_ENCRYPTION_KEY, with deterministic fallback derived
 * from SUPABASE_SERVICE_ROLE_KEY or OPERATOR_PASSPHRASE if not yet configured in env.
 */
export function getDocumentEncryptionKey() {
  if (cachedKey) return cachedKey;

  const rawKey = process.env.DOCUMENT_ENCRYPTION_KEY;
  if (rawKey && typeof rawKey === 'string' && rawKey.trim()) {
    const trimmed = rawKey.trim();
    if (trimmed.length === 64 && /^[0-9a-fA-F]+$/.test(trimmed)) {
      cachedKey = Buffer.from(trimmed, 'hex');
      return cachedKey;
    }
    // If provided as 32-byte base64 or raw string, hash it to ensure exactly 32 bytes
    cachedKey = crypto.createHash('sha256').update(trimmed).digest();
    return cachedKey;
  }

  // Resilient server secret fallback: derive 32-byte key from SUPABASE_SERVICE_ROLE_KEY or OPERATOR_PASSPHRASE
  const seed = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.OPERATOR_PASSPHRASE || 'naqshai-fallback-secure-seed-2026';
  cachedKey = crypto.createHash('sha256').update(`naqshai-doc-cipher:${seed}`).digest();
  return cachedKey;
}

/**
 * Computes deterministic SHA-256 hash of a file buffer.
 * @param {Buffer|ArrayBuffer} buffer
 * @returns {string} 64-character lowercase hexadecimal hash
 */
export function computeFileHash(buffer) {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/**
 * Encrypts a document buffer using AES-256-GCM.
 * Output format: [MAGIC_HEADER (4B)] + [IV (12B)] + [AUTH_TAG (16B)] + [CIPHERTEXT]
 *
 * @param {Buffer|ArrayBuffer} plainBuffer
 * @returns {Buffer} Authenticated ciphertext with embedded IV & auth tag
 */
export function encryptDocument(plainBuffer) {
  const buf = Buffer.isBuffer(plainBuffer) ? plainBuffer : Buffer.from(plainBuffer);
  const key = getDocumentEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(buf), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([MAGIC_HEADER, iv, authTag, encrypted]);
}

/**
 * Checks if a buffer is a NAQSHAI encrypted document.
 * @param {Buffer|ArrayBuffer} buffer
 * @returns {boolean}
 */
export function isEncryptedDocument(buffer) {
  if (!buffer || buffer.byteLength < HEADER_TOTAL_LENGTH) return false;
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  return (
    buf[0] === MAGIC_HEADER[0] &&
    buf[1] === MAGIC_HEADER[1] &&
    buf[2] === MAGIC_HEADER[2] &&
    buf[3] === MAGIC_HEADER[3]
  );
}

/**
 * Decrypts a document buffer using AES-256-GCM.
 * Automatically detects whether the buffer is encrypted; if it is a legacy unencrypted
 * document, returns the buffer safely as-is (backward compatible).
 *
 * @param {Buffer|ArrayBuffer} encryptedBuffer
 * @returns {Buffer} Original plaintext document buffer
 */
export function decryptDocument(encryptedBuffer) {
  const buf = Buffer.isBuffer(encryptedBuffer) ? encryptedBuffer : Buffer.from(encryptedBuffer);

  // If not encrypted with our magic header, return as-is (backward compatibility)
  if (!isEncryptedDocument(buf)) {
    return buf;
  }

  const key = getDocumentEncryptionKey();
  const iv = buf.subarray(MAGIC_HEADER.length, MAGIC_HEADER.length + IV_LENGTH);
  const authTag = buf.subarray(MAGIC_HEADER.length + IV_LENGTH, HEADER_TOTAL_LENGTH);
  const ciphertext = buf.subarray(HEADER_TOTAL_LENGTH);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/**
 * Strict magic-byte inspection to verify document format and prevent malicious uploads.
 * Supported: PDF, JPEG, PNG, WEBP.
 * Prohibited: SVGs, HTML, PHP, JavaScript, executables, scripts.
 *
 * @param {Buffer|ArrayBuffer} buffer
 * @param {string} originalFileName
 * @returns {{ isValid: boolean, mimeType: string, extension: string, error?: string }}
 */
export function validateDocumentFormatAndSize(buffer, originalFileName = '') {
  if (!buffer || buffer.byteLength === 0) {
    return { isValid: false, mimeType: '', extension: '', error: 'Uploaded file is empty.' };
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB maximum
  if (buffer.byteLength > MAX_FILE_SIZE) {
    return {
      isValid: false,
      mimeType: '',
      extension: '',
      error: `File size (${(buffer.byteLength / (1024 * 1024)).toFixed(1)} MB) exceeds the 10 MB limit.`,
    };
  }

  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const safeName = (originalFileName || '').toLowerCase();

  // 1. PDF: %PDF- (0x25, 0x50, 0x44, 0x46)
  if (
    buf.length >= 4 &&
    buf[0] === 0x25 &&
    buf[1] === 0x50 &&
    buf[2] === 0x44 &&
    buf[3] === 0x46
  ) {
    return { isValid: true, mimeType: 'application/pdf', extension: 'pdf' };
  }

  // 2. JPEG: 0xFF, 0xD8, 0xFF
  if (
    buf.length >= 3 &&
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff
  ) {
    return { isValid: true, mimeType: 'image/jpeg', extension: 'jpg' };
  }

  // 3. PNG: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { isValid: true, mimeType: 'image/png', extension: 'png' };
  }

  // 4. WEBP: RIFF....WEBP
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && // "RIFF"
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50 // "WEBP"
  ) {
    return { isValid: true, mimeType: 'image/webp', extension: 'webp' };
  }

  // Explicit security block on dangerous web scripts/SVGs
  if (safeName.endsWith('.svg') || safeName.endsWith('.html') || safeName.endsWith('.htm')) {
    return {
      isValid: false,
      mimeType: '',
      extension: '',
      error: 'SVG and HTML formats are prohibited due to XSS vulnerability risks. Please upload a PDF or image.',
    };
  }

  return {
    isValid: false,
    mimeType: '',
    extension: '',
    error: 'Unrecognized file format. Only official PDF documents or JPEG/PNG/WEBP scans are permitted.',
  };
}

/**
 * Creates a time-bounded, cryptographically signed access token for streaming/downloading
 * an encrypted document via the backend.
 *
 * @param {object} params
 * @param {string} params.draftId
 * @param {string} params.field
 * @param {string} [params.userId]
 * @param {boolean} [params.isOperator=false]
 * @param {number} [params.expiresInSeconds=600] 10 minutes default
 * @returns {string} base64url signed token (prefix "dat_")
 */
export function createDocumentAccessToken({
  draftId,
  field,
  userId = 'any',
  isOperator = false,
  expiresInSeconds = 600,
}) {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  const payload = `${draftId}:${field}:${userId}:${expiresAt}:${isOperator ? '1' : '0'}`;
  const key = getDocumentEncryptionKey();
  const signature = crypto.createHmac('sha256', key).update(payload).digest('hex');
  const tokenBody = Buffer.from(JSON.stringify({ p: payload, s: signature })).toString('base64url');
  return `dat_${tokenBody}`;
}

/**
 * Verifies a time-bounded document access token.
 *
 * @param {string} token
 * @param {string} expectedDraftId
 * @param {string} expectedField
 * @returns {{ valid: boolean, userId?: string, isOperator?: boolean, error?: string }}
 */
export function verifyDocumentAccessToken(token, expectedDraftId, expectedField) {
  if (!token || typeof token !== 'string' || !token.startsWith('dat_')) {
    return { valid: false, error: 'Invalid document access token structure.' };
  }

  try {
    const raw = Buffer.from(token.slice(4), 'base64url').toString('utf8');
    const { p: payload, s: signature } = JSON.parse(raw);
    if (!payload || !signature) {
      return { valid: false, error: 'Malformed token payload.' };
    }

    const key = getDocumentEncryptionKey();
    const expectedSig = crypto.createHmac('sha256', key).update(payload).digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, error: 'Cryptographic signature mismatch.' };
    }

    const [draftId, field, userId, expiresAtStr, isOpStr] = payload.split(':');
    if (draftId !== expectedDraftId || field !== expectedField) {
      return { valid: false, error: 'Token scope does not match requested document.' };
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
      return { valid: false, error: 'Document access token has expired.' };
    }

    return {
      valid: true,
      userId,
      isOperator: isOpStr === '1',
    };
  } catch (err) {
    return { valid: false, error: err?.message || 'Token verification failed.' };
  }
}
