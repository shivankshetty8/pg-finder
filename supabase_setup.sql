-- ========================================================
-- Supabase Setup Script (Tailored to your database)
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vdhpzgvyesnotpaifdug/sql/new
-- ========================================================

-- 1. Ensure colleges table has 'area' column (used by the frontend)
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS area TEXT;

-- 2. Grant permissions to API roles (fixes "permission denied for table colleges")
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.colleges TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.pg_listings TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 3. Enable Row Level Security and Public Read Policies
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pg_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on colleges" ON public.colleges;
CREATE POLICY "Allow public read on colleges" 
    ON public.colleges 
    FOR SELECT 
    TO anon, authenticated, service_role 
    USING (true);

DROP POLICY IF EXISTS "Allow public read on pg_listings" ON public.pg_listings;
CREATE POLICY "Allow public read on pg_listings" 
    ON public.pg_listings 
    FOR SELECT 
    TO anon, authenticated, service_role 
    USING (true);

-- 4. Create the 'pgs' view linking your pg_listings to colleges with real GPS distances
CREATE OR REPLACE VIEW public.pgs AS
SELECT 
    p.id,
    p.name,
    p.gender,
    p.rent,
    COALESCE(p.rating, 4.5) AS rating,
    ROUND(CAST(
        CASE 
            WHEN c.lat IS NOT NULL AND c.lng IS NOT NULL AND p.lat IS NOT NULL AND p.lng IS NOT NULL THEN
                6371 * acos(
                    least(1.0, greatest(-1.0,
                        cos(radians(c.lat)) * cos(radians(p.lat)) * 
                        cos(radians(p.lng) - radians(c.lng)) + 
                        sin(radians(c.lat)) * sin(radians(p.lat))
                    ))
                )
            ELSE 1.2
        END AS numeric
    ), 1) AS distance_km,
    c.id AS college_id,
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80' AS image_url,
    ARRAY['WiFi', 'Food', 'AC', 'Laundry', 'Security']::text[] AS amenities
FROM public.pg_listings p
CROSS JOIN public.colleges c;

-- 5. Grant access to the view
GRANT SELECT ON public.pgs TO anon, authenticated, service_role;
