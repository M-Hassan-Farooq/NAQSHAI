-- ==========================================
-- NAQSHAI Supabase Database Schema Migration
-- Migration Script: 06_fix_published_plot_id_type.sql
-- Fix: listing_drafts.published_plot_id must be TEXT, not UUID
-- ==========================================
--
-- WHY:
--   plots.id is a human-readable TEXT primary key ("Plot-99", and on a plot-number
--   collision "Plot-99-6692"). listing_drafts.published_plot_id links to it and is
--   declared TEXT in 02_listing_drafts.sql. On some live databases the column was
--   originally created as UUID and never altered (CREATE TABLE IF NOT EXISTS is a
--   no-op once the table exists), so approving a listing failed with:
--       invalid input syntax for type uuid: "Plot-99-6692"
--   when the approval transition wrote the TEXT plot id into the UUID column.
--
-- This migration is safe/idempotent: it drops any foreign key currently on the
-- column (whatever its name), converts the column to TEXT, then re-adds the FK to
-- plots(id). published_plot_id is only ever set at approval time, so on databases
-- where nothing has been approved yet every existing value is NULL (NULL::text is
-- NULL) and no data is lost. On databases already correct, the type change is a
-- no-op and the FK is simply recreated.

-- 1. Drop any existing foreign-key constraint on published_plot_id (name may vary).
DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT c.conname INTO fk_name
  FROM pg_constraint c
  JOIN pg_attribute a
    ON a.attrelid = c.conrelid
   AND a.attnum = ANY (c.conkey)
  WHERE c.conrelid = 'public.listing_drafts'::regclass
    AND c.contype = 'f'
    AND a.attname = 'published_plot_id';

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.listing_drafts DROP CONSTRAINT %I', fk_name);
  END IF;
END $$;

-- 2. Convert the column to TEXT so it can hold human-readable plot ids.
ALTER TABLE public.listing_drafts
  ALTER COLUMN published_plot_id TYPE TEXT USING published_plot_id::text;

-- 3. Re-add the foreign key to plots(id) (now type-compatible).
ALTER TABLE public.listing_drafts
  ADD CONSTRAINT listing_drafts_published_plot_id_fkey
  FOREIGN KEY (published_plot_id)
  REFERENCES public.plots(id)
  ON DELETE SET NULL;
