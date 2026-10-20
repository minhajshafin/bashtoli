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
    const { data: rpcOrders, error: rpcError } = await supabase.rpc('find_unclaimed_guest_orders')

    if (rpcError) {
      console.error('Error finding unclaimed guest orders RPC:', rpcError)
      return { orders: [], error: 'Failed to search for unclaimed orders.' }
    }

    return {
      orders: (rpcOrders || []).map((o) => ({
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
    const { data: rpcCount, error: rpcError } = await supabase.rpc('claim_guest_orders', {
      p_order_ids: orderIds,
    })

    if (rpcError) {
      console.error('Error claiming guest orders RPC:', rpcError)
      return { error: 'Failed to claim orders.' }
    }

    revalidatePath('/account/orders')
    revalidatePath('/account')
    return { error: null, success: true, claimed: rpcCount ?? orderIds.length }
  } catch (err) {
    console.error('Error claiming guest orders:', err)
    return { error: 'Failed to claim orders.' }
  }
}
