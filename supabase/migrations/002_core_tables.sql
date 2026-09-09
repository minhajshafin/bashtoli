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
