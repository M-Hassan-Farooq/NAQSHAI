-- ==========================================
-- NAQSHAI Supabase Database Schema Migration
-- Migration Script: 01_schema.sql
-- ==========================================

-- 1. Create Sellers (User Profiles) Table
CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    seller_role TEXT DEFAULT 'Direct Owner', -- e.g., 'Direct Owner', 'Real Estate Agency'
    is_identity_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Plots Table
CREATE TABLE IF NOT EXISTS public.plots (
    id TEXT PRIMARY KEY, -- e.g., "Plot-101"
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    title TEXT NOT NULL, -- e.g., "Block A, Gulberg Greens"
    city TEXT NOT NULL, -- e.g., "Islamabad"
    price_pkr NUMERIC NOT NULL, -- Raw number, e.g., 18500000
    size_dimensions TEXT NOT NULL, -- e.g., "1 Kanal (50x90)"
    category TEXT DEFAULT 'Residential', -- e.g., "Residential", "Commercial"
    flood_risk TEXT DEFAULT 'Low Hazard', -- e.g., "Low Hazard"
    noise_level TEXT DEFAULT 'Low (Quiet Zone)', -- e.g., "Low (Quiet Zone)"
    elevation_profile TEXT DEFAULT 'High Ridge (Optimal)', -- e.g., "High Ridge (Optimal)"
    proximity_notes TEXT, -- e.g., "200m from Main Expressway, 500m from Mosque"
    polygon_coordinates JSONB NOT NULL DEFAULT '[]'::jsonb, -- 4-corner interactive map boundary drawings
    documents JSONB DEFAULT '[]'::jsonb, -- Array of file paths pointing to uploaded Allotment Letter / CNIC in Supabase Storage
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for optimized querying
CREATE INDEX IF NOT EXISTS idx_plots_city ON public.plots(city);
CREATE INDEX IF NOT EXISTS idx_plots_category ON public.plots(category);
CREATE INDEX IF NOT EXISTS idx_plots_seller_id ON public.plots(seller_id);
CREATE INDEX IF NOT EXISTS idx_plots_price ON public.plots(price_pkr);

-- Automatic Timestamp Update Trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_sellers_modtime
    BEFORE UPDATE ON public.sellers
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE OR REPLACE TRIGGER update_plots_modtime
    BEFORE UPDATE ON public.plots
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();


-- ==========================================
-- 3. Row Level Security (RLS) Configuration
-- ==========================================

-- Enable RLS on sellers and plots
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

-- Permissive RLS Policies for 'sellers'
DROP POLICY IF EXISTS "Public sellers read access" ON public.sellers;
CREATE POLICY "Public sellers read access" 
    ON public.sellers 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Allow public insert to sellers" ON public.sellers;
CREATE POLICY "Allow public insert to sellers" 
    ON public.sellers 
    FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to sellers" ON public.sellers;
CREATE POLICY "Allow public update to sellers" 
    ON public.sellers 
    FOR UPDATE 
    USING (true);

-- Permissive RLS Policies for 'plots'
DROP POLICY IF EXISTS "Public plots read access" ON public.plots;
CREATE POLICY "Public plots read access" 
    ON public.plots 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Allow public insert to plots" ON public.plots;
CREATE POLICY "Allow public insert to plots" 
    ON public.plots 
    FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to plots" ON public.plots;
CREATE POLICY "Allow public update to plots" 
    ON public.plots 
    FOR UPDATE 
    USING (true);

DROP POLICY IF EXISTS "Allow public delete to plots" ON public.plots;
CREATE POLICY "Allow public delete to plots" 
    ON public.plots 
    FOR DELETE 
    USING (true);


-- ==========================================
-- 4. Supabase Storage Bucket & RLS Setup
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('plot-documents', 'plot-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated sellers upload documents" ON storage.objects;
CREATE POLICY "Authenticated sellers upload documents"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'plot-documents');

DROP POLICY IF EXISTS "Sellers view own plot documents" ON storage.objects;
CREATE POLICY "Sellers view own plot documents"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'plot-documents');
