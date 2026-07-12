'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Server Action: Adds a product to the user's wishlist.
 * Enforces the database unique constraint and handles conflict gracefully.
 */
export async function addToWishlistAction(productId: string): Promise<{ error: string | null; success?: boolean }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to add items to your wishlist.' }
  }

  try {
    // Upsert to handle unique constraint duplicate adds gracefully without error
    const { error } = await supabase.from('wishlist').upsert(
      {
        user_id: user.id,
        product_id: productId,
      },
      { onConflict: 'user_id,product_id' }
    )

    if (error) throw error
  } catch (err) {
    console.error('Add to wishlist error:', err)
    return { error: 'Failed to add item to wishlist. Please try again.' }
  }

  // Refresh page states
  revalidatePath('/account/wishlist')
  revalidatePath(`/products`)

  return { error: null, success: true }
}

/**
 * Server Action: Removes a product from the user's wishlist.
 */
export async function removeFromWishlistAction(productId: string): Promise<{ error: string | null; success?: boolean }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to manage your wishlist.' }
  }

  try {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (error) throw error
  } catch (err) {
    console.error('Remove from wishlist error:', err)
    return { error: 'Failed to remove item. Please try again.' }
  }

  revalidatePath('/account/wishlist')
  revalidatePath(`/products`)

  return { error: null, success: true }
}

/**
 * Helper Server Action: Checks if a product is in the user's wishlist.
 */
export async function checkWishlistStatusAction(productId: string): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle()

    if (error) throw error
    return !!data
  } catch (err) {
    console.error('Check wishlist status error:', err)
    return false
  }
}
