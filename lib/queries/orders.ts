import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

export type AdminOrderSummary = {
  id: string
  order_number: string
  customer_name: string
  phone: string
  guest_email: string | null
  fulfillment_type: string
  total: number
  status: string
  created_at: string
  item_count: number
}

export type AdminOrderDetail = {
  order: Database['public']['Tables']['orders']['Row']
  items: Database['public']['Tables']['order_items']['Row'][]
  profile: {
    id: string
    full_name: string | null
    email: string | null
  } | null
  history: Array<{
    id: string
    status: string
    changed_at: string
    changed_by: string | null
    changed_by_name: string | null
  }>
}

/**
 * Asserts that the authenticated user is staff or admin.
 * Throws an error or returns false if unauthorized.
 */
async function verifyAdminAccess(supabase: SupabaseClient<Database>): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return profile?.role === 'staff' || profile?.role === 'admin'
}

/**
 * Fetches all orders with optional search keyword and status filters.
 * Sorted by placement date (newest first).
 */
export async function fetchAdminOrders(filters: {
  status?: string
  search?: string
}): Promise<AdminOrderSummary[]> {
  const supabase = await createClient()
  const isAdmin = await verifyAdminAccess(supabase)

  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required.')
  }

  try {
    let query = supabase.from('orders').select('*')

    if (filters.status) {
      query = query.eq('status', filters.status as Database['public']['Tables']['orders']['Row']['status'])
    }

    if (filters.search) {
      const searchVal = filters.search.trim()
      // Matches on order_number, customer_name, or phone number
      query = query.or(
        `order_number.ilike.%${searchVal}%,customer_name.ilike.%${searchVal}%,phone.ilike.%${searchVal}%`
      )
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    if (!orders || orders.length === 0) return []

    const orderIds = orders.map((o) => o.id)

    // Sequentially retrieve item counts to display purchase quantity summaries safely
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('order_id, qty')
      .in('order_id', orderIds)

    if (itemsError) throw itemsError

    const itemsByOrderId = new Map<string, number>()
    for (const item of items || []) {
      const current = itemsByOrderId.get(item.order_id) || 0
      itemsByOrderId.set(item.order_id, current + item.qty)
    }

    return orders.map((o) => ({
      id: o.id,
      order_number: o.order_number,
      customer_name: o.customer_name,
      phone: o.phone,
      guest_email: o.guest_email || null,
      fulfillment_type: o.fulfillment_type,
      total: Number(o.total),
      status: o.status,
      created_at: o.created_at,
      item_count: itemsByOrderId.get(o.id) || 0,
    }))
  } catch (err) {
    console.error('Error fetching admin orders query:', err)
    return []
  }
}

/**
 * Fetches full details for a single order, its purchased items, and optional owner profile.
 */
export async function fetchAdminOrderDetail(orderId: string): Promise<AdminOrderDetail | null> {
  const supabase = await createClient()
  const isAdmin = await verifyAdminAccess(supabase)

  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required.')
  }

  try {
    // 1. Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError || !order) {
      if (orderError) console.error('Error fetching admin order details:', orderError)
      return null
    }

    // 2. Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    if (itemsError) {
      console.error('Error fetching admin order items:', itemsError)
    }

    // 3. Fetch owner profile if user_id is present
    let profile = null
    if (order.user_id) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', order.user_id)
        .maybeSingle()

      // Look up auth email dynamically using admin settings if possible, otherwise rely on guest email
      profile = userProfile
        ? {
            id: userProfile.id,
            full_name: userProfile.full_name,
            email: order.guest_email || null, // default fallback to order contact email
          }
        : null
    }

    // 4. Fetch status transition logs
    const { data: historyLogs, error: historyError } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('changed_at', { ascending: false })

    if (historyError) {
      console.error('Error fetching admin order status history:', historyError)
    }

    const staffIds = historyLogs?.map(log => log.changed_by).filter(Boolean) as string[] || []
    const staffNames = new Map<string, string>()

    if (staffIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', staffIds)

      for (const p of profiles || []) {
        if (p.full_name) staffNames.set(p.id, p.full_name)
      }
    }

    const history = (historyLogs || []).map(log => ({
      id: log.id,
      status: log.status,
      changed_at: log.changed_at,
      changed_by: log.changed_by,
      changed_by_name: log.changed_by ? staffNames.get(log.changed_by) || 'Staff Member' : 'System',
    }))

    return {
      order,
      items: items || [],
      profile,
      history,
    }
  } catch (err) {
    console.error('Error in fetchAdminOrderDetail:', err)
    return null
  }
}
