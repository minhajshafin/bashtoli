-- ============================================================
-- 003_catalog.sql
-- Product catalog tables: categories, products, images,
-- options, option values, and variants.
--
-- Cascade rules (see database.md §6):
--   categories  deleted → products.category_id SET NULL
--   products    deleted → BLOCKED if referenced by order_items;
--                         otherwise CASCADE to images/options/variants
--   product_options deleted → CASCADE to product_option_values
-- ============================================================

-- ── categories ───────────────────────────────────────────────
CREATE TABLE categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        text        NOT NULL UNIQUE,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── products ─────────────────────────────────────────────────
CREATE TABLE products (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL,
  slug         text        NOT NULL UNIQUE,
  description  text,
  category_id  uuid        REFERENCES categories(id) ON DELETE SET NULL,
  base_price   numeric(12, 2) NOT NULL DEFAULT 0,
  active       boolean     NOT NULL DEFAULT false,
  featured     boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ── product_images ───────────────────────────────────────────
-- Cascade: product deleted → images deleted
CREATE TABLE product_images (
  id          uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         text     NOT NULL,
  alt_text    text,
  sort_order  integer  NOT NULL DEFAULT 0
);

-- ── product_options ──────────────────────────────────────────
-- Represents option axes per product, e.g. "Size", "Color".
-- Cascade: product deleted → options deleted
CREATE TABLE product_options (
  id          uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name        text     NOT NULL,
  sort_order  integer  NOT NULL DEFAULT 0
);

-- ── product_option_values ────────────────────────────────────
-- Values per option axis, e.g. "S", "M", "L".
-- Cascade: option deleted → values deleted
CREATE TABLE product_option_values (
  id          uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id   uuid     NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
  value       text     NOT NULL,
  sort_order  integer  NOT NULL DEFAULT 0
);

-- ── product_variants ─────────────────────────────────────────
-- One row per sellable SKU.
-- option_values is JSONB (tech debt — no FK to product_option_values;
-- application layer validates on every write).
-- Cascade: product deleted → RESTRICTED by order_items FK below;
--          if no order references exist, cascade is handled at app layer.
CREATE TABLE product_variants (
  id            uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid           NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  sku           text,
  option_values jsonb          NOT NULL DEFAULT '{}',
  stock_qty     integer        NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  price         numeric(12, 2) NOT NULL DEFAULT 0,
  active        boolean        NOT NULL DEFAULT true,
  created_at    timestamptz    NOT NULL DEFAULT now(),
  updated_at    timestamptz    NOT NULL DEFAULT now()
);
