-- ============================================================
-- 011_fix_place_order.sql
--
-- Fixes two high-severity issues:
--
-- H-1: Race condition in generate_order_number()
--      The old MAX() approach allowed two concurrent transactions to
--      read the same max and collide on the UNIQUE constraint. Fixed
--      by acquiring a session-level advisory lock keyed to today's
--      date before reading and incrementing the sequence.
--
-- H-2: place_order() trusted caller-supplied financial totals
--      Anyone with the anon key could call the RPC with p_total = 1.
--      Fixed by removing p_subtotal / p_delivery_fee / p_total params
--      entirely. The function now looks up current prices from
--      product_variants and computes all totals atomically in the DB.
--      Delivery fees are hardcoded constants matching lib/config/delivery.ts.
-- ============================================================

-- ── generate_order_number (race-condition-safe) ───────────────
-- Uses pg_advisory_xact_lock() to serialise daily counter reads.
-- The lock key is the current date encoded as an integer (YYYYMMDD).
-- The lock is automatically released at transaction end.
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  date_str  text;
  lock_key  bigint;
  next_seq  integer;
BEGIN
  date_str := to_char(CURRENT_DATE, 'YYYYMMDD');
  lock_key  := date_str::bigint;

  -- Acquire an exclusive transaction-level advisory lock scoped to today.
  -- All concurrent place_order calls will queue here, eliminating the race.
  PERFORM pg_advisory_xact_lock(lock_key);

  SELECT COALESCE(MAX(SUBSTRING(order_number FROM 14)::integer), 0) + 1
    INTO next_seq
    FROM orders
   WHERE order_number LIKE 'ORD-' || date_str || '-%';

  RETURN 'ORD-' || date_str || '-' || lpad(next_seq::text, 4, '0');
END;
$$;


-- ── Delivery fee constants (mirrors lib/config/delivery.ts) ──
-- inside_dhaka:  70 BDT
-- outside_dhaka: 120 BDT
-- pickup:        0 BDT
--
-- If fees ever change, update BOTH this function and delivery.ts.

-- ── place_order (server-authoritative totals) ─────────────────
-- Items array shape: { variant_id, product_id, qty, product_name }
-- Prices are looked up from product_variants inside the function.
-- p_subtotal / p_delivery_fee / p_total are computed here — not accepted
-- from the caller — so financial totals cannot be manipulated externally.
CREATE OR REPLACE FUNCTION place_order(
  p_user_id        uuid,
  p_customer_name  text,
  p_phone          text,
  p_guest_email    text,
  p_address        text,
  p_notes          text,
  p_fulfillment_type text,
  p_delivery_zone  text,
  p_items          jsonb  -- [{ variant_id, product_id, qty, product_name }]
)
RETURNS jsonb  -- { order_number, subtotal, delivery_fee, total }
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
  -- ── 1. Compute delivery fee from zone (server-authoritative) ─
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

  -- ── 2. Validate every item, look up DB price, compute subtotal ─
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_item_qty := (v_item->>'qty')::integer;

    IF v_item_qty <= 0 THEN
      RAISE EXCEPTION 'INVALID_QTY: qty must be > 0 for variant_id %',
        (v_item->>'variant_id')::uuid;
    END IF;

    -- Look up price and active flags from the DB (not from the caller)
    SELECT
      pv.price,
      pv.active,
      p.active
    INTO
      v_variant_price,
      v_variant_active,
      v_product_active
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
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

  -- ── 3. Generate a race-condition-safe order number ────────────
  v_order_number := generate_order_number();

  -- ── 4. Insert the order row ───────────────────────────────────
  INSERT INTO orders (
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
    p_fulfillment_type::fulfillment_type,
    NULLIF(p_delivery_zone, '')::delivery_zone,
    v_subtotal,
    v_delivery_fee,
    v_total,
    'pending'::order_status
  )
  RETURNING id INTO v_order_id;

  -- ── 5. Log initial status history ────────────────────────────
  INSERT INTO order_status_history (order_id, status, changed_by)
  VALUES (v_order_id, 'pending'::order_status, p_user_id);

  -- ── 6. Decrement stock and insert order items ─────────────────
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_item_qty := (v_item->>'qty')::integer;

    -- Re-look up price for the snapshot (same transaction, consistent read)
    SELECT price INTO v_variant_price
    FROM product_variants
    WHERE id = (v_item->>'variant_id')::uuid;

    -- Atomic stock decrement — rolls back if stock is insufficient
    UPDATE product_variants
       SET stock_qty = stock_qty - v_item_qty
     WHERE id = (v_item->>'variant_id')::uuid
       AND stock_qty >= v_item_qty;

    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

    IF v_rows_updated = 0 THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK: variant_id %', (v_item->>'variant_id')::uuid;
    END IF;

    INSERT INTO order_items (
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

  -- ── 7. Return computed financials so the caller can use them ──
  RETURN jsonb_build_object(
    'order_number', v_order_number,
    'subtotal',     v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total',        v_total
  );
END;
$$;
