-- ============================================================
-- supabase/tests/place_order_smoke.sql
-- Self-contained smoke tests for public.place_order() RPC.
--
-- Validates:
--   (a) Pickup order without idempotency key creates order with non-null total and 0 delivery fee.
--   (b) Duplicate order invocation with identical idempotency_key returns identical order number
--       and access token, and decrements inventory stock exactly once.
--   (c) Delivery orders correctly compute and append inside_dhaka (70 BDT) and outside_dhaka (120 BDT) fees.
--
-- Safety:
--   Wrapped completely in BEGIN ... ROLLBACK to guarantee no test artifacts
--   or stock changes persist in the database.
-- ============================================================

BEGIN;

DO $$
DECLARE
  -- Seeded test catalog IDs (matching supabase/scripts/seed-test-data.sql)
  c_variant_id constant uuid := 'd1111111-1111-1111-1111-111111111111';
  c_product_id constant uuid := 'f1111111-1111-1111-1111-111111111111';

  -- Test outputs
  v_res_pickup   jsonb;
  v_res_idem_1   jsonb;
  v_res_idem_2   jsonb;
  v_res_inside   jsonb;
  v_res_outside  jsonb;

  -- Verification variables
  v_idem_key         uuid;
  v_stock_before     int;
  v_stock_middle     int;
  v_stock_after      int;
  v_count            int;
  v_db_subtotal      numeric(12,2);
  v_db_delivery_fee  numeric(12,2);
  v_db_total         numeric(12,2);
BEGIN
  -- Ensure seeded test catalog records exist for testing
  INSERT INTO public.categories (id, name, slug, sort_order)
  VALUES ('c1111111-1111-1111-1111-111111111111', 'Smoke Test Category', 'smoke-test-category', 999)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.products (id, category_id, name, slug, description, active)
  VALUES (c_product_id, 'c1111111-1111-1111-1111-111111111111', 'E2E Test Bamboo Product', 'e2e-test-bamboo-product', 'Seeded test product', true)
  ON CONFLICT (id) DO UPDATE SET active = true;

  INSERT INTO public.product_variants (id, product_id, sku, price, stock_qty, active, option_values)
  VALUES (c_variant_id, c_product_id, 'E2E-TEST-SKU-001', 250.00, 50, true, '{}'::jsonb)
  ON CONFLICT (id) DO UPDATE SET active = true, stock_qty = GREATEST(product_variants.stock_qty, 50);

  -- ────────────────────────────────────────────────────────────
  -- Test (a): Pickup item with NO idempotency key
  -- Asserts non-null total, non-null subtotal, delivery_fee = 0
  -- ────────────────────────────────────────────────────────────
  v_res_pickup := public.place_order(
    p_user_id          => NULL,
    p_customer_name    => 'Smoke Test Pickup User',
    p_phone            => '01712345678',
    p_guest_email      => 'smoke-pickup@example.com',
    p_address          => 'Store Pickup Counter',
    p_notes            => 'Test pickup order',
    p_fulfillment_type => 'pickup',
    p_delivery_zone    => NULL,
    p_items            => jsonb_build_array(
      jsonb_build_object(
        'variant_id', c_variant_id,
        'product_id', c_product_id,
        'qty', 1,
        'product_name', 'E2E Test Bamboo Product'
      )
    ),
    p_idempotency_key  => NULL
  );

  IF v_res_pickup IS NULL THEN
    RAISE EXCEPTION 'Test (a) FAILED: place_order returned NULL';
  END IF;

  IF (v_res_pickup->>'total') IS NULL THEN
    RAISE EXCEPTION 'Test (a) FAILED: returned total is NULL';
  END IF;

  IF (v_res_pickup->>'subtotal') IS NULL THEN
    RAISE EXCEPTION 'Test (a) FAILED: returned subtotal is NULL';
  END IF;

  IF (v_res_pickup->>'delivery_fee')::numeric <> 0.00 THEN
    RAISE EXCEPTION 'Test (a) FAILED: pickup delivery_fee expected 0, got %', v_res_pickup->>'delivery_fee';
  END IF;

  IF (v_res_pickup->>'total')::numeric <> (v_res_pickup->>'subtotal')::numeric THEN
    RAISE EXCEPTION 'Test (a) FAILED: pickup total (%) does not match subtotal (%)',
      v_res_pickup->>'total', v_res_pickup->>'subtotal';
  END IF;

  -- Verify persisted row in orders table
  SELECT subtotal, delivery_fee, total
    INTO v_db_subtotal, v_db_delivery_fee, v_db_total
    FROM public.orders
   WHERE order_number = v_res_pickup->>'order_number';

  IF v_db_subtotal IS NULL OR v_db_total IS NULL THEN
    RAISE EXCEPTION 'Test (a) FAILED: orders table record has NULL subtotal or total';
  END IF;

  -- ────────────────────────────────────────────────────────────
  -- Test (b): Duplicate call with identical idempotency key
  -- Asserts same order_number, same access_token, stock decremented exactly once
  -- ────────────────────────────────────────────────────────────
  v_idem_key := gen_random_uuid();

  SELECT stock_qty INTO v_stock_before
  FROM public.product_variants
  WHERE id = c_variant_id;

  -- First invocation
  v_res_idem_1 := public.place_order(
    p_user_id          => NULL,
    p_customer_name    => 'Smoke Test Idem User',
    p_phone            => '01712345678',
    p_guest_email      => 'smoke-idem@example.com',
    p_address          => '123 Dhaka Road',
    p_notes            => 'First attempt',
    p_fulfillment_type => 'pickup',
    p_delivery_zone    => NULL,
    p_items            => jsonb_build_array(
      jsonb_build_object(
        'variant_id', c_variant_id,
        'product_id', c_product_id,
        'qty', 2,
        'product_name', 'E2E Test Bamboo Product'
      )
    ),
    p_idempotency_key  => v_idem_key
  );

  SELECT stock_qty INTO v_stock_middle
  FROM public.product_variants
  WHERE id = c_variant_id;

  IF v_stock_before - v_stock_middle <> 2 THEN
    RAISE EXCEPTION 'Test (b) FAILED: stock did not drop by 2 on first attempt (before=%, after=%)',
      v_stock_before, v_stock_middle;
  END IF;

  -- Second invocation with exact same idempotency key
  v_res_idem_2 := public.place_order(
    p_user_id          => NULL,
    p_customer_name    => 'Smoke Test Idem User',
    p_phone            => '01712345678',
    p_guest_email      => 'smoke-idem@example.com',
    p_address          => '123 Dhaka Road',
    p_notes            => 'Second attempt retry',
    p_fulfillment_type => 'pickup',
    p_delivery_zone    => NULL,
    p_items            => jsonb_build_array(
      jsonb_build_object(
        'variant_id', c_variant_id,
        'product_id', c_product_id,
        'qty', 2,
        'product_name', 'E2E Test Bamboo Product'
      )
    ),
    p_idempotency_key  => v_idem_key
  );

  SELECT stock_qty INTO v_stock_after
  FROM public.product_variants
  WHERE id = c_variant_id;

  -- Verify identical order details returned
  IF v_res_idem_1->>'order_number' <> v_res_idem_2->>'order_number' THEN
    RAISE EXCEPTION 'Test (b) FAILED: order_number mismatch (% vs %)',
      v_res_idem_1->>'order_number', v_res_idem_2->>'order_number';
  END IF;

  IF v_res_idem_1->>'access_token' <> v_res_idem_2->>'access_token' THEN
    RAISE EXCEPTION 'Test (b) FAILED: access_token mismatch on idempotent return';
  END IF;

  -- Verify stock did not drop again
  IF v_stock_middle <> v_stock_after THEN
    RAISE EXCEPTION 'Test (b) FAILED: stock dropped again on duplicate attempt (middle=%, after=%)',
      v_stock_middle, v_stock_after;
  END IF;

  -- Verify total stock drop was exactly 2 (once)
  IF v_stock_before - v_stock_after <> 2 THEN
    RAISE EXCEPTION 'Test (b) FAILED: total stock drop was %, expected 2',
      v_stock_before - v_stock_after;
  END IF;

  -- Verify exactly 1 order row persisted for this idempotency key
  SELECT count(*) INTO v_count
  FROM public.orders
  WHERE idempotency_key = v_idem_key;

  IF v_count <> 1 THEN
    RAISE EXCEPTION 'Test (b) FAILED: duplicate order rows created in orders table (count=%)', v_count;
  END IF;

  -- ────────────────────────────────────────────────────────────
  -- Test (c): Delivery fee calculations
  -- Asserts inside_dhaka adds 70 BDT and outside_dhaka adds 120 BDT
  -- ────────────────────────────────────────────────────────────
  -- c.1: Inside Dhaka (+70 BDT)
  v_res_inside := public.place_order(
    p_user_id          => NULL,
    p_customer_name    => 'Smoke Delivery Inside User',
    p_phone            => '01712345678',
    p_guest_email      => 'smoke-inside@example.com',
    p_address          => 'House 1, Road 2, Dhanmondi, Dhaka',
    p_notes            => NULL,
    p_fulfillment_type => 'delivery',
    p_delivery_zone    => 'inside_dhaka',
    p_items            => jsonb_build_array(
      jsonb_build_object(
        'variant_id', c_variant_id,
        'product_id', c_product_id,
        'qty', 1,
        'product_name', 'E2E Test Bamboo Product'
      )
    ),
    p_idempotency_key  => NULL
  );

  IF (v_res_inside->>'delivery_fee')::numeric <> 70.00 THEN
    RAISE EXCEPTION 'Test (c.1) FAILED: inside_dhaka fee expected 70.00, got %',
      v_res_inside->>'delivery_fee';
  END IF;

  IF (v_res_inside->>'total')::numeric <> (v_res_inside->>'subtotal')::numeric + 70.00 THEN
    RAISE EXCEPTION 'Test (c.1) FAILED: inside_dhaka total (%) != subtotal (%) + 70',
      v_res_inside->>'total', v_res_inside->>'subtotal';
  END IF;

  -- c.2: Outside Dhaka (+120 BDT)
  v_res_outside := public.place_order(
    p_user_id          => NULL,
    p_customer_name    => 'Smoke Delivery Outside User',
    p_phone            => '01712345678',
    p_guest_email      => 'smoke-outside@example.com',
    p_address          => 'GEC Circle, Chittagong',
    p_notes            => NULL,
    p_fulfillment_type => 'delivery',
    p_delivery_zone    => 'outside_dhaka',
    p_items            => jsonb_build_array(
      jsonb_build_object(
        'variant_id', c_variant_id,
        'product_id', c_product_id,
        'qty', 1,
        'product_name', 'E2E Test Bamboo Product'
      )
    ),
    p_idempotency_key  => NULL
  );

  IF (v_res_outside->>'delivery_fee')::numeric <> 120.00 THEN
    RAISE EXCEPTION 'Test (c.2) FAILED: outside_dhaka fee expected 120.00, got %',
      v_res_outside->>'delivery_fee';
  END IF;

  IF (v_res_outside->>'total')::numeric <> (v_res_outside->>'subtotal')::numeric + 120.00 THEN
    RAISE EXCEPTION 'Test (c.2) FAILED: outside_dhaka total (%) != subtotal (%) + 120',
      v_res_outside->>'total', v_res_outside->>'subtotal';
  END IF;

  RAISE NOTICE 'SUCCESS: All place_order smoke tests passed (pickup non-null total, idempotency stock single decrement, and delivery zone fees).';
END $$;

ROLLBACK;
