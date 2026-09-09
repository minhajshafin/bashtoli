-- ============================================================
-- 005_row_level_security.sql
-- Enables Row-Level Security (RLS) on all 16 application tables.
-- Applies all hardened, non-circular, security-audited policies.
-- Uses app_private helper functions to prevent privilege escalation.
-- ============================================================

-- ============================================================
-- 1. ENABLE ROW-LEVEL SECURITY ON ALL TABLES
-- ============================================================

ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log       ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 2. PROFILES
-- ============================================================

-- Owner can read own profile
CREATE POLICY "profiles: owner can select"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Staff and Admins can view all customer profiles
CREATE POLICY "profiles: staff/admin can select all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

-- Customers can update own non-role fields (role escalation prevented)
CREATE POLICY "profiles: owner can update own fields"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Admins can update any profile (role management)
CREATE POLICY "profiles: admin can update any"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (app_private.is_admin())
  WITH CHECK (app_private.is_admin());


-- ============================================================
-- 3. CATEGORIES
-- ============================================================

-- Categories are publicly readable by everyone
CREATE POLICY "categories: public select"
  ON public.categories FOR SELECT
  USING (true);

-- Staff and Admins can manage categories
CREATE POLICY "categories: staff/admin insert"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (app_private.is_staff_or_admin());

CREATE POLICY "categories: staff/admin update"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (app_private.is_staff_or_admin());

CREATE POLICY "categories: staff/admin delete"
  ON public.categories FOR DELETE
  TO authenticated
  USING (app_private.is_staff_or_admin());


-- ============================================================
-- 4. PRODUCTS & CATALOG ELEMENTS
-- ============================================================

-- ── products ─────────────────────────────────────────────────
-- Public can only view active products (anon never evaluates is_staff_or_admin)
CREATE POLICY "products: public select active"
  ON public.products FOR SELECT
  TO public
  USING (active = true);

-- Authenticated staff/admin can view drafts and inactive products
CREATE POLICY "products: staff select drafts"
  ON public.products FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

CREATE POLICY "products: staff/admin insert"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (app_private.is_staff_or_admin());

CREATE POLICY "products: staff/admin update"
  ON public.products FOR UPDATE
  TO authenticated
  USING (app_private.is_staff_or_admin());

CREATE POLICY "products: staff/admin delete"
  ON public.products FOR DELETE
  TO authenticated
  USING (app_private.is_staff_or_admin());

-- ── product_images ───────────────────────────────────────────
CREATE POLICY "product_images: public select active"
  ON public.product_images FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id AND p.active = true
    )
  );

CREATE POLICY "product_images: staff select all"
  ON public.product_images FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

CREATE POLICY "product_images: staff/admin insert"
  ON public.product_images FOR INSERT
  TO authenticated
  WITH CHECK (app_private.is_staff_or_admin());

CREATE POLICY "product_images: staff/admin update"
  ON public.product_images FOR UPDATE
  TO authenticated
  USING (app_private.is_staff_or_admin());

CREATE POLICY "product_images: staff/admin delete"
  ON public.product_images FOR DELETE
  TO authenticated
  USING (app_private.is_staff_or_admin());

-- ── product_options ──────────────────────────────────────────
CREATE POLICY "product_options: public select active"
  ON public.product_options FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_options.product_id AND p.active = true
    )
  );

CREATE POLICY "product_options: staff select all"
  ON public.product_options FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

CREATE POLICY "product_options: staff/admin write"
  ON public.product_options FOR ALL
  TO authenticated
  USING (app_private.is_staff_or_admin())
  WITH CHECK (app_private.is_staff_or_admin());

-- ── product_option_values ────────────────────────────────────
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

CREATE POLICY "product_option_values: staff select all"
  ON public.product_option_values FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

CREATE POLICY "product_option_values: staff/admin write"
  ON public.product_option_values FOR ALL
  TO authenticated
  USING (app_private.is_staff_or_admin())
  WITH CHECK (app_private.is_staff_or_admin());

-- ── product_variants ─────────────────────────────────────────
CREATE POLICY "product_variants: public select active"
  ON public.product_variants FOR SELECT
  TO public
  USING (
    active = true AND EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id AND p.active = true
    )
  );

CREATE POLICY "product_variants: staff select all"
  ON public.product_variants FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

CREATE POLICY "product_variants: staff/admin insert"
  ON public.product_variants FOR INSERT
  TO authenticated
  WITH CHECK (app_private.is_staff_or_admin());

CREATE POLICY "product_variants: staff/admin update"
  ON public.product_variants FOR UPDATE
  TO authenticated
  USING (app_private.is_staff_or_admin());

CREATE POLICY "product_variants: staff/admin delete"
  ON public.product_variants FOR DELETE
  TO authenticated
  USING (app_private.is_staff_or_admin());


-- ============================================================
-- 5. ADDRESSES, CART & WISHLIST
-- ============================================================

-- ── addresses ────────────────────────────────────────────────
CREATE POLICY "addresses: owner all"
  ON public.addresses FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "addresses: admin all"
  ON public.addresses FOR ALL
  TO authenticated
  USING (app_private.is_admin());

-- ── carts ────────────────────────────────────────────────────
CREATE POLICY "carts: owner all"
  ON public.carts FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── cart_items ───────────────────────────────────────────────
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

-- ── wishlist ─────────────────────────────────────────────────
CREATE POLICY "wishlist: owner all"
  ON public.wishlist FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ============================================================
-- 6. ORDERS & FULFILLMENT
-- ============================================================

-- ── orders ───────────────────────────────────────────────────
-- Authenticated customers view their own orders
CREATE POLICY "orders: customer select own"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid());

-- Authenticated customers can see unclaimed guest orders matching their verified email/phone
CREATE POLICY "orders: customer select unclaimed guest orders"
  ON public.orders FOR SELECT
  USING (
    user_id IS NULL
    AND auth.uid() IS NOT NULL
    AND (
      (guest_email IS NOT NULL AND lower(guest_email) = lower(auth.jwt()->>'email'))
      OR
      (phone IS NOT NULL AND phone = (SELECT p.phone FROM public.profiles p WHERE p.id = auth.uid()))
    )
  );

-- Staff and Admins can view all orders
CREATE POLICY "orders: staff/admin select all"
  ON public.orders FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

-- Staff and Admins can update orders (e.g. status transition)
CREATE POLICY "orders: staff/admin update"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (app_private.is_staff_or_admin());

-- Customers can only cancel their own pending order (narrowed security policy)
CREATE POLICY "orders: customer cancel own"
  ON public.orders FOR UPDATE
  USING (
    user_id = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'cancelled'
  );

-- ── order_items ──────────────────────────────────────────────
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
  TO authenticated
  USING (app_private.is_staff_or_admin());

-- ── order_status_history ─────────────────────────────────────
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
  TO authenticated
  USING (app_private.is_staff_or_admin());

CREATE POLICY "order_status_history: staff/admin insert"
  ON public.order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (app_private.is_staff_or_admin());

CREATE POLICY "order_status_history: customer insert cancellation"
  ON public.order_status_history FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND status = 'cancelled'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_history.order_id
        AND o.user_id = auth.uid()
    )
  );


-- ============================================================
-- 7. HERO SLIDES & AUDIT TRAIL
-- ============================================================

-- ── hero_slides ──────────────────────────────────────────────
CREATE POLICY "hero_slides_public_read"
  ON public.hero_slides FOR SELECT
  USING (active = true);

CREATE POLICY "hero_slides_staff_read"
  ON public.hero_slides FOR SELECT
  TO authenticated
  USING (app_private.is_staff_or_admin());

CREATE POLICY "hero_slides_staff_insert"
  ON public.hero_slides FOR INSERT
  TO authenticated
  WITH CHECK (app_private.is_staff_or_admin());

CREATE POLICY "hero_slides_staff_update"
  ON public.hero_slides FOR UPDATE
  TO authenticated
  USING (app_private.is_staff_or_admin());

CREATE POLICY "hero_slides_staff_delete"
  ON public.hero_slides FOR DELETE
  TO authenticated
  USING (app_private.is_staff_or_admin());

-- ── admin_audit_log ──────────────────────────────────────────
CREATE POLICY "admin_audit_log: admin select"
  ON public.admin_audit_log FOR SELECT
  TO authenticated
  USING (app_private.is_admin());
