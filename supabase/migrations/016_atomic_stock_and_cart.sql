-- ============================================================
-- 016_atomic_stock_and_cart.sql
--
-- Fixes two race conditions caused by read-modify-write patterns:
--
-- Critical #1: Inventory restocking on cancellation used
--   SELECT stock_qty → UPDATE stock_qty + qty, which loses
--   increments under concurrency. Replaced by an atomic
--   increment_stock() RPC.
--
-- High #5: Adding items to a DB cart used
--   SELECT existing.qty → UPDATE existing.qty + qty, which
--   loses additions under rapid concurrent requests. Replaced
--   by a cart_add_or_increment() RPC using INSERT ... ON CONFLICT.
-- ============================================================

-- ── Atomic stock increment ───────────────────────────────────
-- Atomically adds p_qty to the stock_qty of a product variant.
-- Uses a single UPDATE statement — no SELECT needed.
CREATE OR REPLACE FUNCTION increment_stock(
  p_variant_id uuid,
  p_qty        int
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE product_variants
  SET    stock_qty  = stock_qty + p_qty,
         updated_at = now()
  WHERE  id = p_variant_id;
$$;

-- ── Atomic cart add-or-increment ─────────────────────────────
-- Inserts a new cart_items row, or increments qty if the variant
-- is already in the cart. Returns the resulting qty.
-- Uses INSERT ... ON CONFLICT DO UPDATE — fully atomic.
CREATE OR REPLACE FUNCTION cart_add_or_increment(
  p_cart_id    uuid,
  p_variant_id uuid,
  p_qty        int,
  p_max_qty    int DEFAULT 99
)
RETURNS int
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO cart_items (cart_id, variant_id, qty)
  VALUES (p_cart_id, p_variant_id, LEAST(p_qty, p_max_qty))
  ON CONFLICT (cart_id, variant_id)
  DO UPDATE SET qty = LEAST(cart_items.qty + EXCLUDED.qty, p_max_qty)
  RETURNING qty;
$$;
