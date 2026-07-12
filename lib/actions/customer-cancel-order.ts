'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: Allows a customer to self-cancel their pending order within 24 hours of placement.
 * Updates order status to 'cancelled' and replenishes variant stock levels.
 */
export async function customerCancelOrderAction(orderId: string): Promise<{ error: string | null; success?: boolean }> {
  const client = await createClient()
  const {
    data: { user },
  } = await client.auth.getUser()

  if (!user) return { error: 'You must be logged in to cancel orders.' }

  // Use admin client to bypass guest select RLS policy and perform transaction securely
  const adminDb = createAdminClient()

  try {
    // 1. Fetch order details
    const { data: order, error: orderError } = await adminDb
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError || !order) {
      return { error: 'Order not found.' }
    }

    // 2. Access control check: Must be the owner
    if (order.user_id !== user.id) {
      return { error: 'You do not have permission to cancel this order.' }
    }

    // 3. Status check: Must be pending
    if (order.status !== 'pending') {
      return { error: 'Only pending orders can be cancelled.' }
    }

    // 4. Time check: Must be within 24 hours of placement
    const createdAt = new Date(order.created_at)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    if (createdAt < twentyFourHoursAgo) {
      return { error: 'Orders can only be cancelled within 24 hours of placement.' }
    }

    // 5. Update order status to 'cancelled'
    const { error: updateError } = await adminDb
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)

    if (updateError) throw updateError

    // 6. Restock items: Increment product_variants stock_qty
    const { data: orderItems, error: itemsError } = await adminDb
      .from('order_items')
      .select('variant_id, qty')
      .eq('order_id', orderId)

    if (itemsError) throw itemsError

    for (const item of orderItems || []) {
      // Retrieve current stock level
      const { data: variant } = await adminDb
        .from('product_variants')
        .select('stock_qty')
        .eq('id', item.variant_id)
        .maybeSingle()

      if (variant) {
        // Increment and update
        const { error: stockError } = await adminDb
          .from('product_variants')
          .update({ stock_qty: variant.stock_qty + item.qty })
          .eq('id', item.variant_id)

        if (stockError) {
          console.error(`Failed to restock variant ${item.variant_id}:`, stockError)
        }
      }
    }

    revalidatePath(`/order/${order.order_number}`)
    revalidatePath('/account/orders')

    return { error: null, success: true }
  } catch (err) {
    console.error('Error cancelling order:', err)
    return { error: 'Failed to cancel the order. Please try again.' }
  }
}
