-- ===================================================
-- NAQSHAI Vector Search Index & Similarity RPC Migration
-- Migration Script: 02_vector_hnsw_index.sql
-- ===================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 2. Add vector embedding column to plots inventory table (768 dimensions)
ALTER TABLE public.plots 
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Add HNSW vector index for ultra-fast similarity search
CREATE INDEX IF NOT EXISTS idx_plots_embedding_hnsw 
ON public.plots 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. Add IVFFlat index fallback for sellers / inventory table
CREATE INDEX IF NOT EXISTS idx_sellers_embedding_ivfflat
ON public.sellers
USING ivfflat (user_id)
WITH (lists = 100);

-- 5. RPC Function: match_plots for Supabase vector similarity search (Strictly 5 items max)
CREATE OR REPLACE FUNCTION match_plots(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.2,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id TEXT,
    title TEXT,
    city TEXT,
    price_pkr NUMERIC,
    size_dimensions TEXT,
    category TEXT,
    flood_risk TEXT,
    noise_level TEXT,
    elevation_profile TEXT,
    proximity_notes TEXT,
    is_verified BOOLEAN,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.title,
        p.city,
        p.price_pkr,
        p.size_dimensions,
        p.category,
        p.flood_risk,
        p.noise_level,
        p.elevation_profile,
        p.proximity_notes,
        p.is_verified,
        1 - (p.embedding <=> query_embedding) AS similarity
    FROM public.plots p
    WHERE p.embedding IS NOT NULL AND (1 - (p.embedding <=> query_embedding)) > match_threshold
    ORDER BY p.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
