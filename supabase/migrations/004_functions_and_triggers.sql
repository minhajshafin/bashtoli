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
