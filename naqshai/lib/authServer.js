import { createClient } from '@supabase/supabase-js';

// Server-only Supabase helpers for verifying the caller's identity and running
// privileged / user-scoped database work. None of this runs in the browser.
//
// The app uses client-side Supabase Auth with localStorage sessions (no cookies,
// no @supabase/ssr), so the browser proves its identity to API routes by sending
// its access token as an `Authorization: Bearer <token>` header. We verify that
// token here with getUser(token). We NEVER trust an owner id supplied in the body.

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const operatorPassphrase = process.env.OPERATOR_PASSPHRASE || '';

function getValidUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
}

const supabaseUrl = getValidUrl(rawUrl);

/**
 * Verify the request's bearer token against Supabase and return the real user.
 * @returns {Promise<{ user: object|null, token: string|null, error: string|null }>}
 */
export async function getUserFromRequest(request) {
  try {
    const authHeader =
      request.headers.get('authorization') ||
      request.headers.get('Authorization') ||
      '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';

    if (!token) {
      return { user: null, token: null, error: 'Missing authorization token' };
    }
    if (!supabaseUrl || !anonKey) {
      return { user: null, token: null, error: 'Supabase environment not configured' };
    }

    const verifier = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await verifier.auth.getUser(token);
    if (error || !data?.user) {
      return { user: null, token, error: error?.message || 'Invalid or expired session' };
    }
    return { user: data.user, token, error: null };
  } catch (err) {
    console.warn('[authServer] Token verification network error:', err?.message || err);
    return { user: null, token: null, error: err?.message || 'Auth verification failed due to network reset' };
  }
}

/**
 * A DB client scoped to the caller's token. Row Level Security evaluates
 * auth.uid() from the JWT, so this client can only read/write the user's own
 * rows even if we forgot an explicit filter (defense-in-depth).
 */
export function getUserClient(token) {
  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * A privileged client (service role when available) for writes into the
 * permissive plots/sellers tables at submit time. Falls back to the anon key,
 * which still works because those tables have public insert policies.
 */
export function getAdminClient() {
  const key = serviceKey || anonKey;
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Extract the raw bearer token from a request's Authorization header (no verification).
 */
export function getBearerToken(request) {
  const authHeader =
    request.headers.get('authorization') ||
    request.headers.get('Authorization') ||
    '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
}

/**
 * Operator/admin gate for privileged workflow transitions (approve / reject).
 *
 * There is no user-facing admin role yet, so those operator-only endpoints are
 * authenticated with the server's Supabase service-role key, which is a server
 * secret and never reaches the browser. Returns false unless a service-role key is
 * actually configured AND the presented token matches it exactly.
 */
export function isServiceRoleToken(token) {
  return !!serviceKey && !!token && token === serviceKey;
}

/**
 * Operator gate for the human-facing review portal (/review).
 *
 * A single operator authenticates by presenting a shared passphrase
 * (OPERATOR_PASSPHRASE), sent as a bearer token from the review page. The
 * passphrase is a server-only secret — it is never prefixed NEXT_PUBLIC_, so it
 * never ships in the client bundle; the operator types it at runtime. We also
 * accept the service-role key so any existing server-to-server caller keeps
 * working. Returns false unless one of those secrets is actually configured AND
 * the presented token matches it exactly.
 *
 * NOTE: passing the gate only proves "an operator". The privileged database work
 * behind it still runs through getAdminClient() (service role), so the operator
 * portal additionally requires SUPABASE_SERVICE_ROLE_KEY to be configured for its
 * cross-user reads / document signing / approval writes to succeed.
 */
export function isOperatorToken(token) {
  if (isServiceRoleToken(token)) return true;
  return !!operatorPassphrase && !!token && token === operatorPassphrase;
}
