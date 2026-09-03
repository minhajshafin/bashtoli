import { createClient } from '@/lib/supabase/server'
import type { FeaturedCategoryItem } from '@/lib/validations/category-collage'
import { MAX_FEATURED_CATEGORIES } from '@/lib/validations/category-collage'

/**
 * Fetch featured categories for the storefront homepage 7-slot collage.
 * Includes active product counts for each category.
 */
export async function getFeaturedCollageCategories(): Promise<FeaturedCategoryItem[]> {
  try {
    const supabase = await createClient()

    // 1. Fetch featured categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_featured', true)
      .order('featured_order', { ascending: true })
      .limit(MAX_FEATURED_CATEGORIES)

    // Fallback: If no featured categories or column missing, fetch first 7 categories
    if (catError || !categories || categories.length === 0) {
      const { data: fallbackCats } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .limit(MAX_FEATURED_CATEGORIES)

      if (!fallbackCats || fallbackCats.length === 0) return []

      return fallbackCats.map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image_url: cat.image_url ?? null,
        featured_order: idx + 1,
        is_featured: true,
        product_count: 0,
      }))
    }

    // 2. Fetch active product counts grouped by category
    const { data: products } = await supabase
      .from('products')
      .select('category_id')
      .eq('active', true)
      .not('category_id', 'is', null)

    const countMap: Record<string, number> = {}
    if (products) {
      for (const p of products) {
        if (p.category_id) {
          countMap[p.category_id] = (countMap[p.category_id] || 0) + 1
        }
      }
    }

    return categories.map((cat, idx) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image_url: cat.image_url ?? null,
      featured_order: cat.featured_order || idx + 1,
      is_featured: cat.is_featured ?? true,
      product_count: countMap[cat.id] || 0,
    }))
  } catch (err) {
    console.warn('[CategoryCollage] Query error:', err)
    return []
  }
}

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
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      return { featured: [], available: [], error: error.message }
    }

    if (!categories) {
      return { featured: [], available: [], error: null }
    }

    // Product counts
    const { data: products } = await supabase
      .from('products')
      .select('category_id')
      .not('category_id', 'is', null)

    const countMap: Record<string, number> = {}
    if (products) {
      for (const p of products) {
        if (p.category_id) {
          countMap[p.category_id] = (countMap[p.category_id] || 0) + 1
        }
      }
    }

    const allMapped: FeaturedCategoryItem[] = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image_url: cat.image_url ?? null,
      featured_order: cat.featured_order ?? 0,
      is_featured: Boolean(cat.is_featured),
      product_count: countMap[cat.id] || 0,
    }))

    const featured = allMapped
      .filter((c) => c.is_featured)
      .sort((a, b) => a.featured_order - b.featured_order)

    const available = allMapped.filter((c) => !c.is_featured)

    return { featured, available, error: null }
  } catch (err) {
    return {
      featured: [],
      available: [],
      error: err instanceof Error ? err.message : 'Failed to load category collage data.',
    }
  }
}
