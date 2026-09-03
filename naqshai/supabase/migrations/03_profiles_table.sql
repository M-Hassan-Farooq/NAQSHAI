-- ==========================================
-- NAQSHAI Supabase Migration: 03_profiles_table.sql
-- Dedicated Profiles Table for Persistent User Details
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Permissive RLS Policies for 'profiles'
DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;
CREATE POLICY "Public profiles read access" 
    ON public.profiles 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert/update to profiles" ON public.profiles;
CREATE POLICY "Allow authenticated insert/update to profiles" 
    ON public.profiles 
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Automatic Timestamp Update Trigger
CREATE OR REPLACE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
