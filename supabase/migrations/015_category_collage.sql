-- ============================================================
-- 015_category_collage.sql
-- Add featured status, cover image, and ordering for storefront collage.
-- ============================================================

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS featured_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_categories_featured ON public.categories (is_featured, featured_order);

-- Pre-seed top 7 categories as featured (orders 1 through 7)
WITH ordered_cats AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order ASC, created_at ASC) as rn
  FROM public.categories
)
UPDATE public.categories c
SET is_featured = true,
    featured_order = oc.rn
FROM ordered_cats oc
WHERE c.id = oc.id AND oc.rn <= 7;
