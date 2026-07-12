import { createClient } from '@/lib/supabase/server'

export interface CustomerOrderSummary {
  id: string
  order_number: string
  created_at: string
  status: string
  total: number
  item_count: number
}

/**
 * Retrieves the list of past orders for the authenticated customer.
 * Sorted by creation date (newest first).
 */
export async function fetchCustomerOrders(): Promise<CustomerOrderSummary[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!orders || orders.length === 0) return []

    const orderIds = orders.map((o) => o.id)

    // Sequentially retrieve items to count total item quantities per order safely
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

    return orders.map((order) => ({
      id: order.id,
      order_number: order.order_number,
      created_at: order.created_at,
      status: order.status,
      total: Number(order.total),
      item_count: itemsByOrderId.get(order.id) || 0,
    }))
  } catch (err) {
    console.error('Error fetching customer orders query:', err)
    return []
  }
}
