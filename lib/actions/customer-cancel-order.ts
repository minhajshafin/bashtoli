'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Server Action: Allows an authenticated customer to self-cancel their pending order.
 * Delegates atomically to the cancel_order RPC, which enforces ownership, updates
 * status to 'cancelled', records status history, and replenishes variant stock.
 */
export async function customerCancelOrderAction(
  orderId: string
): Promise<{ error: string | null; success?: boolean }> {
  const client = await createClient()
  const {
    data: { user },
  } = await client.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to cancel orders.' }
  }

  try {
    const { error: rpcError } = await client.rpc('cancel_order', {
      p_order_id: orderId,
    })

    if (rpcError) {
      console.error('Failed to cancel order:', rpcError)
      return { error: rpcError.message || 'Failed to cancel the order. Please try again.' }
    }

    revalidateTag('products', 'max')
    revalidateTag('featured-products', 'max')
    revalidateTag('categories', 'max')
    revalidatePath('/products')
    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/products')
    revalidatePath('/admin/orders')
    revalidatePath('/account/orders')

    return { error: null, success: true }
  } catch (err) {
    console.error('Error cancelling order:', err)
    return { error: 'Failed to cancel the order. Please try again.' }
  }
}
