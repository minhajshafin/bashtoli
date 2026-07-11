import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export type ProductVariantRow = Database['public']['Tables']['product_variants']['Row']
export type ProductImageRow = Database['public']['Tables']['product_images']['Row']
export type ProductOptionRow = Database['public']['Tables']['product_options']['Row']
export type ProductOptionValueRow = Database['public']['Tables']['product_option_values']['Row']

export interface ProductDetailData {
  product: Database['public']['Tables']['products']['Row'] & {
    categories: Database['public']['Tables']['categories']['Row'] | null
  }
  images: ProductImageRow[]
  variants: ProductVariantRow[]
  options: (ProductOptionRow & {
    values: ProductOptionValueRow[]
  })[]
}

/**
 * Fetch all details for a product by slug, filtering for active state.
 */
export async function getProductDetail(slug: string): Promise<ProductDetailData | null> {
  const supabase = await createClient()

  // 1. Fetch active product and its category
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*, categories:category_id(*)')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()

  if (productError || !product) {
    if (productError) console.error('Error fetching product:', productError)
    return null
  }

  // Safe cast for categories
  const typedProduct = {
    ...product,
    categories: Array.isArray(product.categories)
      ? product.categories[0] ?? null
      : product.categories ?? null,
  }

  // 2. Fetch images (ordered by sort_order)
  const { data: images, error: imagesError } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', product.id)
    .order('sort_order', { ascending: true })

  if (imagesError) {
    console.error('Error fetching product images:', imagesError)
  }

  // 3. Fetch active variants
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', product.id)
    .eq('active', true)

  if (variantsError) {
    console.error('Error fetching product variants:', variantsError)
  }

  // 4. Fetch options (ordered by sort_order)
  const { data: options, error: optionsError } = await supabase
    .from('product_options')
    .select('*')
    .eq('product_id', product.id)
    .order('sort_order', { ascending: true })

  if (optionsError) {
    console.error('Error fetching product options:', optionsError)
  }

  // 5. Fetch option values if there are options
  const optionIds = (options || []).map((o) => o.id)
  let optionValues: ProductOptionValueRow[] = []

  if (optionIds.length > 0) {
    const { data: values, error: valuesError } = await supabase
      .from('product_option_values')
      .select('*')
      .in('option_id', optionIds)
      .order('sort_order', { ascending: true })

    if (valuesError) {
      console.error('Error fetching product option values:', valuesError)
    } else {
      optionValues = values || []
    }
  }

  // Combine options and their values
  const structuredOptions = (options || []).map((opt) => {
    const valuesForOpt = optionValues.filter((val) => val.option_id === opt.id)
    return {
      ...opt,
      values: valuesForOpt,
    }
  })

  return {
    product: typedProduct,
    images: images || [],
    variants: variants || [],
    options: structuredOptions,
  }
}
