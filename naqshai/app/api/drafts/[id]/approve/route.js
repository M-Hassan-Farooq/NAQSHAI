import { NextResponse } from 'next/server';
import { getBearerToken, isOperatorToken, getAdminClient } from '@/lib/authServer';

export const dynamic = 'force-dynamic';

// POST /api/drafts/[id]/approve — operator-only. Approves a SUBMITTED listing:
// creates/links the canonical, verified public plot and moves the draft to
// 'published'. This is the ONLY path that ever creates a public plot from the
// draft workflow, which is exactly what keeps submitted/rejected listings off the
// public Explorer (they simply have no plot row until this runs).
//
// There is no user-facing admin role yet, so this endpoint is authenticated with
// an operator secret (the shared review passphrase, or the server's Supabase
// service-role key) — never a normal user session — and the privileged work runs
// through getAdminClient(), whose key never reaches the browser.
//
// Safety: the plot is created first, then the draft is linked under a
// status='submitted' guard. If the link does not persist (error OR zero rows) we
// roll the just-created plot back and report failure, so we never leave a verified
// plot on the public map without its draft marked published.
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    if (!isOperatorToken(getBearerToken(request))) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const dbAdmin = getAdminClient();

    const { data, error } = await dbAdmin.rpc('approve_listing', { p_draft_id: id });

    if (error) {
      const isStateConflict = /only submitted/i.test(error.message || '');
      return NextResponse.json(
        { success: false, error: isStateConflict ? error.message : 'Could not approve this listing.' },
        { status: isStateConflict ? 409 : 500 }
      );
    }

    const approved = Array.isArray(data) ? data[0] : data;
    if (!approved?.plot_id) {
      return NextResponse.json({ success: false, error: 'Approval did not return a published plot.' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, status: 'published', plotId: approved.plot_id },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
