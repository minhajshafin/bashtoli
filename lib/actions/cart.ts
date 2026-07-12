'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { validateCartItems, type ValidatedCartItem } from '@/lib/queries/cart'

interface CartItem {
  variant_id: string
  product_id: string
  name: string
  variant_name: string
  price: number
  image_url: string | null
  qty: number
}

/**
 * Server Action: Validates a list of variant IDs in the database.
 * Returns the current prices, stocks, and active flags.
 */
export async function checkCartItemsAvailability(
  variantIds: string[]
): Promise<ValidatedCartItem[]> {
  try {
    return await validateCartItems(variantIds)
  } catch (error) {
    console.error('Failed to validate cart items:', error)
    return []
  }
}

/**
 * Server Action: Fetches the authenticated user's cart.
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
      const variantName = Object.keys(optVals).length > 0
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
    console.error('Fetch DB Cart Error:', err)
    return []
  }
}

/**
 * Server Action: Adds an item to the database cart.
 */
export async function addToDbCartAction(variantId: string, qty: number): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!cart) {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select('id')
        .maybeSingle()
      cart = newCart
    }

    if (!cart) return { error: 'Failed to access cart' }

    // Check if variant already exists in DB cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, qty')
      .eq('cart_id', cart.id)
      .eq('variant_id', variantId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ qty: existing.qty + qty })
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          variant_id: variantId,
          qty,
        })
      if (error) throw error
    }

    revalidatePath('/cart')
    return { error: null }
  } catch (err) {
    console.error('Add to DB cart error:', err)
    return { error: 'Failed to update cart.' }
  }
}

/**
 * Server Action: Updates quantity of an item in the database cart.
 */
export async function updateDbCartQtyAction(variantId: string, qty: number): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!cart) return { error: 'Cart not found' }

    const { error } = await supabase
      .from('cart_items')
      .update({ qty: Math.max(1, qty) })
      .eq('cart_id', cart.id)
      .eq('variant_id', variantId)

    if (error) throw error

    revalidatePath('/cart')
    return { error: null }
  } catch (err) {
    console.error('Update DB cart qty error:', err)
    return { error: 'Failed to update quantity.' }
  }
}

/**
 * Server Action: Removes an item from the database cart.
 */
export async function removeFromDbCartAction(variantId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!cart) return { error: 'Cart not found' }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)
      .eq('variant_id', variantId)

    if (error) throw error

    revalidatePath('/cart')
    return { error: null }
  } catch (err) {
    console.error('Remove from DB cart error:', err)
    return { error: 'Failed to remove item.' }
  }
}

/**
 * Server Action: Empties the database cart.
 */
export async function clearDbCartAction(): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!cart) return { error: 'Cart not found' }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)

    if (error) throw error

    revalidatePath('/cart')
    return { error: null }
  } catch (err) {
    console.error('Clear DB cart error:', err)
    return { error: 'Failed to clear cart.' }
  }
}

/**
 * Server Action: Merges a guest cart into the database cart.
 * Keeps higher quantity on overlap, ignores deactivated items.
 */
export async function mergeGuestCartAction(
  guestItems: CartItem[]
): Promise<{ error: string | null; success?: boolean; notifications?: string[] }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    // 1. Get or create customer database cart
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!cart) {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select('id')
        .maybeSingle()
      cart = newCart
    }

    if (!cart) return { error: 'Failed to access cart.' }

    // 2. Fetch existing items in DB cart
    const { data: dbItems } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)

    const existingDbItems = dbItems || []

    // 3. Verify availability of guest variants
    const guestVariantIds = guestItems.map((item) => item.variant_id)
    if (guestVariantIds.length === 0) {
      return { error: null, success: true }
    }

    const { data: activeVariants } = await supabase
      .from('product_variants')
      .select('id, active, product_id')
      .in('id', guestVariantIds)

    const activeVariantMap = new Map((activeVariants || []).map((v) => [v.id, v]))

    const activeProductIds = Array.from(
      new Set((activeVariants || []).map((v) => v.product_id))
    )
    const { data: activeProducts } = await supabase
      .from('products')
      .select('id, active')
      .in('id', activeProductIds)

    const activeProductMap = new Map((activeProducts || []).map((p) => [p.id, p]))

    const notifications: string[] = []
    const upserts: { id?: string; cart_id: string; variant_id: string; qty: number }[] = []

    // 4. Merge items using higher quantity strategy
    for (const guestItem of guestItems) {
      const variant = activeVariantMap.get(guestItem.variant_id)
      const product = variant ? activeProductMap.get(variant.product_id) : null

      const isProductActive = product?.active === true
      const isVariantActive = variant?.active === true

      if (!isProductActive || !isVariantActive) {
        notifications.push(`Removed "${guestItem.name}" because it is no longer active.`)
        continue
      }

      const existingDb = existingDbItems.find(
        (d) => d.variant_id === guestItem.variant_id
      )
      let finalQty = guestItem.qty

      if (existingDb) {
        finalQty = Math.max(existingDb.qty, guestItem.qty)
        upserts.push({
          id: existingDb.id,
          cart_id: cart.id,
          variant_id: guestItem.variant_id,
          qty: finalQty,
        })
      } else {
        upserts.push({
          cart_id: cart.id,
          variant_id: guestItem.variant_id,
          qty: finalQty,
        })
      }
    }

    // 5. Save merged items
    if (upserts.length > 0) {
      const { error } = await supabase.from('cart_items').upsert(upserts)
      if (error) throw error
    }

    revalidatePath('/cart')
    return { error: null, success: true, notifications }
  } catch (err) {
    console.error('Merge guest cart error:', err)
    return { error: 'Failed to merge guest cart.' }
  }
}
