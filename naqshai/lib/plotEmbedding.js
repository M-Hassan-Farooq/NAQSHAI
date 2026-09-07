// Shared plot-embedding helpers for pgvector semantic search.
//
// The embedding model supports 768-dimensional output vectors,
// matching the `plots.embedding vector(768)` column (02_vector_hnsw_index.sql).
// We pin outputDimensionality: 768 defensively so a future model default change
// can't silently produce a mismatched vector.
//
// IMPORTANT (@google/genai v2.19.0 response shape): embedContent returns
//   { embeddings: ContentEmbedding[] }  // NOTE: plural array
// so the vector lives at `res.embeddings[0].values`. The older singular
// `res.embedding.values` shape does NOT exist in this SDK version.

import { computeEnvironmentalMetrics } from './environmentalMetrics';

export const EMBEDDING_MODEL = 'gemini-embedding-001';
export const EMBEDDING_DIMENSIONS = 768;

// Build the natural-language text we embed for a plot. Mirrors the fields the
// chatbot reasons over so semantic search matches how users actually ask.
export function buildPlotEmbeddingText(plot) {
  if (!plot || typeof plot !== 'object') return '';

  const isPending = (val) => !val || typeof val !== 'string' || val.toLowerCase().includes('pending') || val === 'n/a';

  let flood = plot.flood_risk;
  let noise = plot.noise_level;
  let elev = plot.elevation_profile;

  if (isPending(flood) || isPending(noise) || isPending(elev)) {
    const env = computeEnvironmentalMetrics(plot);
    if (isPending(flood)) flood = env.floodRisk;
    if (isPending(noise)) noise = env.noiseLevel;
    if (isPending(elev)) elev = env.elevationProfile;
  }

  const parts = [
    plot.title,
    plot.city,
    plot.category,
    plot.size_dimensions,
    plot.proximity_notes,
    flood ? `flood risk: ${flood}` : '',
    noise ? `noise level: ${noise}` : '',
    elev ? `elevation: ${elev}` : '',
  ];
  return parts
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean)
    .join('. ');
}

// Embed a piece of text and return a plain number[] of length EMBEDDING_DIMENSIONS,
// or null if embedding fails / returns an unexpected shape.
export async function embedText(ai, text) {
  if (!ai || !text || typeof text !== 'string' || !text.trim()) return null;
  try {
    const res = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
      config: { outputDimensionality: EMBEDDING_DIMENSIONS },
    });
    const values = res?.embeddings?.[0]?.values;
    if (Array.isArray(values) && values.length > 0) return values;
    return null;
  } catch (err) {
    console.warn('[plotEmbedding] embedText failed:', err?.message || err);
    return null;
  }
}

// Compute and persist the embedding for a single plot row using a privileged
// (service-role) client. Best-effort: returns true on success, false otherwise,
// and never throws — callers treat embedding as non-critical to their main flow.
export async function embedPlotRow(dbAdmin, ai, plot) {
  try {
    if (!plot?.id) return false;
    const text = buildPlotEmbeddingText(plot);
    if (!text) return false;
    const vector = await embedText(ai, text);
    if (!vector) return false;

    const { error } = await dbAdmin
      .from('plots')
      .update({ embedding: vector })
      .eq('id', plot.id);

    if (error) {
      console.warn('[plotEmbedding] embedding update failed for plot', plot.id, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[plotEmbedding] embedPlotRow exception:', err?.message || err);
    return false;
  }
}
