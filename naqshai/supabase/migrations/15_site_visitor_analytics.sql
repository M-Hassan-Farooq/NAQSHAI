-- Migration 15: NAQSHAI Built-In Site Visitor & QR Analytics Engine
-- Provides permanent, tamper-resistant tracking of all-time site visitors,
-- unique daily citizens, Panaflex QR code scans, page paths, and devices.

CREATE TABLE IF NOT EXISTS public.site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL DEFAULT '/',
  referrer TEXT DEFAULT '',
  source TEXT DEFAULT 'direct',
  device_type TEXT DEFAULT 'desktop',
  browser TEXT DEFAULT 'unknown',
  country TEXT DEFAULT 'PK',
  city TEXT DEFAULT 'Islamabad',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indices for fast real-time metric aggregates
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON public.site_visits (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_source ON public.site_visits (source);
CREATE INDEX IF NOT EXISTS idx_site_visits_visitor_id ON public.site_visits (visitor_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_page_path ON public.site_visits (page_path);
CREATE INDEX IF NOT EXISTS idx_site_visits_device_type ON public.site_visits (device_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Revoke direct access from public/anon/authenticated roles.
-- Writes and queries run strictly through service-role backend API endpoints.
REVOKE ALL ON public.site_visits FROM anon;
REVOKE ALL ON public.site_visits FROM authenticated;

-- Explicit policy for Supabase Studio linter
DROP POLICY IF EXISTS "Service role full access on site_visits" ON public.site_visits;
CREATE POLICY "Service role full access on site_visits"
  ON public.site_visits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

