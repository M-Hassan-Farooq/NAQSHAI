import { NextResponse } from 'next/server';
import { getUserFromRequest, getUserClient } from '@/lib/authServer';

export const dynamic = 'force-dynamic';

// POST /api/drafts/[id]/submit — move a listing into the "submitted" (awaiting
// verification) state. This is now the ONLY thing submission does:
//   * it does NOT create a public plot, and
//   * it does NOT populate published_plot_id.
// The canonical public plot is created later, only when an operator APPROVES the
// listing (see /api/drafts/[id]/approve). A rejected listing can be corrected and
// resubmitted, so submission is allowed from 'draft' OR 'rejected'.
//
// Validation still runs from persisted data (the DB is the source of truth, never
// the client payload), and the transition MUST verifiably persist — an error OR a
// zero-row update both mean it did not land, and in neither case do we report
// success, so a listing can never be shown as "submitted" while still editable.
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { user, token, error: authError } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized', detail: authError }, { status: 401 });
    }

    const db = getUserClient(token);

    // Read the draft server-side — we validate from persisted data, not client input.
    const { data: draft, error: fErr } = await db
      .from('listing_drafts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (fErr) {
      return NextResponse.json({ success: false, error: fErr.message }, { status: 500 });
    }
    if (!draft) {
      return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
    }
    // Only an editable listing (a fresh draft or a rejected one being corrected) may
    // be submitted. 'submitted' and 'published' are terminal for the owner.
    if (draft.status !== 'draft' && draft.status !== 'rejected') {
      return NextResponse.json(
        { success: false, error: 'This listing has already been submitted and is awaiting verification.' },
        { status: 409 }
      );
    }

    const fd = draft.form_data || {};
    const seller = fd.sellerInfo || {};
    const plot = fd.plotDetails || {};

    // A submission must be complete, even though nothing is published yet.
    if (!seller.fullName || !seller.phoneNumber) {
      return NextResponse.json({ success: false, error: 'Seller full name and phone number are required.' }, { status: 400 });
    }
    if (!plot.city || !plot.society || !plot.plotNumber || !plot.pricePkr) {
      return NextResponse.json({ success: false, error: 'City, society, plot number and demand price are required.' }, { status: 400 });
    }

    // Flip draft/rejected -> submitted. published_plot_id stays NULL (no public plot
    // exists yet) and any prior rejection note is cleared for this fresh review cycle.
    // Guarded to the editable states so a concurrent submit/approve can't be clobbered,
    // and verified (error OR zero rows updated both mean the transition did not persist).
    const { data: updated, error: uErr } = await db
      .from('listing_drafts')
      .update({ status: 'submitted', published_plot_id: null, rejection_reason: null })
      .eq('id', id)
      .eq('user_id', user.id)
      .in('status', ['draft', 'rejected'])
      .select('id, status')
      .maybeSingle();

    if (uErr || !updated) {
      return NextResponse.json(
        {
          success: false,
          error: uErr
            ? `Could not submit your listing: ${uErr.message}`
            : 'Could not submit your listing right now. It is still saved and editable — please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status: updated.status }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
