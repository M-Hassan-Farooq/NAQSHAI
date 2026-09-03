import { NextResponse } from 'next/server';
import { getUserFromRequest, getUserClient } from '@/lib/authServer';
import { computeDraftProgress, draftTitlePreview } from '@/lib/draftProgress';

// Never cache; drafts are per-user and change constantly.
export const dynamic = 'force-dynamic';

// GET /api/drafts — list the authenticated user's drafts for the dashboard.
export async function GET(request) {
  try {
    const { user, token, error: authError } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized', detail: authError }, { status: 401 });
    }

    const db = getUserClient(token);
    const { data, error } = await db
      .from('listing_drafts')
      .select('id, status, current_step, form_data, published_plot_id, rejection_reason, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const rows = data || [];

    // For submitted drafts, look up whether the linked plot has been verified so we
    // can honestly distinguish "submitted / under review" from "published".
    const linkedIds = rows.map((r) => r.published_plot_id).filter(Boolean);
    const verifiedMap = {};
    if (linkedIds.length) {
      const { data: plotRows } = await db
        .from('plots')
        .select('id, is_verified')
        .in('id', linkedIds);
      (plotRows || []).forEach((p) => { verifiedMap[p.id] = p.is_verified; });
    }

    const drafts = rows.map((d) => {
      let lifecycle = 'draft';
      if (d.published_plot_id) {
        lifecycle = verifiedMap[d.published_plot_id] ? 'published' : 'submitted';
      } else if (d.status && d.status !== 'draft') {
        lifecycle = d.status;
      }
      return {
        id: d.id,
        status: d.status,
        lifecycle,
        current_step: d.current_step,
        published_plot_id: d.published_plot_id,
        rejection_reason: d.rejection_reason || null,
        progress: computeDraftProgress(d.form_data),
        title: draftTitlePreview(d.form_data),
        created_at: d.created_at,
        updated_at: d.updated_at,
      };
    });

    return NextResponse.json({ success: true, drafts });
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/drafts — create a new draft owned by the authenticated user.
export async function POST(request) {
  try {
    const { user, token, error: authError } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized', detail: authError }, { status: 401 });
    }

    let body = {};
    try { body = await request.json(); } catch { body = {}; }

    const insertRow = {
      user_id: user.id, // ownership is bound to the verified token, not the body
      status: 'draft',
      current_step: Number(body.current_step) > 0 ? Number(body.current_step) : 1,
      form_data: body.form_data && typeof body.form_data === 'object' ? body.form_data : {},
    };

    const db = getUserClient(token);
    const { data, error } = await db
      .from('listing_drafts')
      .insert([insertRow])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, draft: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
