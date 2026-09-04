import { NextResponse } from 'next/server';
import { getUserFromRequest, getUserClient, getAdminClient } from '@/lib/authServer';

export const dynamic = 'force-dynamic';

// GET /api/drafts/[id] — fetch one draft to resume it. Ownership enforced.
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { user, token, error: authError } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized', detail: authError }, { status: 401 });
    }

    const db = getUserClient(token);
    const { data, error } = await db
      .from('listing_drafts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // never return another owner's draft
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, draft: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/drafts/[id] — autosave. Ownership enforced + last-write-aware conflict check.
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { user, token, error: authError } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized', detail: authError }, { status: 401 });
    }

    let body = {};
    try { body = await request.json(); } catch { body = {}; }

    const db = getUserClient(token);

    // Load the current row for ownership + conflict detection.
    const { data: existing, error: fErr } = await db
      .from('listing_drafts')
      .select('id, user_id, status, updated_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (fErr) {
      return NextResponse.json({ success: false, error: fErr.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
    }
    // A fresh draft or a rejected listing being corrected is editable; a submitted
    // or published listing is read-only.
    if (existing.status !== 'draft' && existing.status !== 'rejected') {
      return NextResponse.json(
        { success: false, error: 'This listing has already been submitted and can no longer be edited.', draft: existing },
        { status: 409 }
      );
    }

    // Last-write-aware conflict: if the server row is newer than the version the
    // client last saw, another device saved in between. Reject rather than clobber.
    if (body.updated_at && existing.updated_at) {
      const clientSeen = new Date(body.updated_at).getTime();
      const serverHas = new Date(existing.updated_at).getTime();
      if (!Number.isNaN(clientSeen) && !Number.isNaN(serverHas) && clientSeen < serverHas) {
        return NextResponse.json(
          { success: false, error: 'conflict', message: 'This draft was updated on another device.', draft: existing },
          { status: 409 }
        );
      }
    }

    const patch = {};
    if (body.form_data && typeof body.form_data === 'object') patch.form_data = body.form_data;
    if (body.current_step != null && Number(body.current_step) > 0) patch.current_step = Number(body.current_step);

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: true, draft: existing }); // nothing to change
    }

    const { data, error } = await db
      .from('listing_drafts')
      .update(patch) // updated_at is refreshed by the DB trigger
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, draft: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/drafts/[id] — explicit user discard (abandoned drafts are never auto-deleted).
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { user, token, error: authError } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized', detail: authError }, { status: 401 });
    }

    const db = getUserClient(token);

    // Load the current row for ownership + status enforcement.
    const { data: existing, error: fErr } = await db
      .from('listing_drafts')
      .select('id, user_id, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (fErr) {
      return NextResponse.json({ success: false, error: fErr.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
    }
    if (existing.status === 'published') {
      const { data: publishedDraft, error: publishedDraftError } = await db
        .from('listing_drafts')
        .select('id, published_plot_id')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (publishedDraftError) {
        return NextResponse.json({ success: false, error: publishedDraftError.message }, { status: 500 });
      }

      if (publishedDraft?.published_plot_id) {
        const { error: plotError } = await getAdminClient()
          .from('plots')
          .delete()
          .eq('id', publishedDraft.published_plot_id);
        if (plotError) {
          return NextResponse.json({ success: false, error: plotError.message }, { status: 500 });
        }
      }

      const { error: publishedDeleteError } = await db
        .from('listing_drafts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('status', 'published');

      if (publishedDeleteError) {
        return NextResponse.json({ success: false, error: publishedDeleteError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    const { error } = await db
      .from('listing_drafts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .in('status', ['draft', 'rejected', 'submitted']); // guard the check->delete window against concurrent changes

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
