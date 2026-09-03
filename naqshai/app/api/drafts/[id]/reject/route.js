import { NextResponse } from 'next/server';
import { getBearerToken, isServiceRoleToken, getAdminClient } from '@/lib/authServer';

export const dynamic = 'force-dynamic';

// POST /api/drafts/[id]/reject — operator-only. Rejects a SUBMITTED listing so the
// owner can correct it and resubmit. No public plot is ever involved (rejected
// listings are never published and never appear on the Explorer). Authenticated
// with the server's service-role key, same as approve.
//
// Body: { reason?: string } — an optional reviewer note stored on the draft and
// surfaced to the owner in the wizard and My Listings.
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    if (!isServiceRoleToken(getBearerToken(request))) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    let body = {};
    try { body = await request.json(); } catch { body = {}; }
    const reason =
      typeof body.reason === 'string' && body.reason.trim()
        ? body.reason.trim().slice(0, 1000)
        : 'Your listing needs corrections before it can be published.';

    const dbAdmin = getAdminClient();

    const { data: draft, error: fErr } = await dbAdmin
      .from('listing_drafts')
      .select('id, status')
      .eq('id', id)
      .maybeSingle();

    if (fErr) {
      return NextResponse.json({ success: false, error: fErr.message }, { status: 500 });
    }
    if (!draft) {
      return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
    }
    if (draft.status !== 'submitted') {
      return NextResponse.json(
        { success: false, error: `Only submitted listings can be rejected (current status: ${draft.status}).` },
        { status: 409 }
      );
    }

    // Flip submitted -> rejected. Guarded by status='submitted' and verified by
    // requiring a returned row, so the transition is only reported when it persists.
    const { data: updated, error: uErr } = await dbAdmin
      .from('listing_drafts')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', id)
      .eq('status', 'submitted')
      .select('id, status, rejection_reason')
      .maybeSingle();

    if (uErr || !updated) {
      return NextResponse.json(
        {
          success: false,
          error: uErr
            ? `Could not reject the listing: ${uErr.message}`
            : 'Could not reject the listing (it was no longer in a submitted state).',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, status: updated.status, rejection_reason: updated.rejection_reason },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
