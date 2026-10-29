'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sanitizeActionError } from '@/lib/utils/action-error'

/** Maximum quantity allowed per line item — prevents unreasonably large cart entries. */
const MAX_CART_QTY = 99

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

    // Atomic add-or-increment — no read-modify-write race condition.
    // Uses INSERT ... ON CONFLICT DO UPDATE under the hood.
    const { error } = await supabase.rpc('cart_add_or_increment', {
      p_cart_id: cart.id,
      p_variant_id: variantId,
      p_qty: Math.min(qty, MAX_CART_QTY),
      p_max_qty: MAX_CART_QTY,
    })
    if (error) throw error

    revalidatePath('/bag')
    revalidatePath('/cart')
    return { error: null }
  } catch (err) {
    return { error: sanitizeActionError('cart:add', err, 'Failed to update cart.') }
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
      .update({ qty: Math.min(Math.max(1, qty), MAX_CART_QTY) })
      .eq('cart_id', cart.id)
      .eq('variant_id', variantId)

    if (error) throw error

    revalidatePath('/bag')
    revalidatePath('/cart')
    return { error: null }
  } catch (err) {
    return { error: sanitizeActionError('cart:updateQty', err, 'Failed to update quantity.') }
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

    revalidatePath('/bag')
    revalidatePath('/cart')
    return { error: null }
  } catch (err) {
    return { error: sanitizeActionError('cart:remove', err, 'Failed to remove item.') }
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

    revalidatePath('/bag')
    revalidatePath('/cart')
    return { error: null }
  } catch (err) {
    return { error: sanitizeActionError('cart:clear', err, 'Failed to clear cart.') }
  }
}
