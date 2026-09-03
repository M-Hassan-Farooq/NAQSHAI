import { NextResponse } from 'next/server';
import { getBearerToken, isServiceRoleToken, getAdminClient } from '@/lib/authServer';
import { persistListing, normalizeDocuments } from '@/lib/publishListing';

export const dynamic = 'force-dynamic';

// POST /api/drafts/[id]/approve — operator-only. Approves a SUBMITTED listing:
// creates/links the canonical, verified public plot and moves the draft to
// 'published'. This is the ONLY path that ever creates a public plot from the
// draft workflow, which is exactly what keeps submitted/rejected listings off the
// public Explorer (they simply have no plot row until this runs).
//
// There is no user-facing admin role yet, so this endpoint is authenticated with
// the server's Supabase service-role key (never exposed to the browser) rather
// than a user session — an operator calls it to perform verification.
//
// Safety: the plot is created first, then the draft is linked under a
// status='submitted' guard. If the link does not persist (error OR zero rows) we
// roll the just-created plot back and report failure, so we never leave a verified
// plot on the public map without its draft marked published.
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    if (!isServiceRoleToken(getBearerToken(request))) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const dbAdmin = getAdminClient();

    const { data: draft, error: fErr } = await dbAdmin
      .from('listing_drafts')
      .select('*')
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
        { success: false, error: `Only submitted listings can be approved (current status: ${draft.status}).` },
        { status: 409 }
      );
    }

    const fd = draft.form_data || {};
    const seller = fd.sellerInfo || {};
    const plot = fd.plotDetails || {};
    const polygonCoordinates = Array.isArray(fd.polygonCoordinates) ? fd.polygonCoordinates : [];

    // Defensive: a submitted listing should already be complete, but never publish
    // a partial one.
    if (!seller.fullName || !seller.phoneNumber || !plot.city || !plot.society || !plot.plotNumber || !plot.pricePkr) {
      return NextResponse.json(
        { success: false, error: 'This listing is missing required fields and cannot be approved.' },
        { status: 400 }
      );
    }

    // Create the canonical plot for the listing's OWNER (uid = draft.user_id), marked
    // verified so it appears as published/verified on the public map.
    const result = await persistListing(dbAdmin, {
      uid: draft.user_id,
      seller,
      plot,
      polygonCoordinates,
      documents: normalizeDocuments(fd.uploadedFiles),
      isVerified: true,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    // Link the plot and mark the draft published. Guarded by status='submitted' so a
    // double-approval race cannot double-create; verified by requiring a returned row.
    const { data: updated, error: uErr } = await dbAdmin
      .from('listing_drafts')
      .update({ status: 'published', published_plot_id: result.plotId, rejection_reason: null })
      .eq('id', id)
      .eq('status', 'submitted')
      .select('id, status, published_plot_id')
      .maybeSingle();

    if (uErr || !updated) {
      // Roll the new plot back so nothing is left orphaned/public without a published draft.
      const { error: rbErr } = await dbAdmin.from('plots').delete().eq('id', result.plotId);
      if (rbErr) {
        console.error(`[drafts/approve] rollback of plot ${result.plotId} failed:`, rbErr.message);
      }
      return NextResponse.json(
        {
          success: false,
          error: uErr
            ? `Could not finalize approval: ${uErr.message}`
            : 'Could not finalize approval (the listing was no longer in a submitted state). No changes were made.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, status: updated.status, plotId: result.plotId },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
