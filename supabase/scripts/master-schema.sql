-- ============================================================
-- BASHTOLI E-COMMERCE MASTER DATABASE SCHEMA
-- ============================================================
-- This master script contains the complete, consolidated schema
-- for the Bashtoli e-commerce application. It is compiled from
-- the 6 modular migrations in supabase/migrations/:
--   1. 001_types_and_extensions.sql
--   2. 002_core_tables.sql
--   3. 003_indexes.sql
--   4. 004_functions_and_triggers.sql
--   5. 005_row_level_security.sql
--   6. 006_storage.sql
--
-- USAGE (Supabase Web Dashboard):
-- 1. Open your Supabase project dashboard.
-- 2. Navigate to SQL Editor -> New Query.
-- 3. Copy and paste the entire contents of this file.
-- 4. Click "Run" to provision the complete database in one execution.
-- 5. Afterward, run bootstrap-admin.sql to promote your admin user.
-- ============================================================

-- ============================================================
-- 001_types_and_extensions.sql
-- Extensions, custom ENUM types, and isolated private schema.
-- Run before table definitions.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Application ENUM Types ──────────────────────────────────

-- User roles for access control
CREATE TYPE public.user_role AS ENUM ('customer', 'staff', 'admin');

-- How the customer intends to receive their order
CREATE TYPE public.fulfillment_type AS ENUM ('delivery', 'pickup');

-- Order lifecycle states (see PRD §Order Status Workflow)
CREATE TYPE public.order_status AS ENUM (
  'pending',
  'confirmed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

-- Delivery zones for fee calculation (null when fulfillment is pickup)
CREATE TYPE public.delivery_zone AS ENUM ('inside_dhaka', 'outside_dhaka');

-- ── Private Schema for Security Functions ───────────────────
-- In Supabase, every function in the 'public' schema is exposed over
-- PostgREST as an RPC endpoint. Helper functions strictly used for
-- Row-Level Security (RLS) live in 'app_private' to prevent exposure.
CREATE SCHEMA IF NOT EXISTS app_private;
GRANT USAGE ON SCHEMA app_private TO authenticated, service_role, anon;



-- ============================================================
-- 002_core_tables.sql
-- All 16 core application tables with finalized columns,
-- foreign keys, check constraints, and cascade delete rules.
-- ============================================================

-- ── 1. profiles ──────────────────────────────────────────────
-- User profile extending auth.users (1:1).
CREATE TABLE public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.user_role NOT NULL DEFAULT 'customer',
  full_name  text,
  phone      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── 2. categories ────────────────────────────────────────────
-- Product categories, including featured flag for homepage collage.
CREATE TABLE public.categories (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  slug           text NOT NULL UNIQUE,
  sort_order     integer NOT NULL DEFAULT 0,
  is_featured    boolean NOT NULL DEFAULT false,
  image_url      text,
  featured_order integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ── 3. products ──────────────────────────────────────────────
-- Base product entity.
CREATE TABLE public.products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  base_price  numeric(12, 2) NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT false,
  featured    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 4. product_images ────────────────────────────────────────
-- Product gallery images stored in Supabase Storage.
CREATE TABLE public.product_images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url        text NOT NULL,
  alt_text   text,
  sort_order integer NOT NULL DEFAULT 0
);

-- ── 5. product_options ───────────────────────────────────────
-- Option axes per product (e.g. "Size", "Color").
CREATE TABLE public.product_options (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name       text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

-- ── 6. product_option_values ─────────────────────────────────
-- Values per option axis (e.g. "S", "M", "Red").
CREATE TABLE public.product_option_values (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id  uuid NOT NULL REFERENCES public.product_options(id) ON DELETE CASCADE,
  value      text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

-- ── 7. product_variants ──────────────────────────────────────
-- Sellable SKUs with dedicated pricing and inventory stock counts.
CREATE TABLE public.product_variants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  sku           text,
  option_values jsonb NOT NULL DEFAULT '{}',
  stock_qty     integer NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  price         numeric(12, 2) NOT NULL DEFAULT 0,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ── 8. addresses ─────────────────────────────────────────────
-- Customer shipping addresses.
CREATE TABLE public.addresses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label        text,
  full_address text NOT NULL,
  phone        text,
  is_default   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ── 9. carts ─────────────────────────────────────────────────
-- Persistent database cart per authenticated customer (1:1).
CREATE TABLE public.carts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── 10. cart_items ───────────────────────────────────────────
-- Variant line items inside a customer's cart.
CREATE TABLE public.cart_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id    uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  qty        integer NOT NULL DEFAULT 1 CHECK (qty > 0),
  UNIQUE (cart_id, variant_id)
);

-- ── 11. wishlist ─────────────────────────────────────────────
-- Customer saved wishlist products.
CREATE TABLE public.wishlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- ── 12. orders ───────────────────────────────────────────────
-- Customer and guest orders with financial snapshots and delivery details.
CREATE TABLE public.orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     text NOT NULL UNIQUE,
  user_id          uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name    text NOT NULL,
  phone            text NOT NULL,
  guest_email      text,
  address          text NOT NULL,
  notes            text,
  fulfillment_type public.fulfillment_type NOT NULL,
  delivery_zone    public.delivery_zone,
  subtotal         numeric(12, 2) NOT NULL DEFAULT 0,
  delivery_fee     numeric(12, 2) NOT NULL DEFAULT 0,
  total            numeric(12, 2) NOT NULL DEFAULT 0,
  status           public.order_status NOT NULL DEFAULT 'pending',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ── 13. order_items ──────────────────────────────────────────
-- Purchased variant snapshot at time of order (historical prices immutable).
CREATE TABLE public.order_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id        uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  variant_id        uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  qty               integer NOT NULL CHECK (qty > 0),
  price_at_purchase numeric(12, 2) NOT NULL,
  product_name      text NOT NULL
);

-- ── 14. order_status_history ─────────────────────────────────
-- Audit history of all status transitions for an order.
CREATE TABLE public.order_status_history (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status     public.order_status NOT NULL,
  changed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

-- ── 15. hero_slides ──────────────────────────────────────────
-- Dynamic storefront hero carousel slides.
CREATE TABLE public.hero_slides (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url          text NOT NULL,
  alt_text           text DEFAULT '',
  badge_text         text NOT NULL DEFAULT 'New Collection',
  badge_color_preset text NOT NULL DEFAULT 'gold'
    CHECK (badge_color_preset IN ('gold', 'forest', 'crimson', 'ocean', 'slate')),
  link_url           text NOT NULL DEFAULT '/products',
  subtext            text NOT NULL DEFAULT 'Now in store & online',
  sort_order         integer NOT NULL DEFAULT 0,
  active             boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ── 16. admin_audit_log ──────────────────────────────────────
-- Security audit trail recording privileged role changes (promote/demote).
CREATE TABLE public.admin_audit_log (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  performed_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action         text NOT NULL,
  target_user_id uuid,
  target_email   text,
  old_role       text,
  new_role       text,
  created_at     timestamptz NOT NULL DEFAULT now()
);



-- ============================================================
-- 003_indexes.sql
-- High-performance query indexes for storefront navigation,
-- order lookups, and admin filtering.
-- ============================================================

-- ── orders ───────────────────────────────────────────────────
-- Guest lookup by order number and admin order search
CREATE INDEX IF NOT EXISTS idx_orders_order_number  ON public.orders (order_number);

-- Filter orders by status (e.g. pending orders queue)
CREATE INDEX IF NOT EXISTS idx_orders_status        ON public.orders (status);

-- Customer orders list lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id       ON public.orders (user_id);

-- ── products & variants ──────────────────────────────────────
-- Category browse page filtering
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);

-- Storefront queries filtering active products
CREATE INDEX IF NOT EXISTS idx_products_active      ON public.products (active);

-- Main storefront category browsing: active products by category ordered by newest
CREATE INDEX IF NOT EXISTS idx_products_active_category_created ON public.products (active, category_id, created_at DESC);

-- Price sorting on active products
CREATE INDEX IF NOT EXISTS idx_products_active_price ON public.products (active, base_price);

-- Featured sorting on active products
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON public.products (active, featured DESC, created_at DESC);

-- Product slug lookup for active products
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug) WHERE active = true;

-- Product images by product ordered by sort_order
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images (product_id, sort_order);

-- Variant lookup by parent product
CREATE INDEX IF NOT EXISTS idx_variants_product_id  ON public.product_variants (product_id);

-- ── categories ───────────────────────────────────────────────
-- Homepage 7-slot category collage grid ordering
CREATE INDEX IF NOT EXISTS idx_categories_featured  ON public.categories (is_featured, featured_order);

-- ── hero_slides ──────────────────────────────────────────────
-- Homepage hero carousel display sorting
CREATE INDEX IF NOT EXISTS idx_hero_slides_sort     ON public.hero_slides (sort_order, created_at);



-- ============================================================
-- 004_functions_and_triggers.sql
-- All database functions, triggers, and atomic RPCs.
-- Hardened with explicit SET search_path = public and
-- strict privilege separation (REVOKE / GRANT).
-- ============================================================

-- ============================================================
-- 1. TIMESTAMP & AUDIT TRIGGERS
-- ============================================================

-- ── set_updated_at ───────────────────────────────────────────
-- Generic trigger function to maintain updated_at = now().
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

-- Attach updated_at trigger to relevant tables
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_hero_slides_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── prevent_audit_log_modification ───────────────────────────
-- Guarantees immutability of the admin audit log.
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

CREATE TRIGGER trg_audit_log_immutable
  BEFORE UPDATE OR DELETE ON public.admin_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_modification();


-- ============================================================
-- 2. AUTHENTICATION HOOK TRIGGERS
-- ============================================================

-- ── handle_new_user ──────────────────────────────────────────
-- Automatically provisions a public.profiles record when a user signs up.
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

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 3. ISOLATED RLS HELPER FUNCTIONS (app_private)
-- ============================================================

-- Check if current authenticated user has staff or admin privileges
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
  );
$$;

-- Check if current authenticated user is an admin
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
  );
$$;

GRANT EXECUTE ON FUNCTION app_private.is_staff_or_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.is_admin() TO authenticated, service_role;


-- ============================================================
-- 4. ORDER GENERATION & PLACEMENT RPCS
-- ============================================================

-- ── generate_order_number ────────────────────────────────────
-- Race-condition safe order number generator (ORD-YYYYMMDD-NNNN).
-- Uses pg_advisory_xact_lock() scoped to current date.
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

-- ── place_order ──────────────────────────────────────────────
-- Server-authoritative checkout transaction:
-- 1. Computes delivery fee based on fulfillment_type and delivery_zone.
-- 2. Validates items and looks up price from DB (caller totals not trusted).
-- 3. Generates unique order number with advisory lock.
-- 4. Inserts order and initial status history.
-- 5. Atomically decrements stock_qty; rolls back transaction on insufficient stock.
CREATE OR REPLACE FUNCTION public.place_order(
  p_user_id          uuid,
  p_customer_name    text,
  p_phone            text,
  p_guest_email      text,
  p_address          text,
  p_notes            text,
  p_fulfillment_type text,
  p_delivery_zone    text,
  p_items            jsonb  -- [{ variant_id, product_id, qty, product_name }]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id       uuid;
  v_order_number   text;
  v_item           jsonb;
  v_rows_updated   integer;

  -- Financials computed inside the function
  v_subtotal       numeric(12,2) := 0;
  v_delivery_fee   numeric(12,2) := 0;
  v_total          numeric(12,2) := 0;

  -- Per-item lookups
  v_variant_price  numeric(12,2);
  v_variant_active boolean;
  v_product_active boolean;
  v_item_qty       integer;
  v_item_subtotal  numeric(12,2);
BEGIN
  -- 1. Compute delivery fee from zone (server-authoritative)
  IF p_fulfillment_type = 'pickup' THEN
    v_delivery_fee := 0;
  ELSIF p_fulfillment_type = 'delivery' THEN
    IF p_delivery_zone = 'inside_dhaka' THEN
      v_delivery_fee := 70;
    ELSIF p_delivery_zone = 'outside_dhaka' THEN
      v_delivery_fee := 120;
    ELSE
      RAISE EXCEPTION 'INVALID_ZONE: delivery_zone is required for fulfillment_type = delivery';
    END IF;
  ELSE
    RAISE EXCEPTION 'INVALID_FULFILLMENT_TYPE: %', p_fulfillment_type;
  END IF;

  -- 2. Validate every item, look up DB price, compute subtotal
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_item_qty := (v_item->>'qty')::integer;

    IF v_item_qty <= 0 THEN
      RAISE EXCEPTION 'INVALID_QTY: qty must be > 0 for variant_id %',
        (v_item->>'variant_id')::uuid;
    END IF;

    SELECT
      pv.price,
      pv.active,
      p.active
    INTO
      v_variant_price,
      v_variant_active,
      v_product_active
    FROM public.product_variants pv
    JOIN public.products p ON p.id = pv.product_id
    WHERE pv.id = (v_item->>'variant_id')::uuid;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'ITEM_NOT_FOUND: variant_id %', (v_item->>'variant_id')::uuid;
    END IF;

    IF NOT v_variant_active OR NOT v_product_active THEN
      RAISE EXCEPTION 'ITEM_INACTIVE: variant_id %', (v_item->>'variant_id')::uuid;
    END IF;

    v_item_subtotal := v_variant_price * v_item_qty;
    v_subtotal      := v_subtotal + v_item_subtotal;
  END LOOP;

  v_total := v_subtotal + v_delivery_fee;

  -- 3. Generate a race-condition-safe order number
  v_order_number := public.generate_order_number();

  -- 4. Insert the order row
  INSERT INTO public.orders (
    order_number,
    user_id,
    customer_name,
    phone,
    guest_email,
    address,
    notes,
    fulfillment_type,
    delivery_zone,
    subtotal,
    delivery_fee,
    total,
    status
  ) VALUES (
    v_order_number,
    p_user_id,
    p_customer_name,
    p_phone,
    p_guest_email,
    p_address,
    p_notes,
    p_fulfillment_type::public.fulfillment_type,
    NULLIF(p_delivery_zone, '')::public.delivery_zone,
    v_subtotal,
    v_delivery_fee,
    v_total,
    'pending'::public.order_status
  )
  RETURNING id INTO v_order_id;

  -- 5. Log initial status history
  INSERT INTO public.order_status_history (order_id, status, changed_by)
  VALUES (v_order_id, 'pending'::public.order_status, p_user_id);

  -- 6. Decrement stock and insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_item_qty := (v_item->>'qty')::integer;

    SELECT price INTO v_variant_price
    FROM public.product_variants
    WHERE id = (v_item->>'variant_id')::uuid;

    -- Atomic stock decrement — rolls back if stock is insufficient
    UPDATE public.product_variants
       SET stock_qty = stock_qty - v_item_qty
     WHERE id = (v_item->>'variant_id')::uuid
       AND stock_qty >= v_item_qty;

    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

    IF v_rows_updated = 0 THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK: variant_id %', (v_item->>'variant_id')::uuid;
    END IF;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      variant_id,
      qty,
      price_at_purchase,
      product_name
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'variant_id')::uuid,
      v_item_qty,
      v_variant_price,
      v_item->>'product_name'
    );
  END LOOP;

  -- 7. Return computed financials
  RETURN jsonb_build_object(
    'order_number', v_order_number,
    'subtotal',     v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total',        v_total
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.place_order(
  uuid, text, text, text, text, text, text, text, jsonb
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_order(
  uuid, text, text, text, text, text, text, text, jsonb
) TO service_role;

-- ── increment_stock ──────────────────────────────────────────
-- Atomically adds p_qty to the stock_qty of a product variant.
-- Used when restocking cancelled orders.
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


-- ============================================================
-- 5. ATOMIC CART & GUEST ORDER RPCS
-- ============================================================

-- ── cart_add_or_increment ────────────────────────────────────
-- Inserts a cart item or increments qty atomically via ON CONFLICT.
-- Runs as SECURITY INVOKER so cart_items RLS enforces ownership.
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

-- ── find_unclaimed_guest_orders ──────────────────────────────
-- Queries unclaimed guest orders matching customer's JWT email or verified phone.
CREATE OR REPLACE FUNCTION public.find_unclaimed_guest_orders()
RETURNS TABLE (
  id           uuid,
  order_number text,
  created_at   timestamptz,
  total        numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_email   text := auth.jwt()->>'email';
  v_phone   text;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT phone INTO v_phone
  FROM public.profiles
  WHERE id = v_user_id;

  RETURN QUERY
  SELECT o.id, o.order_number, o.created_at, o.total
  FROM public.orders o
  WHERE o.user_id IS NULL
    AND (
      (v_email IS NOT NULL AND lower(o.guest_email) = lower(v_email))
      OR
      (v_phone IS NOT NULL AND v_phone <> '' AND o.phone = v_phone)
    )
  ORDER BY o.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.find_unclaimed_guest_orders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_unclaimed_guest_orders() TO authenticated, service_role;

-- ── claim_guest_orders ───────────────────────────────────────
-- Atomically links matching unclaimed guest orders to auth.uid().
CREATE OR REPLACE FUNCTION public.claim_guest_orders(
  p_order_ids uuid[] DEFAULT NULL
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id     uuid := auth.uid();
  v_email       text := auth.jwt()->>'email';
  v_phone       text;
  claimed_count int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT phone INTO v_phone
  FROM public.profiles
  WHERE id = v_user_id;

  UPDATE public.orders
  SET user_id    = v_user_id,
      updated_at = now()
  WHERE user_id IS NULL
    AND (p_order_ids IS NULL OR id = ANY(p_order_ids))
    AND (
      (v_email IS NOT NULL AND lower(guest_email) = lower(v_email))
      OR
      (v_phone IS NOT NULL AND v_phone <> '' AND phone = v_phone)
    );

  GET DIAGNOSTICS claimed_count = ROW_COUNT;
  RETURN claimed_count;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_guest_orders(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_guest_orders(uuid[]) TO authenticated, service_role;



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
