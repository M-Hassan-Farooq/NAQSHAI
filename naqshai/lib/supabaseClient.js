import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validate & sanitize Supabase URL (ensure http:// or https:// scheme)
function getValidSupabaseUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return 'https://placeholder.supabase.co';
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const supabaseUrl = getValidSupabaseUrl(rawUrl);
const supabaseAnonKey = rawAnonKey.trim() || 'placeholder-anon-key';
const supabaseServiceKey = rawServiceKey.trim() || supabaseAnonKey;

/**
 * Utility to verify if real Supabase environment variables are loaded.
 */
export function isSupabaseConfigured() {
  return Boolean(
    rawUrl &&
    rawAnonKey &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-anon-key'
  );
}

if (!isSupabaseConfigured()) {
  console.warn(
    '[Supabase Config Notice] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or unconfigured. Safe placeholder client active.'
  );
}

// Circuit breaker state to prevent continuous network spam on connection reset hosts
let isNetworkBlocked = false;
let lastFailureTimestamp = 0;
const BLOCK_COOLDOWN_MS = 15000; // 15s cooldown before re-probing a resetting host

/**
 * Resilient fetch wrapper for Supabase JS client.
 * Traps ERR_CONNECTION_RESET, TypeError: Failed to fetch, and socket resets.
 * Implements a circuit-breaker to stop spamming DevTools when backend resets connections.
 */
async function resilientFetch(input, init) {
  const now = Date.now();

  if (isNetworkBlocked && now - lastFailureTimestamp < BLOCK_COOLDOWN_MS) {
    const errorBody = JSON.stringify({
      error: 'ERR_CONNECTION_RESET',
      message: 'Supabase network host is temporarily offline or connection reset (cooldown active).',
    });
    return new Response(errorBody, {
      status: 503,
      statusText: 'Service Unavailable (Connection Reset Cooldown)',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(input, init);
    if (isNetworkBlocked) {
      isNetworkBlocked = false;
    }
    return response;
  } catch (err) {
    isNetworkBlocked = true;
    lastFailureTimestamp = Date.now();
    console.warn('[Supabase Client] Intercepted network connection error:', err?.message || err);
    const errorBody = JSON.stringify({
      error: 'ERR_CONNECTION_RESET',
      message: 'Network connection to Supabase server was reset or temporarily unavailable.',
      details: err?.message || 'Connection reset by peer',
    });
    return new Response(errorBody, {
      status: 503,
      statusText: 'Service Unavailable (Connection Reset)',
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Standard client for public frontend requests
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: resilientFetch },
});

// Server-side admin client (uses service role key if provided, fallback to anon key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
  global: { fetch: resilientFetch },
});
