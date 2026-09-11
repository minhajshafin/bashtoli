import { createClient, createPublicClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import { unstable_cache } from 'next/cache'

export type ProductWithDetails = Database['public']['Tables']['products']['Row'] & {
  product_variants: Database['public']['Tables']['product_variants']['Row'][]
  product_images: Database['public']['Tables']['product_images']['Row'][]
  categories: Database['public']['Tables']['categories']['Row'] | null
}

interface GetStorefrontProductsParams {
  categorySlug?: string
  search?: string
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'new'
  page?: number
  limit?: number
}

/**
 * Fetch active products that have at least one active variant.
 * Supports filtering by category slug, name text search (ILIKE), sorting, and pagination.
 */
export async function getStorefrontProducts({
  categorySlug,
  search,
  sort = 'new',
  page = 1,
  limit = 12,
}: GetStorefrontProductsParams): Promise<{
  products: ProductWithDetails[]
  totalCount: number
}> {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  // Create base query
  // PostgREST !inner filter ensures that only products with at least one active variant are fetched.
  let query = supabase
    .from('products')
    .select(
      `
        *,
        product_variants!inner(*),
        product_images(*),
        categories:category_id(*)
      `,
      { count: 'exact' }
    )
    .eq('active', true)
    .eq('product_variants.active', true)

  // 1. Filter by category if slug is provided
  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle()

    if (!category) {
      return { products: [], totalCount: 0 }
    }
    query = query.eq('category_id', category.id)
  }

  // 2. Filter by name search if provided
  if (search && search.trim()) {
    query = query.ilike('name', `%${search.trim()}%`)
  }

  // 3. Sorting & Pagination
  if (sort === 'price-asc') {
    query = query.order('base_price', { ascending: true })
  } else if (sort === 'price-desc') {
    query = query.order('base_price', { ascending: false })
  } else if (sort === 'featured') {
    query = query.order('featured', { ascending: false }).order('created_at', { ascending: false })
  } else {
    // 'new' — newest first (default)
    query = query.order('created_at', { ascending: false })
  }

  query = query
    .order('sort_order', { referencedTable: 'product_images', ascending: true })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching storefront products:', error)
    return { products: [], totalCount: 0 }
  }

  return {
    products: (data as unknown as ProductWithDetails[]) || [],
    totalCount: count || 0,
  }
}

export interface StorefrontCategoryItem {
  id: string
  name: string
  slug: string
  sort_order: number
  activeProductsCount: number
}

/**
 * Fetch all categories with their product count.
 * Uses database-level embedded aggregation rather than transferring all products into memory.
 * Cached using Next.js unstable_cache with cookie-free anonymous client.
 */
export const getStorefrontCategories = unstable_cache(
  async (): Promise<StorefrontCategoryItem[]> => {
    const supabase = createPublicClient()

    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug, sort_order, products(count)')
      .eq('products.active', true)
      .order('sort_order', { ascending: true })

    if (error || !categories) {
      console.error('Error fetching storefront categories:', error)
      return []
    }

    return (categories as unknown as Array<{
      id: string
      name: string
      slug: string
      sort_order: number
      products?: Array<{ count: number }> | null
    }>).map((category) => {
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        sort_order: category.sort_order,
        activeProductsCount: category.products?.[0]?.count ?? 0,
      }
    })
  },
  ['storefront-categories'],
  {
    tags: ['categories'],
    revalidate: 3600,
  },
)

/**
 * Fetch active featured products.
 * Falls back to the 4 newest active products if no products are flagged as featured.
 * Cached using Next.js unstable_cache with cookie-free anonymous client.
 */
export const getFeaturedProducts = unstable_cache(
  async (): Promise<ProductWithDetails[]> => {
    const supabase = createPublicClient()

    // 1. Fetch featured, active products with variants and images
    const { data: featured, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants!inner(*),
        product_images(*),
        categories:category_id(*)
      `)
      .eq('active', true)
      .eq('product_variants.active', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })

    if (!error && featured && featured.length > 0) {
      return featured as unknown as ProductWithDetails[]
    }

    if (error) {
      console.error('Error fetching featured products:', error)
    }

    // 2. Fallback: 4 newest active products
    const { data: newest, error: newestError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants!inner(*),
        product_images(*),
        categories:category_id(*)
      `)
      .eq('active', true)
      .eq('product_variants.active', true)
      .order('created_at', { ascending: false })
      .limit(4)

    if (newestError) {
      console.error('Error fetching featured fallback products:', newestError)
      return []
    }

    return (newest as unknown as ProductWithDetails[]) || []
  },
  ['storefront-featured-products'],
  {
    tags: ['featured-products'],
    revalidate: 900,
  },
)
