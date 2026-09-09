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

-- Variant lookup by parent product
CREATE INDEX IF NOT EXISTS idx_variants_product_id  ON public.product_variants (product_id);

-- ── categories ───────────────────────────────────────────────
-- Homepage 7-slot category collage grid ordering
CREATE INDEX IF NOT EXISTS idx_categories_featured  ON public.categories (is_featured, featured_order);

-- ── hero_slides ──────────────────────────────────────────────
-- Homepage hero carousel display sorting
CREATE INDEX IF NOT EXISTS idx_hero_slides_sort     ON public.hero_slides (sort_order, created_at);
