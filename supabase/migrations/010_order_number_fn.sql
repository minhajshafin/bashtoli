-- ── generate_order_number ────────────────────────────────────
-- Generates unique human-readable order numbers in the format: ORD-YYYYMMDD-NNNN
-- counter resets daily.
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  date_str text;
  next_seq integer;
BEGIN
  date_str := to_char(CURRENT_DATE, 'YYYYMMDD');
  
  -- Extract max sequential order number for today and increment by 1
  SELECT COALESCE(MAX(SUBSTRING(order_number FROM 14)::integer), 0) + 1 INTO next_seq
  FROM orders
  WHERE order_number LIKE 'ORD-' || date_str || '-%';
  
  RETURN 'ORD-' || date_str || '-' || lpad(next_seq::text, 4, '0');
END;
$$;

-- ── place_order ──────────────────────────────────────────────
-- Server-side atomic transaction for placing a Cash on Delivery order.
-- Creates the order and order_items, writes status history, and decrements stock.
-- Aborts (rolls back) the entire transaction if stock is insufficient.
CREATE OR REPLACE FUNCTION place_order(
  p_user_id uuid,
  p_customer_name text,
  p_phone text,
  p_guest_email text,
  p_address text,
  p_notes text,
  p_fulfillment_type text,
  p_delivery_zone text,
  p_subtotal numeric,
  p_delivery_fee numeric,
  p_total numeric,
  p_items jsonb -- array of { variant_id: uuid, product_id: uuid, qty: integer, price_at_purchase: numeric, product_name: text }
)
RETURNS text -- returns the generated order number on success
LANGUAGE plpgsql
SECURITY DEFINER -- runs with definer privileges to bypass RLS policies during insertion
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_rows_updated integer;
BEGIN
  -- 1. Generate unique order number
  v_order_number := generate_order_number();

  -- 2. Insert order row
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
    p_subtotal,
    p_delivery_fee,
    p_total,
    'pending'::order_status
  )
  RETURNING id INTO v_order_id;

  -- 3. Log initial status history row
  INSERT INTO order_status_history (
    order_id,
    status,
    changed_by
  ) VALUES (
    v_order_id,
    'pending'::order_status,
    p_user_id
  );

  -- 4. Process each order item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    -- Try to decrement stock level atomically
    UPDATE product_variants
    SET stock_qty = stock_qty - (v_item->>'qty')::integer
    WHERE id = (v_item->>'variant_id')::uuid
      AND stock_qty >= (v_item->>'qty')::integer;

    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

    -- Rollback everything if any item has insufficient stock
    IF v_rows_updated = 0 THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK: variant_id %', (v_item->>'variant_id')::uuid;
    END IF;

    -- Insert order item row
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
      (v_item->>'qty')::integer,
      (v_item->>'price_at_purchase')::numeric,
      v_item->>'product_name'
    );
  END LOOP;

  RETURN v_order_number;
END;
$$;
