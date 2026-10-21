import { NextResponse } from 'next/server';
import { getBearerToken, isOperatorToken, getAdminClient } from '@/lib/authServer';
import { verifyListingDocuments } from '@/lib/aiDocumentVerifier';

export const dynamic = 'force-dynamic';

// POST /api/review/[id]/verify — Operator-only endpoint.
// Triggers or re-runs Multimodal AI Document Verification for a submitted draft.
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    if (!isOperatorToken(getBearerToken(request))) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const dbAdmin = getAdminClient();

    const { data: draft, error: fetchErr } = await dbAdmin
      .from('listing_drafts')
      .select('id, form_data, status')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !draft) {
      return NextResponse.json({ success: false, error: 'Draft not found.' }, { status: 404 });
    }

    const formData = draft.form_data || {};

    // Execute verification
    const aiVerification = await verifyListingDocuments({
      formData,
      dbAdmin
    });

    // Persist result into form_data.aiVerification
    const updatedFormData = {
      ...formData,
      aiVerification
    };

    const { error: updateErr } = await dbAdmin
      .from('listing_drafts')
      .update({
        form_data: updatedFormData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateErr) {
      console.error('[review/verify] Failed to persist verification result:', updateErr);
    }

    return NextResponse.json({
      success: true,
      aiVerification
    });
  } catch (err) {
    console.error('[review/verify] Exception running AI verification:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'AI verification failed.' },
      { status: 500 }
    );
  }
}
