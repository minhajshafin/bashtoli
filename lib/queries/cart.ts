import { createClient } from '@/lib/supabase/server'
import type { Database, Json } from '@/lib/supabase/database.types'

type ProductRow = Database['public']['Tables']['products']['Row']

export interface ValidatedCartItem {
  variant_id: string
  price: number
  stock_qty: number
  active: boolean
  product_name: string
  option_values: Json
}

/**
 * Validates the database state of a list of variant IDs.
 * Checks active status of both variant and parent product, price, and stock levels.
 */
export async function validateCartItems(variantIds: string[]): Promise<ValidatedCartItem[]> {
  if (!variantIds || variantIds.length === 0) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_variants')
    .select('*, products!inner(*)')
    .in('id', variantIds)

  if (error) {
    console.error('Error validating cart items:', error)
    return []
  }

  return (data || []).map((v) => {
    // Safe parent product active status check
    const product = Array.isArray(v.products)
      ? (v.products[0] as ProductRow | undefined)
      : (v.products as unknown as ProductRow | null)
    
    const productActive = product ? product.active === true : false
    const productName = product ? product.name : 'Unknown Product'

    return {
      variant_id: v.id,
      price: v.price,
      stock_qty: v.stock_qty,
      active: v.active && productActive, // Both variant and parent product must be active
      product_name: productName,
      option_values: v.option_values,
    }
  })
}
