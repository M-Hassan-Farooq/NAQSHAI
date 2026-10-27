import { getBearerToken, isOperatorToken } from './authServer.js';

/**
 * NAQSHAI Operator Rate-Limiting & Anti-Brute-Force Guard
 *
 * Rules:
 * - Maximum 5 failed attempts per IP address within a 5-minute window.
 * - Exceeding 5 failures triggers a strict 15-minute IP lockout (HTTP 429).
 * - Successful authentication clears prior failed attempts.
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const FAILURE_WINDOW_MS = 5 * 60 * 1000; // 5-minute sliding window

// Shared singleton memory store to preserve state across serverless container warm executions & dev HMR
const globalStore = globalThis;
if (!globalStore.__naqshaiOperatorRateLimitStore) {
  globalStore.__naqshaiOperatorRateLimitStore = new Map();
}
const rateLimitStore = globalStore.__naqshaiOperatorRateLimitStore;

/**
 * Extracts client IP from standard request proxy headers.
 */
export function getClientIp(request) {
  if (!request || !request.headers) return '127.0.0.1';
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  return '127.0.0.1';
}

/**
 * Checks whether an IP is currently locked out.
 *
 * @param {string} ip
 * @returns {{ allowed: boolean, remainingSeconds?: number }}
 */
export function checkOperatorRateLimit(ip) {
  const record = rateLimitStore.get(ip);
  if (!record) return { allowed: true };

  const now = Date.now();

  // If locked out, check if lockout has expired
  if (record.lockedUntil) {
    if (now < record.lockedUntil) {
      const remainingSeconds = Math.max(1, Math.ceil((record.lockedUntil - now) / 1000));
      return { allowed: false, remainingSeconds };
    }
    // Lockout expired: purge record
    rateLimitStore.delete(ip);
    return { allowed: true };
  }

  // If window expired, reset attempts
  if (record.firstFailedAt && now - record.firstFailedAt > FAILURE_WINDOW_MS) {
    rateLimitStore.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

/**
 * Records a failed authentication attempt.
 *
 * @param {string} ip
 * @returns {{ locked: boolean, remainingAttempts: number, lockoutSeconds: number }}
 */
export function recordOperatorFailedAttempt(ip) {
  const now = Date.now();
  let record = rateLimitStore.get(ip);

  if (!record || (record.firstFailedAt && now - record.firstFailedAt > FAILURE_WINDOW_MS)) {
    record = {
      attempts: 1,
      firstFailedAt: now,
      lastFailedAt: now,
      lockedUntil: null,
    };
  } else {
    record.attempts += 1;
    record.lastFailedAt = now;
  }

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    rateLimitStore.set(ip, record);
    return {
      locked: true,
      remainingAttempts: 0,
      lockoutSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
    };
  }

  rateLimitStore.set(ip, record);
  return {
    locked: false,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.attempts),
    lockoutSeconds: 0,
  };
}

/**
 * Clears failed attempts upon successful authentication.
 *
 * @param {string} ip
 */
export function recordOperatorSuccess(ip) {
  rateLimitStore.delete(ip);
}

/**
 * Gatekeeper for operator routes.
 * Performs IP rate limiting + timing-safe token verification.
 *
 * @param {Request} request
 * @returns {{ authorized: boolean, status?: number, error?: string, remainingAttempts?: number, lockoutSeconds?: number }}
 */
export function verifyOperatorRequest(request) {
  const ip = getClientIp(request);
  const rateLimit = checkOperatorRateLimit(ip);

  if (!rateLimit.allowed) {
    return {
      authorized: false,
      status: 429,
      error: `Security Lockout: Too many failed passphrase attempts. Access is locked for ${rateLimit.remainingSeconds} seconds.`,
      lockoutSeconds: rateLimit.remainingSeconds,
    };
  }

  const token = getBearerToken(request);
  const isValid = isOperatorToken(token);

  if (!isValid) {
    const failure = recordOperatorFailedAttempt(ip);
    if (failure.locked) {
      return {
        authorized: false,
        status: 429,
        error: `Security Lockout: Maximum failed attempts exceeded (5/5). Access blocked for ${failure.lockoutSeconds} seconds.`,
        lockoutSeconds: failure.lockoutSeconds,
      };
    }
    return {
      authorized: false,
      status: 403,
      error: `Forbidden: Invalid operator credentials. ${failure.remainingAttempts} attempt(s) remaining before temporary IP lockout.`,
      remainingAttempts: failure.remainingAttempts,
    };
  }

  // Clear failure history on verified authentication
  recordOperatorSuccess(ip);
  return { authorized: true };
}
