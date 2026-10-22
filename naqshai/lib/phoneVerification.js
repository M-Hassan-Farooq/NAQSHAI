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

/**
 * Normalizes phone numbers (especially Pakistani formats) into standard E.164:
 * e.g., '03001234567' -> '+923001234567'
 */
export function normalizePhoneNumber(rawPhone) {
  if (!rawPhone) return '';
  const cleaned = String(rawPhone).trim();
  const digits = cleaned.replace(/[^0-9]/g, '');

  if (cleaned.startsWith('+')) {
    return '+' + digits;
  }
  if (digits.startsWith('0092')) {
    return '+92' + digits.slice(4);
  }
  if (digits.startsWith('92') && digits.length >= 12) {
    return '+' + digits;
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return '+92' + digits.slice(1);
  }
  if (digits.startsWith('3') && digits.length === 10) {
    return '+92' + digits;
  }
  return '+' + digits;
}

/**
 * Validates whether the normalized phone number looks plausible.
 */
export function isValidPhone(phone) {
  const normalized = normalizePhoneNumber(phone);
  // Must start with + and have 10 to 15 digits
  return /^\+[1-9]\d{9,14}$/.test(normalized);
}

/**
 * Clean up expired OTPs to avoid memory bloat
 */
function cleanupExpired() {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(phone);
    }
  }
}

/**
 * Generates and stores a 6-digit OTP for the given phone number.
 */
export async function sendOtp(rawPhone) {
  cleanupExpired();

  const normalized = normalizePhoneNumber(rawPhone);
  if (!isValidPhone(normalized)) {
    throw new Error('Please enter a valid mobile number (e.g., +923001234567 or 03001234567).');
  }

  // Rate-limiting check: minimum 30 seconds between requests for the same number
  const existing = otpStore.get(normalized);
  const now = Date.now();
  if (existing && existing.lastSentAt && now - existing.lastSentAt < 30 * 1000) {
    const remaining = Math.ceil((30 * 1000 - (now - existing.lastSentAt)) / 1000);
    throw new Error(`Please wait ${remaining} seconds before requesting a new code.`);
  }

  // Generate 6-digit OTP (e.g. 100000 - 999999)
  // For easy hackathon demo, you can use 123456 or random digits
  const code = process.env.TWILIO_ACCOUNT_SID ? String(Math.floor(100000 + Math.random() * 900000)) : '123456';
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

  otpStore.set(normalized, {
    code,
    expiresAt,
    attempts: 0,
    lastSentAt: now,
  });

  // Check if Twilio SMS is configured
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn('[Twilio SMS Error]:', errorData);
        // Fallback to demo mode if Twilio account has expired/trial restrictions
        return {
          success: true,
          normalizedPhone: normalized,
          isDemoMode: true,
          demoOtp: code,
          message: `SMS gateway error. Switched to demo mode: code is ${code}`,
        };
      }

      return {
        success: true,
        normalizedPhone: normalized,
        isDemoMode: false,
        message: 'Verification code sent via SMS.',
      };
    } catch (err) {
      console.warn('[Twilio Dispatch Exception]:', err);
      return {
        success: true,
        normalizedPhone: normalized,
        isDemoMode: true,
        demoOtp: code,
        message: `Network error reaching SMS gateway. Demo code: ${code}`,
      };
    }
  }

  // Hackathon Smart Demo Mode
  return {
    success: true,
    normalizedPhone: normalized,
    isDemoMode: true,
    demoOtp: code,
    message: `Verification code generated: ${code}`,
  };
}

/**
 * Verifies the 6-digit OTP code against the stored value.
 */
export function verifyOtp(rawPhone, inputCode) {
  cleanupExpired();

  const normalized = normalizePhoneNumber(rawPhone);
  const record = otpStore.get(normalized);

  if (!record) {
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

  const cleanInput = String(inputCode || '').trim();
  if (cleanInput !== record.code) {
    return {
      success: false,
      error: 'Incorrect verification code. Please try again.',
    };
  }

  // Success: clear the used OTP
  otpStore.delete(normalized);

  return {
    success: true,
    normalizedPhone: normalized,
    message: 'WhatsApp mobile number successfully verified!',
  };
}
