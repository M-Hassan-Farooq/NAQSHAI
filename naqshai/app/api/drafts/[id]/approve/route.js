import { NextResponse, after } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getBearerToken, isOperatorToken, getAdminClient } from '@/lib/authServer';
import { normalizeDocuments, persistListing } from '@/lib/publishListing';
import { embedPlotRow } from '@/lib/plotEmbedding';

export const dynamic = 'force-dynamic';

// Best-effort: embed a freshly-approved plot for pgvector semantic search. Never
// throws and never blocks approval — a plot without an embedding simply won't
// appear in vector results until backfilled, and the chatbot falls back to
// recency-based inventory regardless.
async function embedApprovedPlot(dbAdmin, plotId) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !plotId) return;
    const { data: plot, error } = await dbAdmin
      .from('plots')
      .select('id, title, city, category, size_dimensions, proximity_notes, flood_risk, noise_level, elevation_profile')
      .eq('id', plotId)
      .maybeSingle();
    if (error || !plot) return;
    const ai = new GoogleGenAI({ apiKey });
    await embedPlotRow(dbAdmin, ai, plot);
  } catch (err) {
    console.warn('[drafts/approve] embedding notice:', err?.message || err);
  }
}

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
      console.error('[drafts/approve] approve_listing RPC failed:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      const rpcMissing = error.code === '42883' || /approve_listing|function.*does not exist/i.test(error.message || '');
      const isStateConflict = /only submitted/i.test(error.message || '');
      if (rpcMissing) {
        const { data: draft, error: draftError } = await dbAdmin
          .from('listing_drafts')
          .select('id, user_id, status, form_data')
          .eq('id', id)
          .maybeSingle();

        if (draftError) {
          return NextResponse.json({ success: false, error: draftError.message }, { status: 500 });
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

        const formData = draft.form_data || {};
        const published = await persistListing(dbAdmin, {
          uid: draft.user_id,
          seller: formData.sellerInfo || {},
          plot: formData.plotDetails || {},
          polygonCoordinates: formData.polygonCoordinates || [],
          documents: normalizeDocuments(formData.uploadedFiles),
          isVerified: true,
        });

        if (!published.success) {
          return NextResponse.json({ success: false, error: published.error || 'Could not publish this listing.' }, { status: 500 });
        }

        const { data: updatedDraft, error: updateError } = await dbAdmin
          .from('listing_drafts')
          .update({ status: 'published', published_plot_id: published.plotId, rejection_reason: null })
          .eq('id', id)
          .eq('status', 'submitted')
          .select('id')
          .maybeSingle();

        if (updateError || !updatedDraft) {
          await dbAdmin.from('plots').delete().eq('id', published.plotId);
          return NextResponse.json(
            { success: false, error: updateError?.message || 'Could not finalize the approved listing.' },
            { status: 500 }
          );
        }

        // Best-effort semantic-search embedding; runs AFTER the response is sent
        // (next/server `after`) so the operator's approval returns immediately
        // instead of waiting on the Gemini embed + DB round-trips (~0.5-1.5s).
        after(() => embedApprovedPlot(dbAdmin, published.plotId));

        return NextResponse.json({ success: true, status: 'published', plotId: published.plotId }, { status: 200 });
      }
      return NextResponse.json(
        {
          success: false,
          error: rpcMissing
            ? 'Approval is not configured yet. Apply migration 08_atomic_listing_approval.sql in Supabase.'
            : isStateConflict
            ? error.message
            : 'Could not approve this listing.',
        },
        { status: rpcMissing ? 503 : isStateConflict ? 409 : 500 }
      );
    }

    const approved = Array.isArray(data) ? data[0] : data;
    if (!approved?.plot_id) {
      return NextResponse.json({ success: false, error: 'Approval did not return a published plot.' }, { status: 500 });
    }

    // Best-effort semantic-search embedding; runs AFTER the response is sent
    // (next/server `after`) so the operator's approval returns immediately
    // instead of waiting on the Gemini embed + DB round-trips (~0.5-1.5s).
    after(() => embedApprovedPlot(dbAdmin, approved.plot_id));

    return NextResponse.json(
      { success: true, status: 'published', plotId: approved.plot_id },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
