-- ============================================================
-- 018_isolate_auth_helper_functions.sql
--
-- Resolves the remaining 4 SECURITY DEFINER function warnings:
-- - anon_security_definer_function_executable on public.is_admin
-- - anon_security_definer_function_executable on public.is_staff_or_admin
-- - authenticated_security_definer_function_executable on public.is_admin
-- - authenticated_security_definer_function_executable on public.is_staff_or_admin
--
-- Why:
-- In Supabase, every function in the `public` schema is exposed by
-- default over PostgREST as an RPC endpoint (/rest/v1/rpc/<name>).
-- `is_admin()` and `is_staff_or_admin()` are internal helper functions
-- meant strictly for Row-Level Security (RLS) policies. They should
-- never be exposed as public API endpoints.
--
-- Solution:
-- Move `is_admin()` and `is_staff_or_admin()` to a private schema
-- (`app_private`). Non-exposed schemas are completely hidden from
-- PostgREST, while remaining fully accessible to PostgreSQL's internal
-- RLS engine. Then update all RLS policies to reference the private
-- schema and drop the exposed functions from `public`.
-- ============================================================

-- 1. Create the private schema (not exposed to PostgREST)
CREATE SCHEMA IF NOT EXISTS app_private;

-- 2. Define the helper functions in app_private
CREATE OR REPLACE FUNCTION app_private.is_staff_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('staff', 'admin')
  )
$$;

CREATE OR REPLACE FUNCTION app_private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Grant schema usage and function execution to authenticated and service_role
GRANT USAGE ON SCHEMA app_private TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION app_private.is_staff_or_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.is_admin() TO authenticated, service_role;


-- 3. Update all RLS policies to use app_private functions

-- ── PROFILES ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles: staff/admin can select all" ON public.profiles;
CREATE POLICY "profiles: staff/admin can select all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "profiles: admin can update any" ON public.profiles;
CREATE POLICY "profiles: admin can update any"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (app_private.is_admin())
  WITH CHECK (app_private.is_admin());

-- ── CATEGORIES ───────────────────────────────────────────────
DROP POLICY IF EXISTS "categories: staff/admin insert" ON public.categories;
CREATE POLICY "categories: staff/admin insert"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "categories: staff/admin update" ON public.categories;
CREATE POLICY "categories: staff/admin update"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "categories: staff/admin delete" ON public.categories;
CREATE POLICY "categories: staff/admin delete"
  ON public.categories FOR DELETE
  TO authenticated
  USING (app_private.is_staff_or_admin());

-- ── PRODUCTS ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "products: staff select drafts" ON public.products;
CREATE POLICY "products: staff select drafts"
  ON public.products FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "products: staff/admin insert" ON public.products;
CREATE POLICY "products: staff/admin insert"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "products: staff/admin update" ON public.products;
CREATE POLICY "products: staff/admin update"
  ON public.products FOR UPDATE
  TO authenticated
  USING (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "products: staff/admin delete" ON public.products;
CREATE POLICY "products: staff/admin delete"
  ON public.products FOR DELETE
  TO authenticated
  USING (app_private.is_staff_or_admin());

-- ── PRODUCT_IMAGES ───────────────────────────────────────────
DROP POLICY IF EXISTS "product_images: staff select all" ON public.product_images;
CREATE POLICY "product_images: staff select all"
  ON public.product_images FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "product_images: staff/admin insert" ON public.product_images;
CREATE POLICY "product_images: staff/admin insert"
  ON public.product_images FOR INSERT
  TO authenticated
  WITH CHECK (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "product_images: staff/admin update" ON public.product_images;
CREATE POLICY "product_images: staff/admin update"
  ON public.product_images FOR UPDATE
  TO authenticated
  USING (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "product_images: staff/admin delete" ON public.product_images;
CREATE POLICY "product_images: staff/admin delete"
  ON public.product_images FOR DELETE
  TO authenticated
  USING (app_private.is_staff_or_admin());

-- ── PRODUCT_OPTIONS ──────────────────────────────────────────
DROP POLICY IF EXISTS "product_options: staff select all" ON public.product_options;
CREATE POLICY "product_options: staff select all"
  ON public.product_options FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "product_options: staff/admin write" ON public.product_options;
CREATE POLICY "product_options: staff/admin write"
  ON public.product_options FOR ALL
  TO authenticated
  USING (app_private.is_staff_or_admin())
  WITH CHECK (app_private.is_staff_or_admin());

-- ── PRODUCT_OPTION_VALUES ────────────────────────────────────
DROP POLICY IF EXISTS "product_option_values: staff select all" ON public.product_option_values;
CREATE POLICY "product_option_values: staff select all"
  ON public.product_option_values FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "product_option_values: staff/admin write" ON public.product_option_values;
CREATE POLICY "product_option_values: staff/admin write"
  ON public.product_option_values FOR ALL
  TO authenticated
  USING (app_private.is_staff_or_admin())
  WITH CHECK (app_private.is_staff_or_admin());

-- ── PRODUCT_VARIANTS ─────────────────────────────────────────
DROP POLICY IF EXISTS "product_variants: staff select all" ON public.product_variants;
CREATE POLICY "product_variants: staff select all"
  ON public.product_variants FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "product_variants: staff/admin insert" ON public.product_variants;
CREATE POLICY "product_variants: staff/admin insert"
  ON public.product_variants FOR INSERT
  TO authenticated
  WITH CHECK (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "product_variants: staff/admin update" ON public.product_variants;
CREATE POLICY "product_variants: staff/admin update"
  ON public.product_variants FOR UPDATE
  TO authenticated
  USING (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "product_variants: staff/admin delete" ON public.product_variants;
CREATE POLICY "product_variants: staff/admin delete"
  ON public.product_variants FOR DELETE
  TO authenticated
  USING (app_private.is_staff_or_admin());

-- ── ORDERS ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "orders: staff/admin select all" ON public.orders;
CREATE POLICY "orders: staff/admin select all"
  ON public.orders FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "orders: staff/admin update" ON public.orders;
CREATE POLICY "orders: staff/admin update"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (app_private.is_staff_or_admin());

-- ── ORDER_ITEMS ──────────────────────────────────────────────
DROP POLICY IF EXISTS "order_items: staff/admin select all" ON public.order_items;
CREATE POLICY "order_items: staff/admin select all"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

-- ── ORDER_STATUS_HISTORY ─────────────────────────────────────
DROP POLICY IF EXISTS "order_status_history: staff/admin select all" ON public.order_status_history;
CREATE POLICY "order_status_history: staff/admin select all"
  ON public.order_status_history FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

DROP POLICY IF EXISTS "order_status_history: staff/admin insert" ON public.order_status_history;
CREATE POLICY "order_status_history: staff/admin insert"
  ON public.order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (app_private.is_staff_or_admin());

-- ── ADDRESSES ────────────────────────────────────────────────
DROP POLICY IF EXISTS "addresses: admin all" ON public.addresses;
CREATE POLICY "addresses: admin all"
  ON public.addresses FOR ALL
  TO authenticated
  USING (app_private.is_admin());

-- ── ADMIN_AUDIT_LOG ──────────────────────────────────────────
DROP POLICY IF EXISTS "admin_audit_log: admin select" ON public.admin_audit_log;
CREATE POLICY "admin_audit_log: admin select"
  ON public.admin_audit_log FOR SELECT
  TO authenticated
  USING (app_private.is_admin());


-- 4. Safely drop the exposed functions from the public schema
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_staff_or_admin();
