'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
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
    // 1. Try atomic database RPC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rpcOrders, error: rpcError } = await (supabase as any).rpc('find_unclaimed_guest_orders')

    if (!rpcError && rpcOrders) {
      return {
        orders: rpcOrders.map((o: { id: string; order_number: string; created_at: string; total: number | string }) => ({
          id: o.id,
          order_number: o.order_number,
          created_at: o.created_at,
          total: Number(o.total),
        })),
        error: null,
      }
    }

    // 2. Fallback to direct query if RPC is not yet in Postgres schema cache
    let dbClient = supabase
    try {
      dbClient = createAdminClient()
    } catch {
      // Continue with user supabase client if service role not set
    }

    const { data: profile } = await dbClient
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
    let query = dbClient
      .from('orders')
      .select('id, order_number, created_at, total')
      .is('user_id', null)

    // Build conditional logic: either phone or email must match
    if (phone && email) {
      query = query.or(`phone.eq.${encodeURIComponent(phone)},guest_email.eq.${encodeURIComponent(email)}`)
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
export async function claimGuestOrdersAction(orderIds: string[]): Promise<{ error: string | null; success?: boolean; claimed?: number }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    if (orderIds.length === 0) {
      return { error: 'No orders selected.' }
    }

    // Execute atomic claim_guest_orders RPC (bypasses customer UPDATE RLS securely via SECURITY DEFINER)
    let claimedCount: number | null = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rpcCount, error: rpcError } = await (supabase as any).rpc('claim_guest_orders', {
      p_order_ids: orderIds,
    })

    if (!rpcError) {
      claimedCount = rpcCount
    } else {
      // Graceful fallback to admin client if RPC is not yet present
      let dbClient = supabase
      try {
        dbClient = createAdminClient()
      } catch {
        throw rpcError
      }

      const { error: updateError } = await dbClient
        .from('orders')
        .update({ user_id: user.id })
        .in('id', orderIds)
        .is('user_id', null)

      if (updateError) throw updateError
      claimedCount = orderIds.length
    }

    revalidatePath('/account/orders')
    revalidatePath('/account')
    return { error: null, success: true, claimed: claimedCount ?? orderIds.length }
  } catch (err) {
    console.error('Error claiming guest orders:', err)
    return { error: 'Failed to claim orders.' }
  }
}
