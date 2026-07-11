-- ============================================================
-- 009_storage_policies.sql
-- Row-Level Security for the product-images storage bucket.
--
-- This enables public read access to product images and restricts
-- write/delete operations to authenticated staff and admins.
-- ============================================================

-- 1. SELECT Policy: Allow anyone (public) to view product images
CREATE POLICY "product_images_read_policy"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- 2. INSERT Policy: Allow authenticated staff and admins to upload images
CREATE POLICY "product_images_upload_policy"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('staff', 'admin')
    )
  );

-- 3. UPDATE Policy: Allow authenticated staff and admins to update images
CREATE POLICY "product_images_update_policy"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('staff', 'admin')
    )
  );

-- 4. DELETE Policy: Allow authenticated staff and admins to delete images
CREATE POLICY "product_images_delete_policy"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('staff', 'admin')
    )
  );
