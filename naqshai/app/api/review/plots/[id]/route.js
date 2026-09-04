import { NextResponse } from 'next/server';
import { getBearerToken, isOperatorToken, getAdminClient } from '@/lib/authServer';

export const dynamic = 'force-dynamic';

// DELETE /api/review/plots/[id] - operator-only removal of a live verified plot.
export async function DELETE(request, { params }) {
  try {
    if (!isOperatorToken(getBearerToken(request))) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const dbAdmin = getAdminClient();
    const { data: plot, error: findError } = await dbAdmin
      .from('plots')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ success: false, error: findError.message }, { status: 500 });
    }
    if (!plot) {
      return NextResponse.json({ success: false, error: 'Verified plot not found.' }, { status: 404 });
    }

    const { data: linkedDrafts, error: linkedDraftError } = await dbAdmin
      .from('listing_drafts')
      .select('id')
      .eq('published_plot_id', id);

    if (linkedDraftError) {
      return NextResponse.json({ success: false, error: linkedDraftError.message }, { status: 500 });
    }

    const { error: deleteError } = await dbAdmin.from('plots').delete().eq('id', id);
    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    const linkedDraftIds = (linkedDrafts || []).map((draft) => draft.id);
    const { error: draftError } = linkedDraftIds.length
      ? await dbAdmin
          .from('listing_drafts')
          .update({
            status: 'rejected',
            published_plot_id: null,
            rejection_reason: 'This verified listing was removed from the marketplace by the operator.',
          })
          .in('id', linkedDraftIds)
      : { error: null };

    if (draftError) {
      console.error('[review/plots] Removed plot but could not update linked draft:', draftError.message);
    }

    return NextResponse.json({ success: true, removedId: id });
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}