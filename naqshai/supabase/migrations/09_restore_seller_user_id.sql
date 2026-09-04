-- ==========================================
-- NAQSHAI Supabase Migration: 09_restore_seller_user_id.sql
-- Restore the seller ownership column required by listing approval.
-- ==========================================

-- Some databases were created from an older sellers definition that only had
-- the seller primary key. Keep existing rows and restore the expected link to
-- auth.users before migration 08 is applied or re-applied.
ALTER TABLE public.sellers
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON public.sellers(user_id);