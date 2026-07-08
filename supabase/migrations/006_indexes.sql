-- ============================================================
-- 006_indexes.sql
-- Performance indexes for the most common query patterns.
-- All indexes are created CONCURRENTLY-safe (no table lock needed
-- at this stage since tables are empty at migration time).
-- ============================================================

-- orders: guest lookup by order number; admin search
CREATE INDEX idx_orders_order_number  ON orders (order_number);

-- orders: filter by status (e.g. "show all pending orders")
CREATE INDEX idx_orders_status        ON orders (status);

-- products: category browse page
CREATE INDEX idx_products_category_id ON products (category_id);

-- products: storefront queries filter active=true
CREATE INDEX idx_products_active      ON products (active);

-- product_variants: variant lookup by parent product
CREATE INDEX idx_variants_product_id  ON product_variants (product_id);
