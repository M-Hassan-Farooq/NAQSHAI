import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getBearerToken, isOperatorToken, getAdminClient } from '@/lib/authServer';
import { embedPlotRow } from '@/lib/plotEmbedding';

export const dynamic = 'force-dynamic';

// POST /api/embeddings/backfill — operator-only. Computes and stores pgvector
// embeddings for existing plots that don't have one yet, so semantic search
// (match_plots) can find listings that were approved before the embedding
// pipeline existed. New approvals embed themselves in the approve route; this
// endpoint exists to catch up the historical backlog.
//
// Idempotent and resumable: it only touches rows WHERE embedding IS NULL, so
// re-running continues where a prior run stopped. Bounded per call (default 25,
// max 100) so a single request can't exhaust the Gemini quota or time out on a
// large inventory — call repeatedly until { remaining: 0 }.
export async function POST(request) {
  try {
    if (!isOperatorToken(getBearerToken(request))) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 503 }
      );
    }

    let limit = 25;
    try {
      const body = await request.json();
      const requested = Number(body?.limit);
      if (Number.isFinite(requested) && requested > 0) {
        limit = Math.min(Math.floor(requested), 100);
      }
    } catch {
      // No/invalid JSON body — keep the default limit.
    }

    const dbAdmin = getAdminClient();
    const ai = new GoogleGenAI({ apiKey });

    // Pull one bounded batch of plots that still lack an embedding.
    const { data: plots, error } = await dbAdmin
      .from('plots')
      .select('id, title, city, category, size_dimensions, proximity_notes, flood_risk, noise_level, elevation_profile')
      .is('embedding', null)
      .limit(limit);

    if (error) {
      // A missing embedding column (migration 02 not applied) surfaces here.
      return NextResponse.json(
        { success: false, error: error.message, hint: 'Apply migration 02_vector_hnsw_index.sql first.' },
        { status: 500 }
      );
    }

    if (!plots || plots.length === 0) {
      return NextResponse.json(
        { success: true, embedded: 0, failed: 0, remaining: 0, message: 'All plots are already embedded.' },
        { status: 200 }
      );
    }

    let embedded = 0;
    let failed = 0;
    for (const plot of plots) {
      const ok = await embedPlotRow(dbAdmin, ai, plot);
      if (ok) embedded += 1;
      else failed += 1;
    }

    // How many still lack an embedding after this batch (drives repeat calls).
    const { count: remaining } = await dbAdmin
      .from('plots')
      .select('id', { count: 'exact', head: true })
      .is('embedding', null);

    return NextResponse.json(
      {
        success: true,
        embedded,
        failed,
        remaining: typeof remaining === 'number' ? remaining : null,
        message:
          remaining && remaining > 0
            ? `Embedded ${embedded} plot(s). ${remaining} remaining — call again to continue.`
            : `Embedded ${embedded} plot(s). Backfill complete.`,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[embeddings/backfill] Exception:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
