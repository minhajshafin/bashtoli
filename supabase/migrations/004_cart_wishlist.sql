-- ============================================================
-- 004_cart_wishlist.sql
-- Cart, cart items, wishlist, and saved addresses.
--
-- Cascade rules (see database.md §6):
--   profiles deleted → CASCADE to addresses, carts, wishlist
--   carts    deleted → CASCADE to cart_items
-- ============================================================

-- ── addresses ────────────────────────────────────────────────
CREATE TABLE addresses (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label         text,                        -- e.g. "Home", "Work"
  full_address  text        NOT NULL,
  phone         text,
  is_default    boolean     NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ── carts ────────────────────────────────────────────────────
CREATE TABLE carts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── cart_items ───────────────────────────────────────────────
-- Cascade: cart deleted → items deleted
CREATE TABLE cart_items (
  id          uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     uuid     NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id  uuid     NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  qty         integer  NOT NULL DEFAULT 1 CHECK (qty > 0),
  UNIQUE (cart_id, variant_id)
);

-- ── wishlist ─────────────────────────────────────────────────
-- Cascade: profile deleted → wishlist rows deleted
CREATE TABLE wishlist (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)              -- one entry per product per user
);
