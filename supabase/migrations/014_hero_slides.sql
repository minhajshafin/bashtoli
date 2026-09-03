-- ============================================================
-- 014_hero_slides.sql
-- Table, RLS policies, and triggers for dynamic hero carousel slides.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  badge_text TEXT NOT NULL DEFAULT 'New Collection',
  badge_color_preset TEXT NOT NULL DEFAULT 'gold'
    CHECK (badge_color_preset IN ('gold', 'forest', 'crimson', 'ocean', 'slate')),
  link_url TEXT NOT NULL DEFAULT '/products',
  subtext TEXT NOT NULL DEFAULT 'Now in store & online',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- In case table already exists, ensure subtext column is present
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS subtext TEXT NOT NULL DEFAULT 'Now in store & online';

-- Index for fast ordering on storefront
CREATE INDEX IF NOT EXISTS idx_hero_slides_sort ON public.hero_slides (sort_order, created_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_hero_slides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hero_slides_updated_at ON public.hero_slides;
CREATE TRIGGER trg_hero_slides_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW
  EXECUTE FUNCTION public.set_hero_slides_updated_at();

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- 1. Public SELECT for active slides
DROP POLICY IF EXISTS "hero_slides_public_read" ON public.hero_slides;
CREATE POLICY "hero_slides_public_read"
  ON public.hero_slides
  FOR SELECT
  USING (active = true);

-- 2. Staff/Admin full SELECT
DROP POLICY IF EXISTS "hero_slides_staff_read" ON public.hero_slides;
CREATE POLICY "hero_slides_staff_read"
  ON public.hero_slides
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('staff', 'admin')
    )
  );

-- 3. Staff/Admin INSERT
DROP POLICY IF EXISTS "hero_slides_staff_insert" ON public.hero_slides;
CREATE POLICY "hero_slides_staff_insert"
  ON public.hero_slides
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('staff', 'admin')
    )
  );

-- 4. Staff/Admin UPDATE
DROP POLICY IF EXISTS "hero_slides_staff_update" ON public.hero_slides;
CREATE POLICY "hero_slides_staff_update"
  ON public.hero_slides
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('staff', 'admin')
    )
  );

-- 5. Staff/Admin DELETE
DROP POLICY IF EXISTS "hero_slides_staff_delete" ON public.hero_slides;
CREATE POLICY "hero_slides_staff_delete"
  ON public.hero_slides
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('staff', 'admin')
    )
  );

-- Seed initial default slide
INSERT INTO public.hero_slides (
  id,
  image_url,
  alt_text,
  badge_text,
  badge_color_preset,
  link_url,
  subtext,
  sort_order,
  active
) VALUES (
  'e1111111-1111-1111-1111-111111111111',
  '/logo-text.svg',
  'Bashtoli Stationery New Collection',
  'New Collection',
  'gold',
  '/products',
  'Now in store & online',
  0,
  true
) ON CONFLICT (id) DO NOTHING;
