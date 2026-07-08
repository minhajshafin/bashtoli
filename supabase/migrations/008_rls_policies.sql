-- ============================================================
-- 008_rls_policies.sql
-- Row-Level Security for all application tables.
--
-- Role model (stored in profiles.role):
--   anonymous  — unauthenticated visitor
--   customer   — default role after signup
--   staff      — can manage catalog and orders
--   admin      — all staff permissions + role management
-- ============================================================

-- ── Helper: is the current user staff or admin? ───────────────
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
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

-- ── Helper: is the current user admin? ───────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
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

-- ==============================================================
-- ENABLE RLS ON ALL TABLES
-- ==============================================================

ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_values  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history   ENABLE ROW LEVEL SECURITY;

-- ==============================================================
-- PROFILES
-- ==============================================================

CREATE POLICY "profiles: owner can select"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles: staff/admin can select all"
  ON public.profiles FOR SELECT
  USING (public.is_staff_or_admin());

CREATE POLICY "profiles: owner can update own fields"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles: admin can update any"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ==============================================================
-- CATEGORIES
-- ==============================================================

CREATE POLICY "categories: public select"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "categories: staff/admin insert"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "categories: staff/admin update"
  ON public.categories FOR UPDATE
  USING (public.is_staff_or_admin());

CREATE POLICY "categories: staff/admin delete"
  ON public.categories FOR DELETE
  USING (public.is_staff_or_admin());

-- ==============================================================
-- PRODUCTS
-- ==============================================================

-- Active products visible to everyone; staff/admin can see drafts too
CREATE POLICY "products: public select active"
  ON public.products FOR SELECT
  USING (active = true OR public.is_staff_or_admin());

CREATE POLICY "products: staff/admin insert"
  ON public.products FOR INSERT
  WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "products: staff/admin update"
  ON public.products FOR UPDATE
  USING (public.is_staff_or_admin());

CREATE POLICY "products: staff/admin delete"
  ON public.products FOR DELETE
  USING (public.is_staff_or_admin());

-- ==============================================================
-- PRODUCT_IMAGES
-- ==============================================================

CREATE POLICY "product_images: public select"
  ON public.product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND (p.active = true OR public.is_staff_or_admin())
    )
  );

CREATE POLICY "product_images: staff/admin insert"
  ON public.product_images FOR INSERT
  WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "product_images: staff/admin update"
  ON public.product_images FOR UPDATE
  USING (public.is_staff_or_admin());

CREATE POLICY "product_images: staff/admin delete"
  ON public.product_images FOR DELETE
  USING (public.is_staff_or_admin());

-- ==============================================================
-- PRODUCT_OPTIONS
-- ==============================================================

CREATE POLICY "product_options: public select"
  ON public.product_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_options.product_id
        AND (p.active = true OR public.is_staff_or_admin())
    )
  );

CREATE POLICY "product_options: staff/admin write"
  ON public.product_options FOR ALL
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- ==============================================================
-- PRODUCT_OPTION_VALUES
-- ==============================================================

CREATE POLICY "product_option_values: public select"
  ON public.product_option_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.product_options po
      JOIN public.products p ON p.id = po.product_id
      WHERE po.id = product_option_values.option_id
        AND (p.active = true OR public.is_staff_or_admin())
    )
  );

CREATE POLICY "product_option_values: staff/admin write"
  ON public.product_option_values FOR ALL
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- ==============================================================
-- PRODUCT_VARIANTS
-- ==============================================================

CREATE POLICY "product_variants: public select active"
  ON public.product_variants FOR SELECT
  USING (
    (active = true AND EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id AND p.active = true
    ))
    OR public.is_staff_or_admin()
  );

CREATE POLICY "product_variants: staff/admin insert"
  ON public.product_variants FOR INSERT
  WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "product_variants: staff/admin update"
  ON public.product_variants FOR UPDATE
  USING (public.is_staff_or_admin());

CREATE POLICY "product_variants: staff/admin delete"
  ON public.product_variants FOR DELETE
  USING (public.is_staff_or_admin());

-- ==============================================================
-- ADDRESSES
-- ==============================================================

CREATE POLICY "addresses: owner all"
  ON public.addresses FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==============================================================
-- CARTS
-- ==============================================================

CREATE POLICY "carts: owner all"
  ON public.carts FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==============================================================
-- CART_ITEMS
-- ==============================================================

CREATE POLICY "cart_items: owner all"
  ON public.cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
    )
  );

-- ==============================================================
-- WISHLIST
-- ==============================================================

CREATE POLICY "wishlist: owner all"
  ON public.wishlist FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==============================================================
-- ORDERS
-- ==============================================================

-- Customers read their own linked orders
CREATE POLICY "orders: customer select own"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid());

-- Staff/admin read all orders
CREATE POLICY "orders: staff/admin select all"
  ON public.orders FOR SELECT
  USING (public.is_staff_or_admin());

-- INSERT via service-role client only (bypasses RLS) — no policy for regular users

-- Staff/admin update (status changes, etc.)
CREATE POLICY "orders: staff/admin update"
  ON public.orders FOR UPDATE
  USING (public.is_staff_or_admin());

-- Customers can cancel their own order (24h window enforced at app layer)
CREATE POLICY "orders: customer cancel own"
  ON public.orders FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==============================================================
-- ORDER_ITEMS
-- ==============================================================

CREATE POLICY "order_items: customer select own"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items: staff/admin select all"
  ON public.order_items FOR SELECT
  USING (public.is_staff_or_admin());

-- ==============================================================
-- ORDER_STATUS_HISTORY
-- ==============================================================

CREATE POLICY "order_status_history: customer select own"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_history.order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "order_status_history: staff/admin select all"
  ON public.order_status_history FOR SELECT
  USING (public.is_staff_or_admin());
