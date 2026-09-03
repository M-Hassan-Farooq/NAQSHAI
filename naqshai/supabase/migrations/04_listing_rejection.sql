-- ==========================================
-- NAQSHAI Supabase Migration: 04_listing_rejection.sql
-- Adds the REJECTED state to the listing workflow.
-- ==========================================
--
-- Workflow:  draft -> submitted -> published (approved)  |  rejected
--
-- listing_drafts.status is already a free-text TEXT column with NO CHECK
-- constraint (see 02_listing_drafts.sql), so it can already hold 'rejected'
-- without any column change. The one field genuinely NEEDED for the rejected
-- state is somewhere to record WHY a listing was rejected, so the owner can
-- correct it and resubmit. That single additive column is this migration's only
-- change — it is idempotent and safe to run against existing data.

ALTER TABLE public.listing_drafts
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Documentation only (keeps the schema self-describing; no behavioural change).
COMMENT ON COLUMN public.listing_drafts.status IS
    'draft | submitted | published | rejected';
COMMENT ON COLUMN public.listing_drafts.rejection_reason IS
    'Set when status = rejected: the reviewer note shown to the owner so they can correct and resubmit. Cleared on (re)submit and on approval.';

-- No RLS changes are required:
--   * Owners already read every column of their own drafts (incl. rejection_reason)
--     via the existing "Owners read own drafts" SELECT policy.
--   * Approve/reject transitions run with the service-role client, which bypasses RLS.
