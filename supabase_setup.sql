-- ========================================================
-- Supabase Setup Script (Tailored to your database)
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vdhpzgvyesnotpaifdug/sql/new
-- ========================================================

-- 1. Ensure colleges and pg_listings tables have necessary columns
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT ARRAY['WiFi', 'Food', 'Security'];

-- 2. Grant permissions to API roles (fixes "permission denied" errors)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.colleges TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.pg_listings TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 3. Enable Row Level Security and Public Policies
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pg_listings ENABLE ROW LEVEL SECURITY;

-- Colleges: Read
DROP POLICY IF EXISTS "Allow public read on colleges" ON public.colleges;
CREATE POLICY "Allow public read on colleges" 
    ON public.colleges 
    FOR SELECT 
    TO anon, authenticated, service_role 
    USING (true);

-- PG Listings: Read
DROP POLICY IF EXISTS "Allow public read on pg_listings" ON public.pg_listings;
CREATE POLICY "Allow public read on pg_listings" 
    ON public.pg_listings 
    FOR SELECT 
    TO anon, authenticated, service_role 
    USING (true);

-- PG Listings: Insert (allows adding PGs from the "List a PG" form)
DROP POLICY IF EXISTS "Allow public insert on pg_listings" ON public.pg_listings;
CREATE POLICY "Allow public insert on pg_listings" 
    ON public.pg_listings 
    FOR INSERT 
    TO anon, authenticated, service_role 
    WITH CHECK (true);

-- 4. Create the 'pgs' view linking pg_listings to colleges with real GPS distances
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
    p.area,
    COALESCE(p.image_url, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80') AS image_url,
    COALESCE(p.amenities, ARRAY['WiFi', 'Food', 'AC', 'Laundry', 'Security']::text[]) AS amenities
FROM public.pg_listings p
CROSS JOIN public.colleges c;

-- 5. Grant access to the view
GRANT SELECT ON public.pgs TO anon, authenticated, service_role;

-- 6. Sample Bangalore PGs across major hubs with pictures & coordinates
INSERT INTO public.pg_listings (name, gender, rent, rating, lat, lng, area, image_url, amenities)
VALUES
-- Koramangala
(
  'Stanza Living Boston House',
  'Coliving',
  16500,
  4.7,
  12.9352,
  77.6245,
  'Koramangala 4th Block',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
  ARRAY['WiFi', 'Food', 'AC', 'Gym', 'Laundry', '24/7 Security', 'Housekeeping']
),
(
  'Sri Sai Luxury Ladies PG',
  'Ladies',
  8500,
  4.5,
  12.9310,
  77.6160,
  'Koramangala 7th Block',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
  ARRAY['WiFi', 'Food', '24/7 Security', 'Hot Water', 'Laundry']
),

-- HSR Layout
(
  'Zolo Amber Coliving',
  'Coliving',
  14000,
  4.6,
  12.9121,
  77.6446,
  'HSR Layout Sector 2',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  ARRAY['WiFi', 'AC', 'Food', 'Parking', 'Housekeeping']
),
(
  'Venkateshwara Gents PG',
  'Gents',
  7500,
  4.2,
  12.9165,
  77.6520,
  'HSR Layout Sector 1',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
  ARRAY['WiFi', 'Food', 'Hot Water', 'Parking']
),

-- Mathikere / Yeshwanthpur (near Ramaiah Institute of Technology)
(
  'Ramaiah Premium Student Living',
  'Gents',
  11000,
  4.8,
  13.0315,
  77.5645,
  'Mathikere',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
  ARRAY['WiFi', 'Food', 'Gym', 'Laundry', '24/7 Security']
),
(
  'Green View Ladies PG',
  'Ladies',
  8000,
  4.4,
  13.0280,
  77.5590,
  'Mathikere',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
  ARRAY['WiFi', 'Food', '24/7 Security', 'Hot Water']
),

-- Electronic City
(
  'Silicon Oasis Coliving',
  'Coliving',
  12500,
  4.5,
  12.8452,
  77.6602,
  'Electronic City Phase 1',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  ARRAY['WiFi', 'AC', 'Food', 'Gym', 'Parking']
),

-- Whitefield
(
  'Cosmo Stay Ladies PG',
  'Ladies',
  9500,
  4.3,
  12.9698,
  77.7499,
  'Whitefield',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  ARRAY['WiFi', 'Food', '24/7 Security', 'Laundry', 'Power Backup']
),

-- BTM Layout
(
  'Balaji Executive Gents PG',
  'Gents',
  7000,
  4.1,
  12.9166,
  77.6101,
  'BTM 2nd Stage',
  'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=800&q=80',
  ARRAY['WiFi', 'Food', 'Parking', 'Hot Water']
);
