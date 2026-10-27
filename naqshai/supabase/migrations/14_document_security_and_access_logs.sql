-- ====================================================================
-- NAQSHAI Supabase Migration: 14_document_security_and_access_logs.sql
-- 1. Creates public.document_access_logs for audit logging of uploads and downloads.
-- 2. Blocks all direct client access (anon & authenticated) to plot-documents bucket.
--    All document operations must flow exclusively through backend API handlers.
-- ====================================================================

-- 1. Create Document Access Logs Table
CREATE TABLE IF NOT EXISTS public.document_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID REFERENCES public.listing_drafts(id) ON DELETE SET NULL,
    field_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_hash TEXT,
    actor_id TEXT, -- user_id or 'operator'
    actor_role TEXT NOT NULL DEFAULT 'owner', -- 'owner' | 'operator' | 'system'
    action TEXT NOT NULL DEFAULT 'download',  -- 'upload' | 'download' | 'view'
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance and audit review
CREATE INDEX IF NOT EXISTS idx_doc_access_logs_draft ON public.document_access_logs(draft_id);
CREATE INDEX IF NOT EXISTS idx_doc_access_logs_actor ON public.document_access_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_doc_access_logs_created ON public.document_access_logs(created_at DESC);

-- 2. Row Level Security for Access Logs
-- Audit logs are strictly tamper-resistant and privileged. Neither anonymous users
-- nor authenticated citizens may view or alter the audit trail.
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.document_access_logs FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.document_access_logs TO service_role;

-- 3. Block Direct Client Access to 'plot-documents' Storage Bucket
-- By dropping these policies, direct client-side supabase-js calls
-- (supabase.storage.from('plot-documents').upload/download) are completely BLOCKED.
-- Only server-side routes holding the service-role key (getAdminClient) can touch objects.
DROP POLICY IF EXISTS "Authenticated sellers upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Sellers view own plot documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners upload own plot documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners view own plot documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners update own plot documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners delete own plot documents" ON storage.objects;
