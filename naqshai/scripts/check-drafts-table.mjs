// One-off diagnostic: does public.listing_drafts exist and is it reachable?
// Reads .env.local (same config the app uses), runs a read-only count. Safe to delete.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// Minimal .env.local parser (standalone node doesn't auto-load it like Next does).
const env = {};
try {
  for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch (e) {
  console.error('Could not read .env.local:', e.message);
  process.exit(1);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const key = serviceKey || anonKey;
console.log('URL present:', !!url, '| service key present:', !!serviceKey, '| anon key present:', !!anonKey);

const db = createClient(url, key, { auth: { persistSession: false } });

const { error, count } = await db
  .from('listing_drafts')
  .select('id', { count: 'exact', head: true });

if (error) {
  console.log('\n❌ listing_drafts is NOT reachable.');
  console.log('   code   :', error.code);
  console.log('   message:', error.message);
  if (error.code === '42P01' || /does not exist/i.test(error.message)) {
    console.log('\n=> The table does not exist. Run supabase/migrations/02_listing_drafts.sql.');
  }
  process.exit(2);
}

console.log('\n✅ listing_drafts exists and is reachable. Row count:', count);
