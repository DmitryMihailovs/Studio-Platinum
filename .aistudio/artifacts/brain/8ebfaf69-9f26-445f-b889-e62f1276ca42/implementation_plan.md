# Studio Platinum — Revised Secure Supabase Plan & Security Architecture

A revised architectural plan for upgrading Studio Platinum to an authenticated portfolio management system with strict **PostgreSQL Row Level Security (RLS)** administrator allowlist enforcement.

---

## 1. Administrator Authorization & Security Model

To ensure that authentication alone (`authenticated` role) does not grant write access:
1. **Admin Allowlist Table (`public.admin_users`)**:
   - A dedicated PostgreSQL table storing authorized administrator emails (`email TEXT PRIMARY KEY`).
2. **PostgreSQL Security Definer Function (`public.is_admin()`)**:
   - A secure function that checks whether `auth.jwt() ->> 'email'` exists in `public.admin_users`.
3. **RLS Policies with `USING` and `WITH CHECK`**:
   - All `INSERT`, `UPDATE`, and `DELETE` operations on `public.portfolio_items` and `storage.objects` strictly require `public.is_admin() = true`.
4. **First-Admin Setup Process**:
   - Administrators create their login via the Supabase Auth Dashboard (or sign up with an allowed email). The database owner or service role inserts their email into `public.admin_users` via the Supabase SQL Editor. No passwords or service keys are ever exposed in frontend client code.

---

## 2. Revised SQL Schema, RLS & Storage Policies

Execute this complete SQL script in your Supabase SQL Editor:

```sql
-- 1. Create Admin Allowlist Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on admin_users (only accessible by service_role)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

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
    WHERE email = (auth.jwt() ->> 'email')
  );
END;
$$;

-- 3. Create Portfolio Items Table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'dresser',
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  materials TEXT[],
  dimensions TEXT,
  year TEXT DEFAULT '2026',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on portfolio items
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Portfolio Items
-- Public visitors and admins can view published items. Admins can view all items.
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

-- 5. Storage Bucket & Policies for portfolio-images
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for storage objects
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
```

---

## 3. Fallback Mechanism & Safety Safeguards

1. **Local Portfolio Fallback**:
   - If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not configured in `.env`, the app automatically falls back to `initialPortfolioItems` (`images/1.jpeg` through `images/15.jpg`) and local storage.
   - A clear indicator badge will distinguish whether the app is running in **Live Supabase Mode** or **Local Fallback Prototype Mode**.
2. **Preservation of Existing AdminModal**:
   - The current `src/components/AdminModal.tsx` will remain untouched until the new Supabase `AdminPanel.tsx` is fully tested and verified.

---

## 4. Exact File Change List

### A. New Files to Create (2 files):
1. `src/lib/supabase.ts` — *Supabase client instance and API query helpers*
2. `src/components/AdminPanel.tsx` — *Authenticated admin dashboard with Supabase Auth login, portfolio CRUD, image upload, and reordering*

### B. Files to Modify (3 files):
1. `package.json` — *Add `@supabase/supabase-js`*
2. `src/types/index.ts` — *Add portfolio row and session types*
3. `src/App.tsx` — *Integrate Supabase client fetch with local fallback and open `AdminPanel`*

---

## Approval Request

Please review this revised security model, allowlist design, and RLS policies. When you approve, we will install `@supabase/supabase-js` and build the secure integration.
