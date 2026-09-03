// One-off diagnostic: is public.listing_drafts in PostgREST's exposed schema cache?
// Fetches the PostgREST OpenAPI root (which lists every exposed table) with BOTH the
// anon key and the service key, and reports whether listing_drafts appears. This tells
// a stale-schema-cache problem (table exists in Postgres, missing from the REST layer)
// apart from a truly-missing table. Read-only. Safe to delete.
import { readFileSync } from 'node:fs';

const env = {};
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function listTables(key, label) {
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const spec = await res.json();
    const paths = Object.keys(spec.paths || {})
      .filter((p) => p !== '/' && !p.startsWith('/rpc/'))
      .map((p) => p.replace(/^\//, ''));
    const hasDrafts = paths.includes('listing_drafts');
    console.log(`\n[${label}] HTTP ${res.status} — ${paths.length} tables exposed`);
    console.log(`   listing_drafts exposed: ${hasDrafts ? '✅ YES' : '❌ NO'}`);
    console.log('   tables:', paths.join(', ') || '(none)');
    return hasDrafts;
  } catch (e) {
    console.log(`\n[${label}] request failed:`, e.message);
    return false;
  }
}

console.log('PostgREST schema-cache inspection for', url);
await listTables(anonKey, 'anon key');
await listTables(serviceKey, 'service key');
