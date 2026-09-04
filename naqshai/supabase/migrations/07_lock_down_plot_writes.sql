-- ==========================================
-- NAQSHAI Supabase Migration: 07_lock_down_plot_writes.sql
-- Prevent anonymous and user-token clients from mutating published plots.
-- ==========================================

-- Public map reads remain allowed by "Public plots read access" from 01_schema.sql.
-- All plot creation and publication is performed by server-side privileged routes.
DROP POLICY IF EXISTS "Allow public insert to plots" ON public.plots;
DROP POLICY IF EXISTS "Allow public update to plots" ON public.plots;
DROP POLICY IF EXISTS "Allow public delete to plots" ON public.plots;

-- Keep the table readable through the public client, but remove direct write
-- privileges from the client-facing Supabase roles. The service role is unaffected.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.plots FROM anon, authenticated;
