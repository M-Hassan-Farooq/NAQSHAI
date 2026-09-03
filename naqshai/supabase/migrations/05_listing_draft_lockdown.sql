-- ==========================================
-- NAQSHAI Supabase Migration: 05_listing_draft_lockdown.sql
-- Locks submitted/published listing_drafts against owner mutation & deletion.
-- ==========================================
--
-- Workflow:  draft -> submitted -> published (approved)  |  rejected
--
--   Editable / deletable by the OWNER:   draft, rejected
--   Read-only for the OWNER (terminal):  submitted, published
--
-- The API already enforces this (the PUT, DELETE and submit handlers check status
-- server-side), but the owner-scoped RLS policies from 02_listing_drafts.sql only
-- checked ownership (auth.uid() = user_id). That means a direct supabase-js call
-- made with the user's own token could still UPDATE or DELETE a submitted/published
-- draft, bypassing the API. This migration adds the same status restriction to
-- those two policies as defense-in-depth.
--
-- Scope: ONLY the UPDATE and DELETE policies on public.listing_drafts change.
-- SELECT and INSERT are untouched, and so are the storage.objects policies. This
-- migration is metadata-only (it recreates policies; it never reads or writes any
-- row) and is idempotent.
--
-- Why the operator approve/reject flow is UNAFFECTED:
--   approve (submitted -> published) and reject (submitted -> rejected) run through
--   getAdminClient() with the service-role key, which BYPASSES RLS entirely. These
--   policies apply only to the 'authenticated' (user-token) role, so the operator
--   transitions keep working exactly as before.
--
-- Why submit STILL works:
--   submit (draft/rejected -> submitted) runs through the USER client, so it IS
--   subject to RLS. The UPDATE policy therefore (a) lets the owner target a row that
--   is currently draft/rejected (USING) and (b) permits the resulting row to be
--   draft, rejected, or submitted (WITH CHECK) -- but NOT published. Self-publishing
--   stays impossible for the owner; only the service-role approve path sets
--   'published'.

ALTER TABLE public.listing_drafts ENABLE ROW LEVEL SECURITY;

-- ---- UPDATE: owner may update only while draft/rejected, and may never set
--             'published' themselves (only the service-role approve path can).
DROP POLICY IF EXISTS "Owners update own drafts" ON public.listing_drafts;
CREATE POLICY "Owners update own drafts"
    ON public.listing_drafts
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id
        AND status IN ('draft', 'rejected')
    )
    WITH CHECK (
        auth.uid() = user_id
        AND status IN ('draft', 'rejected', 'submitted')
    );

-- ---- DELETE: owner may discard only a draft or a rejected listing.
DROP POLICY IF EXISTS "Owners delete own drafts" ON public.listing_drafts;
CREATE POLICY "Owners delete own drafts"
    ON public.listing_drafts
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = user_id
        AND status IN ('draft', 'rejected')
    );
