-- ============================================================================
-- STUDIO PLATINUM — SECURE SUPABASE SQL SETUP & RLS MIGRATION SCRIPT
-- Run this complete script in the Supabase SQL Editor.
-- This script is fully idempotent (safe to re-run).
-- ============================================================================

-- 1. Create Admin Allowlist Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on admin_users (only accessible by service_role / restricted from client insert/update/delete)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing admin_users policies if any
DROP POLICY IF EXISTS "Deny all client modifications to admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow read admin_users for authenticated" ON public.admin_users;

-- Restrict admin_users table modification entirely to database service_role
CREATE POLICY "Deny all client modifications to admin_users"
ON public.admin_users
FOR ALL
USING (false)
WITH CHECK (false);

-- Allow authenticated users to read their own allowlist record
DROP POLICY IF EXISTS "Allow authenticated read own admin record" ON public.admin_users;
CREATE POLICY "Allow authenticated read own admin record"
ON public.admin_users
FOR SELECT
TO authenticated
USING (email = lower(auth.jwt() ->> 'email'));

-- 2. Helper Security Definer Function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = lower(auth.jwt() ->> 'email')
  );
END;
$$;

-- 2.5. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name_ru TEXT NOT NULL,
  name_lv TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT DEFAULT 'Layers',
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;

CREATE POLICY "Public read active categories"
ON public.categories FOR SELECT
USING (is_active = true OR public.is_admin() = true);

CREATE POLICY "Admins manage categories"
ON public.categories FOR ALL
TO authenticated
USING (public.is_admin() = true)
WITH CHECK (public.is_admin() = true);

-- Seed default categories (5 approved categories)
INSERT INTO public.categories (id, name_ru, name_lv, name_en, icon, is_active, display_order)
VALUES 
  ('console', 'Консоль / Сервант', 'Konsole / Sānu skapis', 'Console / Sideboard', 'Columns3', true, 1),
  ('kitchen', 'Кухня', 'Virtuve', 'Kitchen', 'Home', true, 2),
  ('wardrobe', 'Шкафы / Гардеробная', 'Skapji / Walk-in garderobe', 'Wardrobe / Walk-in Closet', 'PackageOpen', true, 3),
  ('bathroom', 'Мебель для ванной', 'Vannas istabas mēbeles', 'Bathroom Furniture', 'Lamp', true, 4),
  ('custom', 'Другой проект', 'Cits projekts', 'Other Custom Project', 'Sparkles', true, 5)
ON CONFLICT (id) DO UPDATE SET 
  name_ru = EXCLUDED.name_ru,
  name_lv = EXCLUDED.name_lv,
  name_en = EXCLUDED.name_en;

-- 3. Create Portfolio Items Table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  full_description TEXT,
  image_url TEXT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  category TEXT DEFAULT 'dresser',
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  materials TEXT[] DEFAULT ARRAY[]::TEXT[],
  dimensions TEXT,
  width TEXT,
  height TEXT,
  depth TEXT,
  main_material TEXT,
  finish_color TEXT,
  hardware TEXT,
  price_label TEXT,
  availability TEXT,
  year TEXT DEFAULT '2026',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on portfolio items
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- 4. Idempotent RLS Policies for Portfolio Items
DROP POLICY IF EXISTS "View portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admins insert portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admins update portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admins delete portfolio items" ON public.portfolio_items;

-- Public visitors and admins can view published items. Admins can view all items (published & draft).
CREATE POLICY "View portfolio items"
ON public.portfolio_items
FOR SELECT
USING (is_published = true OR public.is_admin() = true);

-- Only authorized admins can insert
CREATE POLICY "Admins insert portfolio items"
ON public.portfolio_items
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin() = true);

-- Only authorized admins can update
CREATE POLICY "Admins update portfolio items"
ON public.portfolio_items
FOR UPDATE
TO authenticated
USING (public.is_admin() = true)
WITH CHECK (public.is_admin() = true);

-- Only authorized admins can delete
CREATE POLICY "Admins delete portfolio items"
ON public.portfolio_items
FOR DELETE
TO authenticated
USING (public.is_admin() = true);

-- 5. Storage Bucket & Policies for portfolio-images (Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Public storage read" ON storage.objects;
DROP POLICY IF EXISTS "Admins storage insert" ON storage.objects;
DROP POLICY IF EXISTS "Admins storage update" ON storage.objects;
DROP POLICY IF EXISTS "Admins storage delete" ON storage.objects;

-- Public read access for published storage objects
CREATE POLICY "Public storage read"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');

-- Only authorized admins can upload storage objects
CREATE POLICY "Admins storage insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-images' AND public.is_admin() = true);

-- Only authorized admins can update storage objects
CREATE POLICY "Admins storage update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio-images' AND public.is_admin() = true)
WITH CHECK (bucket_id = 'portfolio-images' AND public.is_admin() = true);

-- Only authorized admins can delete storage objects
CREATE POLICY "Admins storage delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio-images' AND public.is_admin() = true);

-- 5.5. Storage Bucket & Policies for inquiry-attachments (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inquiry-attachments', 
  'inquiry-attachments', 
  false, 
  8388608, 
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public inquiry upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins inquiry read" ON storage.objects;
DROP POLICY IF EXISTS "Admins inquiry update" ON storage.objects;
DROP POLICY IF EXISTS "Admins inquiry delete" ON storage.objects;

-- Public users (anon & authenticated) can upload inquiry attachments securely
CREATE POLICY "Public inquiry upload"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'inquiry-attachments');

-- Only authorized admins can read private inquiry attachments
CREATE POLICY "Admins inquiry read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'inquiry-attachments' AND public.is_admin() = true);

-- Only authorized admins can update private inquiry attachments
CREATE POLICY "Admins inquiry update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'inquiry-attachments' AND public.is_admin() = true)
WITH CHECK (bucket_id = 'inquiry-attachments' AND public.is_admin() = true);

-- Only authorized admins can delete private inquiry attachments
CREATE POLICY "Admins inquiry delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'inquiry-attachments' AND public.is_admin() = true);

-- ============================================================================
-- 6. CREATE INQUIRIES TABLE & RLS POLICIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  furniture_type TEXT,
  description TEXT NOT NULL,
  budget TEXT,
  preferred_contact TEXT,
  image_url TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on inquiries
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can view inquiries" ON public.inquiries;

-- Anyone (public visitors) can submit inquiries
CREATE POLICY "Anyone can insert inquiries"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authorized admins can view inquiries
CREATE POLICY "Admins can view inquiries"
ON public.inquiries
FOR SELECT
TO authenticated
USING (public.is_admin() = true);

-- ============================================================================
-- 7. BOOTSTRAP AN ADMINISTRATOR (Replace with your actual admin email)
-- ============================================================================
-- INSERT INTO public.admin_users (email)
-- VALUES ('dmitry.mihailovs@gmail.com')
-- ON CONFLICT (email) DO NOTHING;

