import { NextResponse } from 'next/server';
import { getUserFromRequest, getUserClient, getAdminClient } from '@/lib/authServer';
import { persistListing, normalizeDocuments } from '@/lib/publishListing';

export const dynamic = 'force-dynamic';

// POST /api/drafts/[id]/submit — validate the draft (DB is the source of truth),
// publish it into public.plots, then mark the draft as submitted. Ownership enforced.
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { user, token, error: authError } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized', detail: authError }, { status: 401 });
    }

    const db = getUserClient(token);

    // Read the draft server-side — we validate/publish from persisted data, not
    // from whatever the client posts.
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
    if (draft.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: 'This draft has already been submitted.', plotId: draft.published_plot_id },
        { status: 409 }
      );
    }

    const fd = draft.form_data || {};
    const seller = fd.sellerInfo || {};
    const plot = fd.plotDetails || {};
    const polygonCoordinates = Array.isArray(fd.polygonCoordinates) ? fd.polygonCoordinates : [];

    // Same publish rules as the direct /api/sell path.
    if (!seller.fullName || !seller.phoneNumber) {
      return NextResponse.json({ success: false, error: 'Seller full name and phone number are required.' }, { status: 400 });
    }
    if (!plot.city || !plot.society || !plot.plotNumber || !plot.pricePkr) {
      return NextResponse.json({ success: false, error: 'City, society, plot number and demand price are required.' }, { status: 400 });
    }

    // Publish into sellers + plots with the service-role client (verified uid).
    const dbAdmin = getAdminClient();
    const result = await persistListing(dbAdmin, {
      uid: user.id,
      seller,
      plot,
      polygonCoordinates,
      documents: normalizeDocuments(fd.uploadedFiles),
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    // Mark the draft submitted and link it to the created plot. The plot is visible
    // on the map immediately but stays is_verified=false ("under review") until an
    // admin verifies it — so we record 'submitted', not 'published'.
    const { error: uErr } = await db
      .from('listing_drafts')
      .update({ status: 'submitted', published_plot_id: result.plotId })
      .eq('id', id)
      .eq('user_id', user.id);

    if (uErr) {
      // The plot was created; surface the id even if the status flip failed.
      return NextResponse.json(
        { success: true, plotId: result.plotId, status: 'submitted', warning: `Draft status update failed: ${uErr.message}` },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, plotId: result.plotId, status: 'submitted' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
