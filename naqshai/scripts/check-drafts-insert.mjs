// Definitive end-to-end test of the draft insert path (RLS included). Safe & self-cleaning:
// creates a throwaway user, signs in, inserts a draft exactly like /api/drafts does via the
// user-scoped (anon key + Bearer) client, reports the RLS result, then deletes the user.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.log('No service key — cannot run this test.');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const email = `draft-diag-${Date.now()}@example.com`;
const password = `Diag!${Math.random().toString(36).slice(2)}Aa1`;
let userId = null;

try {
  // 1. Create + confirm a throwaway user.
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (cErr) { console.log('createUser failed:', cErr.message); process.exit(2); }
  userId = created.user.id;
  console.log('Created test user:', userId);

  // 2. Sign in as them with the ANON client to get a real access token (like the browser).
  const anon = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: signIn, error: sErr } = await anon.auth.signInWithPassword({ email, password });
  if (sErr) { console.log('signIn failed:', sErr.message); process.exit(3); }
  const token = signIn.session.access_token;
  console.log('Signed in, got access token:', !!token);

  // 3. User-scoped client = anon key + Bearer, exactly like getUserClient(token) in the app.
  const userDb = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  const { data: draft, error: iErr } = await userDb
    .from('listing_drafts')
    .insert([{ user_id: userId, status: 'draft', current_step: 1, form_data: { plotDetails: { plotNumber: '101' } } }])
    .select()
    .single();

  if (iErr) {
    console.log('\n❌ INSERT via user client FAILED (this is what the app hits):');
    console.log('   code   :', iErr.code);
    console.log('   message:', iErr.message);
    if (/row-level security/i.test(iErr.message) || iErr.code === '42501') {
      console.log('\n=> RLS is blocking the insert. The policies from the migration are missing.');
      console.log('   Re-run the RLS section of supabase/migrations/02_listing_drafts.sql.');
    }
  } else {
    console.log('\n✅ INSERT via user client SUCCEEDED. Draft id:', draft.id);
    console.log('   RLS + schema + auth path all work. The app failure is elsewhere');
    console.log('   (likely the browser session token) — check the browser console error.');
  }
} finally {
  // 4. Cleanup: deleting the user cascades to their drafts (ON DELETE CASCADE).
  if (userId) {
    const { error: dErr } = await admin.auth.admin.deleteUser(userId);
    console.log(dErr ? `\nCleanup warning: ${dErr.message}` : '\nCleaned up test user.');
  }
}
