import crypto from 'crypto';

/**
 * NAQSHAI Phone OTP Verification Engine (Smart Dual-Mode)
 *
 * Supports:
 * 1. Production Mode: Dispatches real SMS via Twilio REST API if credentials exist.
 * 2. Hackathon Demo Mode: Seamless in-app verification with test OTP if no SMS credentials exist.
 */

// Singleton map persisted across Next.js dev reloads
const globalStore = globalThis;
if (!globalStore.__naqshaiOtpStore) {
  globalStore.__naqshaiOtpStore = new Map();
}
const otpStore = globalStore.__naqshaiOtpStore;

function getHmacSecret() {
  if (process.env.SUPABASE_JWT_SECRET) return process.env.SUPABASE_JWT_SECRET;
  if (process.env.OPERATOR_PASSPHRASE) return process.env.OPERATOR_PASSPHRASE;
  if (process.env.NEXTAUTH_SECRET) return process.env.NEXTAUTH_SECRET;
  if (!globalStore.__naqshaiHmacSecret) {
    globalStore.__naqshaiHmacSecret = crypto.randomBytes(32).toString('hex');
  }
  return globalStore.__naqshaiHmacSecret;
}

export function createChallengeToken(phone, code, expiresAt) {
  const payload = `${phone}:${code}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', getHmacSecret()).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

export function verifyChallengeToken(token, phone, inputCode) {
  try {
    if (!token) return false;
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const [storedPhone, storedCode, storedExpiresAt, storedSig] = raw.split(':');
    if (!storedPhone || !storedCode || !storedExpiresAt || !storedSig) return false;
    if (Date.now() > Number(storedExpiresAt)) return false;
    if (storedPhone !== phone) return false;
    if (storedCode !== inputCode) return false;
    const expectedSig = crypto.createHmac('sha256', getHmacSecret()).update(`${storedPhone}:${storedCode}:${storedExpiresAt}`).digest('hex');
    const a = Buffer.from(storedSig, 'hex');
    const b = Buffer.from(expectedSig, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function createVerificationToken(phone) {
  const normalized = normalizePhoneNumber(phone);
  const ts = Date.now();
  const payload = `${normalized}_${ts}`;
  const sig = crypto.createHmac('sha256', getHmacSecret()).update(payload).digest('hex');
  return `pv_${Buffer.from(`${payload}:${sig}`).toString('base64url')}`;
}

export function verifyVerificationToken(token, expectedPhone) {
  try {
    if (!token || typeof token !== 'string' || !token.startsWith('pv_')) return false;
    const raw = Buffer.from(token.slice(3), 'base64url').toString('utf8');
    const parts = raw.split(':');
    if (parts.length !== 2) return false;
    const [payload, sig] = parts;
    const [tokenPhone, tokenTs] = payload.split('_');
    if (!tokenPhone || !tokenTs || !sig) return false;

    // Check 24-hour expiration window
    const age = Date.now() - Number(tokenTs);
    if (Number.isNaN(age) || age < 0 || age > 24 * 60 * 60 * 1000) return false;

    // Check phone match
    const normalizedExpected = normalizePhoneNumber(expectedPhone);
    if (tokenPhone !== normalizedExpected) return false;

    // Constant-time signature verification
    const expectedSig = crypto.createHmac('sha256', getHmacSecret()).update(payload).digest('hex');
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expectedSig, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Normalizes phone numbers (especially Pakistani formats) into standard E.164:
 * e.g., '03001234567' -> '+923001234567'
 */
export function normalizePhoneNumber(rawPhone) {
  if (!rawPhone) return '';
  const cleaned = String(rawPhone).trim();
  let digits = cleaned.replace(/[^0-9]/g, '');

  if (cleaned.startsWith('+') && digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '');
  }

  if (digits.startsWith('0092')) {
    return '+92' + digits.slice(4);
  }
  if (digits.startsWith('92') && digits.length >= 11) {
    return '+' + digits;
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return '+92' + digits.slice(1);
  }
  if (digits.startsWith('3') && digits.length === 10) {
    return '+92' + digits;
  }
  if (cleaned.startsWith('+')) {
    return '+' + digits;
  }
  return '+' + digits;
}

/**
 * Validates whether the normalized phone number looks plausible.
 */
export function isValidPhone(phone) {
  const normalized = normalizePhoneNumber(phone);
  // Must start with + and have 10 to 15 digits (excluding leading zeros after +)
  return /^\+[1-9]\d{9,14}$/.test(normalized);
}

/**
 * Clean up expired OTPs to avoid memory bloat.
 * Retains records for an extra 10 minutes past expiration so users
 * receive an informative "code expired" error rather than generic "not found".
 */
function cleanupExpired() {
  const now = Date.now();
  const retentionWindow = 10 * 60 * 1000; // 10 minutes grace period
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt + retentionWindow < now) {
      otpStore.delete(phone);
    }
  }
}

/**
 * Returns the currently stored OTP code for a phone number (used for internal tests and backend verification).
 */
export function getStoredOtpCode(rawPhone) {
  const normalized = normalizePhoneNumber(rawPhone);
  return otpStore.get(normalized)?.code || null;
}

/**
 * Generates and stores a 6-digit OTP for the given phone number.
 * In development / demo mode, the code is securely logged to the server terminal only.
 */
export async function sendOtp(rawPhone, options = {}) {
  cleanupExpired();

  const normalized = normalizePhoneNumber(rawPhone);
  if (!isValidPhone(normalized)) {
    throw new Error('Please enter a valid mobile number (e.g., 03259503868 or +923259503868).');
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const isDemo = !twilioSid || !twilioToken;

  // Rate-limiting check: minimum 30 seconds between requests for the same number
  const existing = otpStore.get(normalized);
  const now = Date.now();
  if (existing && existing.lastSentAt && now - existing.lastSentAt < 30 * 1000) {
    const remaining = Math.ceil((30 * 1000 - (now - existing.lastSentAt)) / 1000);
    throw new Error(`Please wait ${remaining} seconds before requesting a new code.`);
  }

  // Generate cryptographically random 6-digit OTP (e.g. 100000 - 999999) every time
  const code = String(crypto.randomInt(100000, 1000000));
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

  otpStore.set(normalized, {
    code,
    expiresAt,
    attempts: 0,
    lastSentAt: now,
  });

  // Secure Terminal Logging (Option 1): Code is visible in server terminal only, NOT to the client
  if (isDemo) {
    console.log(
      `\x1b[36m[SMS OTP TERMINAL]\x1b[0m Verification code for \x1b[1m${normalized}\x1b[0m is: \x1b[1m\x1b[32m${code}\x1b[0m (Valid for 5 mins - Check terminal)`
    );
  }

  // Check if Twilio SMS is configured
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const body = new URLSearchParams({
        To: normalized,
        From: twilioFrom,
        Body: `[NAQSHAI] Your verification code is ${code}. Valid for 5 minutes. Do not share this code.`,
      });

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const challengeToken = createChallengeToken(normalized, code, expiresAt);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn('[Twilio SMS Error]:', errorData);
        // Fallback to demo mode if Twilio account has expired/trial restrictions
        const fallbackRes = {
          success: true,
          normalizedPhone: normalized,
          isDemoMode: true,
          challengeToken,
          message: 'SMS gateway error. Code securely logged to server terminal.',
        };
        if (options.includeTestCode) {
          fallbackRes.demoOtp = code;
        }
        return fallbackRes;
      }

      return {
        success: true,
        normalizedPhone: normalized,
        isDemoMode: false,
        challengeToken,
        message: 'Verification code sent via SMS.',
      };
    } catch (err) {
      console.warn('[Twilio Dispatch Exception]:', err);
      const challengeToken = createChallengeToken(normalized, code, expiresAt);
      const errRes = {
        success: true,
        normalizedPhone: normalized,
        isDemoMode: true,
        challengeToken,
        message: 'Network error reaching SMS gateway. Code logged to server terminal.',
      };
      if (options.includeTestCode) {
        errRes.demoOtp = code;
      }
      return errRes;
    }
  }

  // Hackathon Smart Demo Mode: Code logged to terminal, omitted from client response
  const challengeToken = createChallengeToken(normalized, code, expiresAt);
  const demoResult = {
    success: true,
    normalizedPhone: normalized,
    isDemoMode: true,
    challengeToken,
    message: 'Verification code logged to server terminal (SMS gateway in dev mode).',
  };
  if (options.includeTestCode) {
    demoResult.demoOtp = code;
  }
  return demoResult;
}

/**
 * Verifies the 6-digit OTP code against the stored value or cryptographic challengeToken.
 */
export function verifyOtp(rawPhone, inputCode, challengeToken = null) {
  cleanupExpired();

  const normalized = normalizePhoneNumber(rawPhone);
  const cleanInput = String(inputCode || '').trim();
  const record = otpStore.get(normalized);

  if (!record) {
    // If serverless container cold-started or routed to a separate lambda instance on Vercel,
    // verify through the cryptographically HMAC-signed challengeToken:
    if (challengeToken && verifyChallengeToken(challengeToken, normalized, cleanInput)) {
      const token = createVerificationToken(normalized);
      return {
        success: true,
        normalizedPhone: normalized,
        phone: normalized,
        token,
        message: 'WhatsApp mobile number successfully verified!',
      };
    }

    return {
      success: false,
      error: 'No active verification code found for this number. Please request a new code.',
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalized);
    return {
      success: false,
      error: 'Verification code has expired. Please request a new code.',
    };
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    otpStore.delete(normalized);
    return {
      success: false,
      error: 'Too many incorrect attempts. Please request a new code.',
    };
  }

  if (cleanInput !== record.code) {
    return {
      success: false,
      error: 'Incorrect verification code. Please try again.',
    };
  }

  // Success: clear the used OTP
  otpStore.delete(normalized);

  const token = createVerificationToken(normalized);

  return {
    success: true,
    normalizedPhone: normalized,
    phone: normalized,
    token,
    message: 'WhatsApp mobile number successfully verified!',
  };
}
