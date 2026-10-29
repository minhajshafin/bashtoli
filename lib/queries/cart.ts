'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database, Json } from '@/lib/supabase/database.types'
import { sanitizeActionError } from '@/lib/utils/action-error'
import type { CartItem } from '@/lib/cart/guest-cart'

export type { CartItem }

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

/**
 * Validates a list of variant IDs in the database with error sanitization.
 * Returns the current prices, stocks, and active flags.
 */
export async function checkCartItemsAvailability(
  variantIds: string[]
): Promise<ValidatedCartItem[]> {
  try {
    return await validateCartItems(variantIds)
  } catch (error) {
    sanitizeActionError('cart:validate', error)
    return []
  }
}

/**
 * Fetches the authenticated user's cart.
 * Filters out deactivated products/variants and returns a clean CartItem[] array.
 */
export async function fetchDbCart(): Promise<CartItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  try {
    // 1. Fetch or create customer cart
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select('id')
        .maybeSingle()

      if (createError) throw createError
      cart = newCart
    }

    if (!cart) return []

    // 2. Fetch cart items
    const { data: items } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)

    if (!items || items.length === 0) return []

    const variantIds = items.map((i) => i.variant_id)

    // 3. Fetch active variants details
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .in('id', variantIds)
      .eq('active', true)

    if (!variants || variants.length === 0) return []

    const activeProductIds = Array.from(new Set(variants.map((v) => v.product_id)))

    // 4. Fetch active products details
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', activeProductIds)
      .eq('active', true)

    if (!products || products.length === 0) return []

    // 5. Fetch product images
    const { data: images } = await supabase
      .from('product_images')
      .select('*')
      .in('product_id', activeProductIds)

    // 6. Map to unified CartItem format
    const cartItems: CartItem[] = []

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variant_id)
      if (!variant) continue // skip inactive variants

      const product = products.find((p) => p.id === variant.product_id)
      if (!product) continue // skip inactive products

      const prodImages = (images || []).filter((img) => img.product_id === product.id)
      const primaryImage = prodImages.sort((a, b) => a.sort_order - b.sort_order)[0]

      const optVals = (variant.option_values || {}) as Record<string, string>
      const variantName =
        Object.keys(optVals).length > 0
          ? Object.values(optVals).join(' / ')
          : 'Default'

      cartItems.push({
        variant_id: variant.id,
        product_id: product.id,
        name: product.name,
        variant_name: variantName,
        price: Number(variant.price),
        image_url: primaryImage?.url || null,
        qty: item.qty,
      })
    }

    return cartItems
  } catch (err) {
    sanitizeActionError('cart:fetch', err)
    return []
  }
}
