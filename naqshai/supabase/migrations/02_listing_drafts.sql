-- ==========================================
-- NAQSHAI Supabase Database Schema Migration
-- Migration Script: 02_listing_drafts.sql
-- Persistent, resumable listing drafts
-- ==========================================
--
-- WHY A SEPARATE TABLE (not reusing public.plots):
--   1. public.plots enforces NOT NULL on title/city/price_pkr/size_dimensions and
--      polygon_coordinates. A half-finished draft cannot satisfy these without
--      inserting fake data, which would corrupt the published dataset.
--   2. /api/plots (the public 3D map feed) selects EVERY row in public.plots with
--      no status filter. Storing drafts there would leak incomplete listings onto
--      the live map immediately.
--   3. public.plots.id is a human-readable TEXT primary key ("Plot-101") derived
--      from the plot number at SUBMIT time. Drafts do not have that yet.
--   4. Draft-only concerns (current_step, autosave timestamps, in-progress JSON)
--      do not belong on the canonical listing entity.
--   5. This migration is purely additive: zero risk to the existing insert path
--      or the public map. On submit, the finished draft is copied into public.plots.

-- 1. Create Listing Drafts Table
CREATE TABLE IF NOT EXISTS public.listing_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- the owner (auth user)
    status TEXT NOT NULL DEFAULT 'draft',        -- 'draft' | 'submitted' | 'published'
    current_step SMALLINT NOT NULL DEFAULT 1,     -- last wizard step the user reached (1-3)
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- entire wizard state (seller, plot, polygon, doc refs)
    published_plot_id TEXT REFERENCES public.plots(id) ON DELETE SET NULL, -- set once submitted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- drives last-write-aware conflict detection
);

-- Indexes for owner lookups and dashboard ordering
CREATE INDEX IF NOT EXISTS idx_listing_drafts_user ON public.listing_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_drafts_status ON public.listing_drafts(status);
CREATE INDEX IF NOT EXISTS idx_listing_drafts_user_updated ON public.listing_drafts(user_id, updated_at DESC);

-- Reuse the existing timestamp trigger function from 01_schema.sql
CREATE OR REPLACE TRIGGER update_listing_drafts_modtime
    BEFORE UPDATE ON public.listing_drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();


-- ==========================================
-- 2. Row Level Security (owner-scoped)
-- ==========================================
-- Unlike the permissive policies on plots/sellers, drafts are private to their
-- owner. Even though the API verifies ownership server-side, these policies are
-- defense-in-depth: a user-scoped client can only ever touch its own rows.

ALTER TABLE public.listing_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners read own drafts" ON public.listing_drafts;
CREATE POLICY "Owners read own drafts"
    ON public.listing_drafts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners insert own drafts" ON public.listing_drafts;
CREATE POLICY "Owners insert own drafts"
    ON public.listing_drafts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners update own drafts" ON public.listing_drafts;
CREATE POLICY "Owners update own drafts"
    ON public.listing_drafts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners delete own drafts" ON public.listing_drafts;
CREATE POLICY "Owners delete own drafts"
    ON public.listing_drafts
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- ==========================================
-- 3. Tighten plot-documents Storage to per-owner folders
-- ==========================================
-- The original policies (01_schema.sql) let ANY authenticated user read/write any
-- object in the private 'plot-documents' bucket. Draft documents (CNIC, allotment
-- letters) are sensitive, so we scope access to the caller's own uid/ folder.
-- Uploads use the path convention:  <auth.uid()>/<draftId>/<field>-<ts>-<filename>
-- This is safe to apply now because no production uploads exist yet.

DROP POLICY IF EXISTS "Authenticated sellers upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners upload own plot documents" ON storage.objects;
CREATE POLICY "Owners upload own plot documents"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'plot-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Sellers view own plot documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners view own plot documents" ON storage.objects;
CREATE POLICY "Owners view own plot documents"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'plot-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Owners update own plot documents" ON storage.objects;
CREATE POLICY "Owners update own plot documents"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'plot-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Owners delete own plot documents" ON storage.objects;
CREATE POLICY "Owners delete own plot documents"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'plot-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
