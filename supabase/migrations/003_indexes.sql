-- ============================================================
-- 003_indexes.sql
-- High-performance query indexes for storefront navigation,
-- order lookups, and admin filtering.
-- ============================================================

-- ── orders & order items ──────────────────────────────────────
-- Filter orders by status (e.g. pending orders queue)
CREATE INDEX IF NOT EXISTS idx_orders_status        ON public.orders (status);

-- Customer orders list lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id       ON public.orders (user_id);

-- Order items lookup by order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);

-- Order status transition history lookups
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history (order_id);

-- ── addresses ────────────────────────────────────────────────
-- Customer saved address lookups
CREATE INDEX IF NOT EXISTS idx_addresses_user_id    ON public.addresses (user_id);

-- ── products & variants ──────────────────────────────────────
-- Category browse page filtering
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);

-- Storefront queries filtering active products
CREATE INDEX IF NOT EXISTS idx_products_active      ON public.products (active);

-- Main storefront category browsing: active products by category ordered by newest
CREATE INDEX IF NOT EXISTS idx_products_active_category_created ON public.products (active, category_id, created_at DESC);

-- Price sorting on active products
CREATE INDEX IF NOT EXISTS idx_products_active_price ON public.products (active, base_price);

-- Featured sorting on active products
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON public.products (active, featured DESC, created_at DESC);

-- Product slug lookup for active products
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug) WHERE active = true;

-- Product images by product ordered by sort_order
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images (product_id, sort_order);

-- Variant lookup by parent product
CREATE INDEX IF NOT EXISTS idx_variants_product_id  ON public.product_variants (product_id);

-- Product options lookup by parent product
CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON public.product_options (product_id);

-- Option values lookup by option
CREATE INDEX IF NOT EXISTS idx_product_option_values_option_id ON public.product_option_values (option_id);

-- ── categories ───────────────────────────────────────────────
-- Homepage 7-slot category collage grid ordering
CREATE INDEX IF NOT EXISTS idx_categories_featured  ON public.categories (is_featured, featured_order);

-- ── hero_slides ──────────────────────────────────────────────
-- Homepage hero carousel display sorting
CREATE INDEX IF NOT EXISTS idx_hero_slides_sort     ON public.hero_slides (sort_order, created_at);
