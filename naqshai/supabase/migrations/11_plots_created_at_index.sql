-- ==========================================
-- NAQSHAI Supabase Database Schema Migration
-- Migration Script: 11_plots_created_at_index.sql
-- Adds the missing index on plots.created_at.
--
-- Every list endpoint orders plots by `created_at DESC` — the public map feed
-- (/api/plots), the chatbot inventory fetch (fetchOptimizedInventory), and the
-- review dashboard (/api/review) — but no index backed that ORDER BY, forcing a
-- full sort of the plots table on each request (worst on the public feed, which
-- runs it on every visit). This index makes the ordering index-served and keeps
-- it fast as inventory grows.
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_plots_created_at
    ON public.plots (created_at DESC);
