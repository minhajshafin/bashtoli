import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export type ProductWithDetails = Database['public']['Tables']['products']['Row'] & {
  product_variants: Database['public']['Tables']['product_variants']['Row'][]
  product_images: Database['public']['Tables']['product_images']['Row'][]
  categories: Database['public']['Tables']['categories']['Row'] | null
}

interface GetStorefrontProductsParams {
  categorySlug?: string
  search?: string
  page?: number
  limit?: number
}

/**
 * Fetch active products that have at least one active variant.
 * Supports filtering by category slug, name text search (ILIKE), and pagination.
 */
export async function getStorefrontProducts({
  categorySlug,
  search,
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
  query = query
    .order('created_at', { ascending: false })
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

/**
 * Fetch all categories with their product count.
 */
export async function getStorefrontCategories() {
  const supabase = await createClient()

  // Fetch categories and active products concurrently to count them manually
  const [categoriesRes, productsRes] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('category_id, active')
      .eq('active', true),
  ])

  if (categoriesRes.error) {
    console.error('Error fetching storefront categories:', categoriesRes.error)
    return []
  }

  const categories = categoriesRes.data || []
  const activeProducts = productsRes.data || []

  // Count active products per category
  const countMap = new Map<string, number>()
  for (const product of activeProducts) {
    if (product.category_id && product.active) {
      countMap.set(product.category_id, (countMap.get(product.category_id) ?? 0) + 1)
    }
  }

  return categories.map((category) => {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      sort_order: category.sort_order,
      activeProductsCount: countMap.get(category.id) ?? 0,
    }
  })
}

/**
 * Fetch active featured products.
 * Falls back to the 4 newest active products if no products are flagged as featured.
 */
export async function getFeaturedProducts(): Promise<ProductWithDetails[]> {
  const supabase = await createClient()

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
}
