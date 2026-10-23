import { NextResponse } from 'next/server';
import { getBearerToken, isOperatorToken } from '@/lib/authServer';
import { getSupabaseAdminClient } from '@/lib/supabaseClient';
import { auditListingDocumentsWithVision } from '@/lib/aiDocumentVerifier';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/review/verify-docs
 * Server-only endpoint gated by operator authentication.
 * Runs Gemini 2.5 Flash Multimodal Vision OCR and cross-matching audit
 * on the uploaded documents for a submitted listing draft.
 */
export async function POST(request) {
  try {
    const token = getBearerToken(request);
    if (!isOperatorToken(token)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const draftId = body.draftId || body.id || body.draft_id;

    if (!draftId) {
      return NextResponse.json(
        { success: false, error: 'A valid draftId must be provided in request body.' },
        { status: 400 }
      );
    }

    const dbAdmin = getSupabaseAdminClient();
    if (!dbAdmin) {
      return NextResponse.json(
        { success: false, error: 'Server database client could not be initialized.' },
        { status: 500 }
      );
    }

    // 1. Fetch draft row from listing_drafts
    const { data: draft, error: fetchErr } = await dbAdmin
      .from('listing_drafts')
      .select('id, form_data, status')
      .eq('id', draftId)
      .maybeSingle();

    if (fetchErr || !draft) {
      return NextResponse.json(
        { success: false, error: fetchErr?.message || 'Listing draft not found.' },
        { status: 404 }
      );
    }

    const formData = draft.form_data || {};

    // 2-5. Run Gemini Vision Document Audit
    const report = await auditListingDocumentsWithVision({
      formData,
      dbAdmin,
    });

    const aiVerifiedAt = new Date().toISOString();

    // 6. Save JSON result back into listing_drafts.form_data under ai_verification_report
    const updatedFormData = {
      ...formData,
      ai_verification_report: report,
      ai_verified_at: aiVerifiedAt,
      aiVerification: report, // Keep sync for backward compatibility
    };

    const { error: updateErr } = await dbAdmin
      .from('listing_drafts')
      .update({
        form_data: updatedFormData,
        updated_at: aiVerifiedAt,
      })
      .eq('id', draftId);

    if (updateErr) {
      console.error('[review/verify-docs] Error persisting report to listing_drafts:', updateErr);
    }

    return NextResponse.json({
      success: true,
      ai_verification_report: report,
      report,
    });
  } catch (err) {
    console.error('[review/verify-docs] Exception:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal error processing AI document audit.' },
      { status: 500 }
    );
  }
}
