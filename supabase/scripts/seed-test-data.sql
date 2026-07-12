-- Seed Test Data for E2E and Local Testing
-- Inserts a test category, product, and active variant with known stock.

-- 1. Insert Test Category
INSERT INTO public.categories (id, name, slug, sort_order)
VALUES (
  'c1111111-1111-1111-1111-111111111111',
  'E2E Test Category',
  'e2e-test-category',
  999
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug;

-- 2. Insert Test Product
INSERT INTO public.products (id, category_id, name, slug, description, active)
VALUES (
  'f1111111-1111-1111-1111-111111111111',
  'c1111111-1111-1111-1111-111111111111',
  'E2E Test Bamboo Product',
  'e2e-test-bamboo-product',
  'An active bamboo test product seeded for Playwright checkout flow tests.',
  true
)
ON CONFLICT (id) DO UPDATE
SET category_id = EXCLUDED.category_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    active = EXCLUDED.active;

-- 3. Insert Test Product Variant
INSERT INTO public.product_variants (id, product_id, sku, price, stock_qty, active, option_values)
VALUES (
  'd1111111-1111-1111-1111-111111111111',
  'f1111111-1111-1111-1111-111111111111',
  'E2E-TEST-SKU-001',
  250.00,
  50, -- high stock quantity to support repeating checkouts
  true,
  '{}'::jsonb
)
ON CONFLICT (id) DO UPDATE
SET product_id = EXCLUDED.product_id,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    stock_qty = EXCLUDED.stock_qty,
    active = EXCLUDED.active,
    option_values = EXCLUDED.option_values;
