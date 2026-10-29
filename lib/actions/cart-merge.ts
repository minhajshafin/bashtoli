'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sanitizeActionError } from '@/lib/utils/action-error'
import type { CartItem } from '@/lib/cart/guest-cart'

/** Maximum quantity allowed per line item — prevents unreasonably large cart entries. */
const MAX_CART_QTY = 99

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
      // Clamp to MAX_CART_QTY — guest qty is client-supplied and must not be trusted raw
      const safeGuestQty = Math.min(Math.max(1, guestItem.qty), MAX_CART_QTY)
      let finalQty = safeGuestQty

      if (existingDb) {
        finalQty = Math.min(Math.max(existingDb.qty, safeGuestQty), MAX_CART_QTY)
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
      const { error } = await supabase
        .from('cart_items')
        .upsert(upserts, { onConflict: 'cart_id,variant_id' })
      if (error) throw error
    }

    revalidatePath('/bag')
    revalidatePath('/cart')
    return { error: null, success: true, notifications }
  } catch (err) {
    return { error: sanitizeActionError('cart:merge', err, 'Failed to merge guest cart.') }
  }
}
