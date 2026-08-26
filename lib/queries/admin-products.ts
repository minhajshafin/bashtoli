import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export const ADMIN_PRODUCTS_PAGE_SIZE = 25

type ProductRow = Database['public']['Tables']['products']['Row']
type CategoryRow = Database['public']['Tables']['categories']['Row']
type OptionValueRow = Database['public']['Tables']['product_option_values']['Row']

/** Shape returned by fetchAdminProducts — a product row with its joined category. */
export type AdminProductListItem = ProductRow & {
  categories: CategoryRow | null
}

/** Full product detail shape used by the edit product page. */
export type AdminProductDetail = {
  product: ProductRow
  categories: CategoryRow[]
  options: Array<{ name: string; values: string[] }>
  variants: Database['public']['Tables']['product_variants']['Row'][]
  images: Database['public']['Tables']['product_images']['Row'][]
}

/**
 * Fetches a paginated, filterable list of all products joined with their category.
 * Throws on query errors so callers can surface them uniformly.
 */
export async function fetchAdminProducts(filters: {
  status?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<{ products: AdminProductListItem[]; totalCount: number }> {
  const supabase = await createClient()

  const { page = 1, pageSize = ADMIN_PRODUCTS_PAGE_SIZE } = filters
  const safePage = Math.max(1, page)
  const offset = (safePage - 1) * pageSize

  let query = supabase
    .from('products')
    .select('*, categories(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (filters.status === 'active') {
    query = query.eq('active', true)
  } else if (filters.status === 'draft' || filters.status === 'inactive') {
    query = query.eq('active', false)
  }

  if (filters.search?.trim()) {
    query = query.ilike('name', `%${filters.search.trim()}%`)
  }

  const { data, count, error } = await query
  if (error) throw error

  // Normalise the Supabase join — categories can be an object or a 1-element array
  const products = (data ?? []).map((p) => ({
    ...p,
    categories: Array.isArray(p.categories)
      ? ((p.categories[0] ?? null) as unknown as CategoryRow | null)
      : ((p.categories ?? null) as unknown as CategoryRow | null),
  })) as AdminProductListItem[]

  return { products, totalCount: count ?? 0 }
}

/**
 * Fetches all categories sorted by sort_order then name.
 * Wrapped in React cache() so multiple server components in the same request
 * (e.g. new product page + edit product page) share one DB round-trip.
 */
export const fetchAdminCategories = cache(async (): Promise<CategoryRow[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
})

/**
 * Fetches a single product with all its related data (categories, options+values,
 * variants, images) using a parallel Promise.all strategy.
 *
 * Returns null when the product doesn't exist.
 * Throws an Error for any other query failure so the page can surface it.
 * Wrapped in React cache() to deduplicate repeated calls within one render pass.
 */
export const fetchAdminProductDetail = cache(
  async (id: string): Promise<AdminProductDetail | null> => {
    const supabase = await createClient()

    const [productRes, categoriesRes, optionsRes, variantsRes, imagesRes] =
      await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true }),
        supabase
          .from('product_options')
          .select('*')
          .eq('product_id', id)
          .order('sort_order', { ascending: true }),
        supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', id)
          .order('created_at', { ascending: true }),
        supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id)
          .order('sort_order', { ascending: true }),
      ])

    // Product not found — caller should call notFound()
    if (productRes.error || !productRes.data) return null

    // All other failures are unexpected — surface them
    if (categoriesRes.error)
      throw new Error(`Failed to load categories: ${categoriesRes.error.message}`)
    if (optionsRes.error)
      throw new Error(`Failed to load options: ${optionsRes.error.message}`)
    if (variantsRes.error)
      throw new Error(`Failed to load variants: ${variantsRes.error.message}`)
    if (imagesRes.error)
      throw new Error(`Failed to load images: ${imagesRes.error.message}`)

    // Option values must be fetched after we have the option IDs
    const optionIds = (optionsRes.data ?? []).map((opt) => opt.id)
    let optionValues: OptionValueRow[] = []

    if (optionIds.length > 0) {
      const { data: valData, error: valError } = await supabase
        .from('product_option_values')
        .select('*')
        .in('option_id', optionIds)
        .order('sort_order', { ascending: true })

      if (valError)
        throw new Error(`Failed to load option values: ${valError.message}`)
      optionValues = valData ?? []
    }

    const formattedOptions = (optionsRes.data ?? []).map((opt) => ({
      name: opt.name,
      values: optionValues
        .filter((v) => v.option_id === opt.id)
        .map((v) => v.value),
    }))

    return {
      product: productRes.data,
      categories: categoriesRes.data ?? [],
      options: formattedOptions,
      variants: variantsRes.data ?? [],
      images: imagesRes.data ?? [],
    }
  },
)
