-- ==========================================
-- NAQSHAI Supabase Migration: 12_lock_down_seller_writes.sql
-- Close the sellers-table write gap left open by 01_schema.sql.
-- ==========================================
--
-- WHY:
--   01_schema.sql created permissive policies that let ANY client (anon or
--   authenticated) INSERT/UPDATE ANY row in public.sellers:
--     "Allow public insert to sellers"  (WITH CHECK (true))
--     "Allow public update to sellers"  (USING (true))
--   Migration 07 locked down public.plots the same way, but sellers was missed.
--   An attacker holding only the public anon key could therefore overwrite any
--   seller's full_name / phone_number -> contact spoofing / lead hijacking.
--
-- INVARIANT:
--   A seller row's primary key IS the owner's auth user id
--   (approve_listing sets id = user_id = draft_row.user_id; profileHelper syncs
--   with id = userId). So "owns this row" == (id = auth.uid()).
--
-- WHAT MUST KEEP WORKING:
--   * Public READ ("Public sellers read access") is intentionally KEPT — the map
--     (/api/plots) and profile lookups read owner contact via the anon key.
--   * lib/profileHelper.syncProfile() upserts the CALLER'S OWN seller row with
--     the browser client -> allowed by the owner-scoped policies below.
--   * lib/publishListing.js (dbAdmin) and the approve_listing() RPC run as
--     service_role / SECURITY DEFINER, which BYPASS RLS -> unaffected.

-- 1. Remove the permissive public write policies from 01_schema.sql.
DROP POLICY IF EXISTS "Allow public insert to sellers" ON public.sellers;
DROP POLICY IF EXISTS "Allow public update to sellers" ON public.sellers;

-- 2. Owner-scoped INSERT: a signed-in user may create only their own seller row,
--    and may not claim someone else's user_id.
DROP POLICY IF EXISTS "Sellers insert own row" ON public.sellers;
CREATE POLICY "Sellers insert own row"
    ON public.sellers
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid() AND (user_id IS NULL OR user_id = auth.uid()));

-- 3. Owner-scoped UPDATE: a signed-in user may update only their own seller row.
DROP POLICY IF EXISTS "Sellers update own row" ON public.sellers;
CREATE POLICY "Sellers update own row"
    ON public.sellers
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND (user_id IS NULL OR user_id = auth.uid()));

-- 4. Deny ALL writes to the unauthenticated anon role, and deny deletes to
--    authenticated users (no code path deletes sellers; RLS already had no
--    DELETE policy). service_role keeps full access via BYPASSRLS.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.sellers FROM anon;
REVOKE DELETE ON TABLE public.sellers FROM authenticated;
