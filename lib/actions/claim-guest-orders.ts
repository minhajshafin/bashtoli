'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface GuestOrderSummary {
  id: string
  order_number: string
  created_at: string
  total: number
}

/**
 * Server Action: Finds any unclaimed guest orders matching the logged-in user's profile phone or email.
 */
export async function findUnclaimedGuestOrders(): Promise<{ orders: GuestOrderSummary[]; error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { orders: [], error: 'Not authenticated' }

  try {
    // Get customer profile (for phone number matching)
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', user.id)
      .maybeSingle()

    const phone = profile?.phone || ''
    const email = user.email || ''

    if (!phone && !email) {
      return { orders: [], error: null }
    }

    // Build the query conditions dynamically
    let query = supabase
      .from('orders')
      .select('id, order_number, created_at, total')
      .is('user_id', null)

    // Build conditional logic: either phone or email must match
    if (phone && email) {
      query = query.or(`phone.eq.${phone},guest_email.eq.${email}`)
    } else if (phone) {
      query = query.eq('phone', phone)
    } else {
      query = query.eq('guest_email', email)
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return {
      orders: (orders || []).map((o) => ({
        id: o.id,
        order_number: o.order_number,
        created_at: o.created_at,
        total: Number(o.total),
      })),
      error: null,
    }
  } catch (err) {
    console.error('Error finding unclaimed guest orders:', err)
    return { orders: [], error: 'Failed to search for unclaimed orders.' }
  }
}

/**
 * Server Action: Claims specific guest orders and associates them with the customer profile.
 */
export async function claimGuestOrdersAction(orderIds: string[]): Promise<{ error: string | null; success?: boolean }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    if (orderIds.length === 0) {
      return { error: 'No orders selected.' }
    }

    // Update orders where ID is in the list, user_id is null, and verify matching phone/email for security
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', user.id)
      .maybeSingle()

    const phone = profile?.phone || ''
    const email = user.email || ''

    // Match conditions check again on update for strict RLS security
    let updateQuery = supabase
      .from('orders')
      .update({ user_id: user.id })
      .in('id', orderIds)
      .is('user_id', null)

    if (phone && email) {
      updateQuery = updateQuery.or(`phone.eq.${phone},guest_email.eq.${email}`)
    } else if (phone) {
      updateQuery = updateQuery.eq('phone', phone)
    } else {
      updateQuery = updateQuery.eq('guest_email', email)
    }

    const { error } = await updateQuery

    if (error) throw error

    revalidatePath('/account/orders')
    revalidatePath('/account')
    return { error: null, success: true }
  } catch (err) {
    console.error('Error claiming guest orders:', err)
    return { error: 'Failed to claim orders.' }
  }
}
