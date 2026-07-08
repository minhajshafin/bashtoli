-- ============================================================
-- 005_orders.sql
-- Orders, order items, and order status history.
--
-- Cascade rules (see database.md §6):
--   profiles deleted → orders.user_id SET NULL (guest-style)
--   orders   deleted → CASCADE to order_items, order_status_history
--
-- Note: order_items.product_id / variant_id use RESTRICT so that
-- products with existing orders cannot be hard-deleted (app layer
-- must soft-delete via products.active = false instead).
-- ============================================================

-- ── orders ───────────────────────────────────────────────────
CREATE TABLE orders (
  id               uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     text             NOT NULL UNIQUE,    -- ORD-YYYYMMDD-NNNN
  user_id          uuid             REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name    text             NOT NULL,
  phone            text             NOT NULL,
  guest_email      text,
  address          text             NOT NULL,
  notes            text,
  fulfillment_type fulfillment_type NOT NULL,
  delivery_zone    delivery_zone,                       -- NULL when pickup
  subtotal         numeric(12, 2)   NOT NULL DEFAULT 0,
  delivery_fee     numeric(12, 2)   NOT NULL DEFAULT 0,
  total            numeric(12, 2)   NOT NULL DEFAULT 0,
  status           order_status     NOT NULL DEFAULT 'pending',
  created_at       timestamptz      NOT NULL DEFAULT now(),
  updated_at       timestamptz      NOT NULL DEFAULT now()
);

-- ── order_items ───────────────────────────────────────────────
-- Snapshot of items at time of order (prices do not change retroactively).
-- Cascade: order deleted → items deleted.
-- FK to products/variants is RESTRICT so products with orders can't be hard-deleted.
CREATE TABLE order_items (
  id                uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        uuid           NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id        uuid           NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  qty               integer        NOT NULL CHECK (qty > 0),
  price_at_purchase numeric(12, 2) NOT NULL,
  product_name      text           NOT NULL   -- name snapshot at order time
);

-- ── order_status_history ──────────────────────────────────────
-- Immutable audit log of every status transition.
-- Cascade: order deleted → history deleted.
CREATE TABLE order_status_history (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      order_status NOT NULL,
  changed_by  uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at  timestamptz NOT NULL DEFAULT now()
);
