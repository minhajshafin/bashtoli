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

/** Return type for the paginated order list. */
export type AdminOrdersResult = {
  orders: AdminOrderSummary[]
  totalCount: number
}

export const ORDERS_PAGE_SIZE = 20

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
 * Fetches a paginated list of orders with optional search and status filters.
 * Sorted by placement date (newest first).
 * Returns both the current page of orders and the total matching row count for pagination UI.
 */
export async function fetchAdminOrders(filters: {
  status?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<AdminOrdersResult> {
  const supabase = await createClient()
  const isAdmin = await verifyAdminAccess(supabase)

  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required.')
  }

  const { page = 1, pageSize = ORDERS_PAGE_SIZE } = filters
  const safePage = Math.max(1, page)
  const offset = (safePage - 1) * pageSize

  // Build the search OR clause once — applied identically to count and data queries.
  const searchVal = filters.search?.trim() ?? ''
  const orClause = searchVal
    ? `order_number.ilike.%${encodeURIComponent(searchVal)}%,customer_name.ilike.%${encodeURIComponent(searchVal)}%,phone.ilike.%${encodeURIComponent(searchVal)}%`
    : ''

  try {
    // 1. Count total matching rows (needed for pagination controls)
    let countQuery = supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    if (filters.status) {
      countQuery = countQuery.eq(
        'status',
        filters.status as Database['public']['Tables']['orders']['Row']['status'],
      )
    }
    if (orClause) countQuery = countQuery.or(orClause)

    const { count, error: countError } = await countQuery
    if (countError) throw countError

    // 2. Fetch just the current page
    let query = supabase.from('orders').select('*')

    if (filters.status) {
      query = query.eq(
        'status',
        filters.status as Database['public']['Tables']['orders']['Row']['status'],
      )
    }
    if (orClause) query = query.or(orClause)

    const { data: orders, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) throw error
    if (!orders || orders.length === 0) return { orders: [], totalCount: count ?? 0 }

    // 3. Fetch item qty totals for this page's orders only
    const orderIds = orders.map((o) => o.id)
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

    return {
      orders: orders.map((o) => ({
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
      })),
      totalCount: count ?? 0,
    }
  } catch (err) {
    console.error('Error fetching admin orders query:', err)
    return { orders: [], totalCount: 0 }
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

      profile = userProfile
        ? {
            id: userProfile.id,
            full_name: userProfile.full_name,
            email: order.guest_email || null,
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
