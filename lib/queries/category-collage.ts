import { createClient, createPublicClient } from '@/lib/supabase/server'
import type { FeaturedCategoryItem } from '@/lib/validations/category-collage'
import { MAX_FEATURED_CATEGORIES } from '@/lib/validations/category-collage'
import { unstable_rethrow } from 'next/navigation'
import { unstable_cache } from 'next/cache'

interface CategoryWithCountRow {
  id: string
  name: string
  slug: string
  image_url: string | null
  featured_order?: number | null
  is_featured?: boolean | null
  products?: Array<{ count: number }> | null
}

/**
 * Fetch featured categories for the storefront homepage 7-slot collage.
 * Includes active product counts for each category.
 * Cached using Next.js unstable_cache with cookie-free anonymous client.
 */
export const getFeaturedCollageCategories = unstable_cache(
  async (): Promise<FeaturedCategoryItem[]> => {
    try {
      const supabase = createPublicClient()

      // 1. Fetch featured categories with embedded product count
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*, products(count)')
        .eq('is_featured', true)
        .eq('products.active', true)
        .order('featured_order', { ascending: true })
        .limit(MAX_FEATURED_CATEGORIES)

      // Fallback: If no featured categories or column missing, fetch first 7 categories
      if (catError || !categories || categories.length === 0) {
        const { data: fallbackCats } = await supabase
          .from('categories')
          .select('*, products(count)')
          .eq('products.active', true)
          .order('sort_order', { ascending: true })
          .limit(MAX_FEATURED_CATEGORIES)

        if (!fallbackCats || fallbackCats.length === 0) return []

        return (fallbackCats as unknown as CategoryWithCountRow[]).map((cat, idx) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image_url: cat.image_url ?? null,
          featured_order: idx + 1,
          is_featured: true,
          product_count: cat.products?.[0]?.count ?? 0,
        }))
      }

      return (categories as unknown as CategoryWithCountRow[]).map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image_url: cat.image_url ?? null,
        featured_order: cat.featured_order || idx + 1,
        is_featured: cat.is_featured ?? true,
        product_count: cat.products?.[0]?.count ?? 0,
      }))
    } catch (err) {
      unstable_rethrow(err)
      console.warn('[CategoryCollage] Query error:', err)
      return []
    }
  },
  ['storefront-featured-collage-categories'],
  {
    tags: ['category-collage'],
    revalidate: 3600,
  },
)

/**
 * Fetch all categories for admin collage management.
 */
export async function getAdminCategoryCollageData(): Promise<{
  featured: FeaturedCategoryItem[]
  available: FeaturedCategoryItem[]
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*, products(count)')
      .order('sort_order', { ascending: true })

    if (error) {
      return { featured: [], available: [], error: error.message }
    }

    if (!categories) {
      return { featured: [], available: [], error: null }
    }

    const allMapped: FeaturedCategoryItem[] = (categories as unknown as CategoryWithCountRow[]).map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image_url: cat.image_url ?? null,
      featured_order: cat.featured_order ?? 0,
      is_featured: Boolean(cat.is_featured),
      product_count: cat.products?.[0]?.count ?? 0,
    }))

    const featured = allMapped
      .filter((c) => c.is_featured)
      .sort((a, b) => a.featured_order - b.featured_order)

    const available = allMapped.filter((c) => !c.is_featured)

    return { featured, available, error: null }
  } catch (err) {
    unstable_rethrow(err)
    return {
      featured: [],
      available: [],
      error: err instanceof Error ? err.message : 'Failed to load category collage data.',
    }
  }
}
