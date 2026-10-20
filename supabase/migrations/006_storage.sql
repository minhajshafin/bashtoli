-- ============================================================
-- 006_storage.sql
-- Storage bucket configuration and security policies for product images.
-- ============================================================

-- ── 1. Create product-images storage bucket ──────────────────
-- Public bucket allows direct image serving via CDN/public URLs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── 2. Storage Object Security Policies ──────────────────────

-- Disallow anonymous listing of bucket contents (prevents scraping)
-- Authenticated staff/admins can list/select metadata from storage.objects
DROP POLICY IF EXISTS "product_images_read_policy" ON storage.objects;
DROP POLICY IF EXISTS "product_images_staff_read_policy" ON storage.objects;
CREATE POLICY "product_images_staff_read_policy"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND app_private.is_staff_or_admin()
  );

-- Only authenticated staff/admin can upload images
DROP POLICY IF EXISTS "product_images_upload_policy" ON storage.objects;
CREATE POLICY "product_images_upload_policy"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND app_private.is_staff_or_admin()
  );

-- Only authenticated staff/admin can update images
DROP POLICY IF EXISTS "product_images_update_policy" ON storage.objects;
CREATE POLICY "product_images_update_policy"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND app_private.is_staff_or_admin()
  );

-- Only authenticated staff/admin can delete images
DROP POLICY IF EXISTS "product_images_delete_policy" ON storage.objects;
CREATE POLICY "product_images_delete_policy"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND app_private.is_staff_or_admin()
  );


-- ── 3. Table Grants & Privilege Hardening ──────────────────
-- Restrict authenticated UPDATE on public.orders to status column only.
-- Prevents tampering with price, totals, items, user_id, or recipient details.
REVOKE UPDATE ON public.orders FROM anon, authenticated;
GRANT UPDATE (status) ON public.orders TO authenticated;

-- Revoke all direct PostgREST privileges on sensitive tables from anon role.
REVOKE ALL ON public.orders, public.order_items, public.order_status_history, public.profiles FROM anon;

-- Revoke high-risk administrative privileges from non-service roles.
REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

