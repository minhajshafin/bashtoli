-- ============================================================
-- 017_fix_supabase_linter_warnings.sql
--
-- Resolves all Supabase database linter warnings:
--
-- 1. function_search_path_mutable:
--    Explicitly sets `search_path = public` on all functions:
--    - set_updated_at()
--    - generate_order_number()
--    - prevent_audit_log_modification()
--    - set_hero_slides_updated_at()
--    - increment_stock()
--    - cart_add_or_increment()
--
-- 2. public_bucket_allows_listing:
--    Replaces broad SELECT on storage.objects with staff/admin-only
--    listing policy. Public image asset URLs remain fully accessible.
--
-- 3. anon_security_definer_function_executable &
--    authenticated_security_definer_function_executable:
--    - Revokes direct PostgREST RPC execute from anon/authenticated on:
--      * handle_new_user() (trigger-only function)
--      * increment_stock() (service_role only)
--      * generate_order_number() (service_role only)
--      * place_order() (service_role only)
--      * set_updated_at(), set_hero_slides_updated_at(), prevent_audit_log_modification()
--    - cart_add_or_increment(): switched to SECURITY INVOKER with EXECUTE revoked from anon
--    - is_admin() & is_staff_or_admin(): revoked from anon; catalog RLS
--      policies updated so anon never evaluates is_staff_or_admin().
-- ============================================================


-- ============================================================
-- 1. FIX MUTABLE SEARCH PATHS & REVOKE TRIGGER EXECUTE
-- ============================================================

-- ── set_updated_at ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- ── set_hero_slides_updated_at ───────────────────────────────
CREATE OR REPLACE FUNCTION public.set_hero_slides_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_hero_slides_updated_at() FROM PUBLIC, anon, authenticated;

-- ── prevent_audit_log_modification ───────────────────────────
CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'admin_audit_log rows are immutable and cannot be modified or deleted.';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_audit_log_modification() FROM PUBLIC, anon, authenticated;

-- ── handle_new_user (auth trigger) ───────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    'customer'
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ── generate_order_number ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  date_str  text;
  lock_key  bigint;
  next_seq  integer;
BEGIN
  date_str := to_char(CURRENT_DATE, 'YYYYMMDD');
  lock_key  := date_str::bigint;

  PERFORM pg_advisory_xact_lock(lock_key);

  SELECT COALESCE(MAX(SUBSTRING(order_number FROM 14)::integer), 0) + 1
    INTO next_seq
    FROM public.orders
   WHERE order_number LIKE 'ORD-' || date_str || '-%';

  RETURN 'ORD-' || date_str || '-' || lpad(next_seq::text, 4, '0');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO service_role;


-- ============================================================
-- 2. RESTOCK & PLACE_ORDER RPC ACCESS HARDENING
-- ============================================================

-- ── increment_stock ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_stock(
  p_variant_id uuid,
  p_qty        int
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.product_variants
  SET    stock_qty  = stock_qty + p_qty,
         updated_at = now()
  WHERE  id = p_variant_id;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_stock(uuid, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_stock(uuid, int) TO service_role;

-- ── place_order ──────────────────────────────────────────────
-- Only backend server actions using service_role can invoke place_order
REVOKE EXECUTE ON FUNCTION public.place_order(
  uuid, text, text, text, text, text, text, text, jsonb
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_order(
  uuid, text, text, text, text, text, text, text, jsonb
) TO service_role;


-- ============================================================
-- 3. CART_ADD_OR_INCREMENT: SWITCH TO SECURITY INVOKER
-- ============================================================

-- Switch to SECURITY INVOKER so cart_items RLS policy enforces that
-- the authenticated user can ONLY modify their own cart items.
CREATE OR REPLACE FUNCTION public.cart_add_or_increment(
  p_cart_id    uuid,
  p_variant_id uuid,
  p_qty        int,
  p_max_qty    int DEFAULT 99
)
RETURNS int
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  INSERT INTO public.cart_items (cart_id, variant_id, qty)
  VALUES (p_cart_id, p_variant_id, LEAST(p_qty, p_max_qty))
  ON CONFLICT (cart_id, variant_id)
  DO UPDATE SET qty = LEAST(cart_items.qty + EXCLUDED.qty, p_max_qty)
  RETURNING qty;
$$;

REVOKE EXECUTE ON FUNCTION public.cart_add_or_increment(uuid, uuid, int, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cart_add_or_increment(uuid, uuid, int, int) TO authenticated, service_role;


-- ============================================================
-- 4. STORAGE: PREVENT BUCKET LISTING BY ANONYMOUS USERS
-- ============================================================

DROP POLICY IF EXISTS "product_images_read_policy" ON storage.objects;

-- Only authenticated staff/admins can list/select metadata from storage.objects
DROP POLICY IF EXISTS "product_images_staff_read_policy" ON storage.objects;
CREATE POLICY "product_images_staff_read_policy"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('staff', 'admin')
    )
  );


-- ============================================================
-- 5. RLS: PREVENT ANON FROM CALLING IS_ADMIN / IS_STAFF_OR_ADMIN
-- ============================================================

-- Revoke direct RPC execution from anon
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_staff_or_admin() FROM anon;

-- Update catalog SELECT policies so anon never evaluates is_staff_or_admin()
DROP POLICY IF EXISTS "products: public select active" ON public.products;
CREATE POLICY "products: public select active"
  ON public.products FOR SELECT
  TO public
  USING (active = true);

DROP POLICY IF EXISTS "products: staff select drafts" ON public.products;
CREATE POLICY "products: staff select drafts"
  ON public.products FOR SELECT
  TO authenticated
  USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "product_variants: public select active" ON public.product_variants;
CREATE POLICY "product_variants: public select active"
  ON public.product_variants FOR SELECT
  TO public
  USING (
    active = true AND EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id AND p.active = true
    )
  );

DROP POLICY IF EXISTS "product_variants: staff select all" ON public.product_variants;
CREATE POLICY "product_variants: staff select all"
  ON public.product_variants FOR SELECT
  TO authenticated
  USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "product_images: public select" ON public.product_images;
CREATE POLICY "product_images: public select active"
  ON public.product_images FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id AND p.active = true
    )
  );

DROP POLICY IF EXISTS "product_images: staff select all" ON public.product_images;
CREATE POLICY "product_images: staff select all"
  ON public.product_images FOR SELECT
  TO authenticated
  USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "product_options: public select" ON public.product_options;
CREATE POLICY "product_options: public select active"
  ON public.product_options FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_options.product_id AND p.active = true
    )
  );

DROP POLICY IF EXISTS "product_options: staff select all" ON public.product_options;
CREATE POLICY "product_options: staff select all"
  ON public.product_options FOR SELECT
  TO authenticated
  USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "product_option_values: public select" ON public.product_option_values;
CREATE POLICY "product_option_values: public select active"
  ON public.product_option_values FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.product_options po
      JOIN public.products p ON p.id = po.product_id
      WHERE po.id = product_option_values.option_id AND p.active = true
    )
  );

DROP POLICY IF EXISTS "product_option_values: staff select all" ON public.product_option_values;
CREATE POLICY "product_option_values: staff select all"
  ON public.product_option_values FOR SELECT
  TO authenticated
  USING (public.is_staff_or_admin());
