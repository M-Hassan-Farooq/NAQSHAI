import { NextResponse } from 'next/server';
import { getUserFromRequest, getUserClient } from '@/lib/authServer';
import { checkPolygonConflict } from '@/lib/polygonOverlap';
import { verifyAreaMatch } from '@/lib/areaCalculator';

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

    // Boundary overlap check: prevent submitting a plot that overlaps with any existing plot
    const polygonCoordinates = fd.polygonCoordinates || [];
    if (Array.isArray(polygonCoordinates) && polygonCoordinates.length >= 3) {
      const { data: existingPlots } = await db
        .from('plots')
        .select('id, title, polygon_coordinates');

      const conflict = checkPolygonConflict(polygonCoordinates, existingPlots || [], draft.published_plot_id);
      if (conflict.hasConflict) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot submit listing: Plot boundary overlaps with existing registered plot "${conflict.conflictingPlot?.title || conflict.conflictingPlot?.id}". Overlapping plots are not allowed.`,
          },
          { status: 400 }
        );
      }

      // Geospatial Area Verification: drawn boundary must cover at least 90% of claimed plot area
      const areaCheck = verifyAreaMatch(polygonCoordinates, plot.sizeDimensions || '10 Marla (35x70)', 0.90);
      if (!areaCheck.isValid) {
        // Automatically mark draft as rejected in database with clear audit reasoning
        await db
          .from('listing_drafts')
          .update({
            status: 'rejected',
            rejection_reason: `Automatic Rejection: Drawn plot boundary area (${areaCheck.calculated.sqFt} sq ft) covers only ${areaCheck.percentage}% of claimed plot size (${areaCheck.claimed.sqFt} sq ft). In NAQSHAI, mapped plot boundaries must cover at least 90% (${areaCheck.minRequiredSqFt} sq ft) of claimed land area.`,
          })
          .eq('id', id)
          .eq('user_id', user.id);

        return NextResponse.json(
          {
            success: false,
            status: 'rejected',
            error: `Plot automatically rejected: Drawn boundary area (${areaCheck.calculated.sqFt} sq ft) is only ${areaCheck.percentage}% of claimed ${areaCheck.claimed.sqFt} sq ft. Boundary must cover at least 90% (${areaCheck.minRequiredSqFt} sq ft) of claimed size.`,
          },
          { status: 400 }
        );
      }
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
