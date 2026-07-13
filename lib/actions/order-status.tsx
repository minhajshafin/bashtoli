'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { orderStatusSchema } from '@/lib/validations/order-status'
import { resend } from '@/lib/email/resend'
import { OrderStatusUpdateEmail } from '@/lib/email/templates/order-status-update'
import { revalidatePath } from 'next/cache'
import React from 'react'

type StatusType = 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'

/**
 * Helper to check if a status transition is valid based on PRD workflow rules:
 * pending → confirmed → shipped → out_for_delivery (optional) → delivered
 * Any of pending/confirmed/shipped/out_for_delivery → cancelled
 */
function isValidTransition(current: StatusType, next: StatusType): boolean {
  if (current === next) return true

  // Final states cannot transition to anything else
  if (current === 'delivered' || current === 'cancelled') return false

  // Cancellation is allowed from any active state
  if (next === 'cancelled') return true

  switch (current) {
    case 'pending':
      return next === 'confirmed'
    case 'confirmed':
      return next === 'shipped'
    case 'shipped':
      return next === 'out_for_delivery' || next === 'delivered'
    case 'out_for_delivery':
      return next === 'delivered'
    default:
      return false
  }
}

/**
 * Server Action: Update Order Status (Admin/Staff only)
 * Performs Zod validation, enforces transition boundaries, records history logs,
 * restocks inventory if cancelled, and fires update notification emails.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string
): Promise<{ error: string | null; success?: boolean }> {
  const client = await createClient()

  // 1. Authenticate user
  const {
    data: { user },
  } = await client.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to modify order statuses.' }
  }

  // 2. Validate user role is staff or admin
  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || (profile.role !== 'staff' && profile.role !== 'admin')) {
    return { error: 'Unauthorized: Admin or staff role required.' }
  }

  // 3. Validate request schema
  const parsed = orderStatusSchema.safeParse({ orderId, status: newStatus })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.status?.[0] || 'Invalid inputs.' }
  }

  const nextStatus = parsed.data.status as StatusType

  // Use admin database client to bypass select policy and commit updates securely
  const adminDb = createAdminClient()

  try {
    // 4. Retrieve current order details
    const { data: order, error: orderError } = await adminDb
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError || !order) {
      return { error: 'Order not found.' }
    }

    const currentStatus = order.status as StatusType

    // 5. Verify status transition rules
    if (!isValidTransition(currentStatus, nextStatus)) {
      return {
        error: `Invalid transition from ${currentStatus.replace(/_/g, ' ')} to ${nextStatus.replace(/_/g, ' ')}.`,
      }
    }

    // If status remains unchanged, return early success
    if (currentStatus === nextStatus) {
      return { error: null, success: true }
    }

    // 6. Update order status field
    const { error: updateError } = await adminDb
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', orderId)

    if (updateError) throw updateError

    // 7. Insert transition history log
    const { error: historyError } = await adminDb
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status: nextStatus,
        changed_by: user.id,
      })

    if (historyError) {
      console.error('Failed to log order status history:', historyError)
    }

    // 8. Restock quantities if transition is cancelled
    if (nextStatus === 'cancelled') {
      const { data: items, error: itemsError } = await adminDb
        .from('order_items')
        .select('variant_id, qty')
        .eq('order_id', orderId)

      if (itemsError) throw itemsError

      for (const item of items || []) {
        const { data: variant } = await adminDb
          .from('product_variants')
          .select('stock_qty')
          .eq('id', item.variant_id)
          .maybeSingle()

        if (variant) {
          const { error: stockError } = await adminDb
            .from('product_variants')
            .update({ stock_qty: variant.stock_qty + item.qty })
            .eq('id', item.variant_id)

          if (stockError) {
            console.error(`Failed to restock variant ${item.variant_id} during status update:`, stockError)
          }
        }
      }
    }

    // 9. Send status notification email via Resend if email exists on file (confirmed, shipped, delivered)
    if (['confirmed', 'shipped', 'delivered'].includes(nextStatus)) {
      const customerEmail = order.guest_email || null
      if (customerEmail && customerEmail.trim() !== '') {
        if (resend) {
          resend.emails
            .send({
              from: 'Bashtoli <orders@bashtoli.com>',
              to: customerEmail,
              subject: `Update on your Bashtoli Order ${order.order_number}`,
              react: (
                <OrderStatusUpdateEmail
                  orderNumber={order.order_number}
                  customerName={order.customer_name}
                  status={nextStatus as 'confirmed' | 'shipped' | 'delivered'}
                  address={order.address}
                  total={Number(order.total)}
                />
              ),
            })
            .then((res) => {
              if (res.error) {
                console.error(`[Resend Error] Status email notify failed for ${order.order_number}:`, res.error)
              } else {
                console.log(`[Resend Success] Status email sent to ${customerEmail}: ID ${res.data?.id}`)
              }
            })
            .catch((err) => {
              console.error(`[Resend Exception] Status email notify exception for ${order.order_number}:`, err)
            })
        } else {
          console.warn(
            `[Email Warning] Resend not configured. Skipped sending status email update for ${order.order_number}.`
          )
        }
      }
    }

    // Revalidate affected cache paths
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath(`/order/${order.order_number}`)
    revalidatePath('/account/orders')

    return { error: null, success: true }
  } catch (err) {
    console.error('Error updating order status action:', err)
    return { error: 'Failed to update order status. Please try again.' }
  }
}
