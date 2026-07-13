import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

export type DashboardMetrics = {
  todayOrderCount: number
  pendingOrderCount: number
  lowStockCount: number
}

export type LowStockItem = {
  id: string
  product_id: string
  product_name: string
  sku: string | null
  stock_qty: number
  option_values: Record<string, unknown> | null
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
 * Fetches dashboard counts metrics for order totals and low stock items.
 */
export async function fetchDashboardMetrics(threshold = 5): Promise<DashboardMetrics> {
  const supabase = await createClient()
  const isAdmin = await verifyAdminAccess(supabase)

  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required.')
  }

  try {
    // 1. Fetch Today's Order Count (created on or after 00:00 today in local/server time)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: todayOrderCount, error: todayError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    if (todayError) throw todayError

    // 2. Fetch Pending Order Count
    const { count: pendingOrderCount, error: pendingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (pendingError) throw pendingError

    // 3. Fetch Low-Stock Count (based on customizable threshold)
    const { count: lowStockCount, error: lowStockError } = await supabase
      .from('product_variants')
      .select('*', { count: 'exact', head: true })
      .lte('stock_qty', threshold)

    if (lowStockError) throw lowStockError

    return {
      todayOrderCount: todayOrderCount || 0,
      pendingOrderCount: pendingOrderCount || 0,
      lowStockCount: lowStockCount || 0,
    }
  } catch (err) {
    console.error('Error fetching dashboard metrics query:', err)
    return {
      todayOrderCount: 0,
      pendingOrderCount: 0,
      lowStockCount: 0,
    }
  }
}

/**
 * Fetches a list of all active or low-stock variants, sorted by lowest stock first.
 */
export async function fetchLowStockList(threshold = 5): Promise<LowStockItem[]> {
  const supabase = await createClient()
  const isAdmin = await verifyAdminAccess(supabase)

  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required.')
  }

  try {
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select(`
        id,
        product_id,
        sku,
        stock_qty,
        option_values,
        products (
          name
        )
      `)
      .lte('stock_qty', threshold)
      .order('stock_qty', { ascending: true })

    if (error) throw error

    type VariantQueryRow = {
      id: string
      product_id: string
      sku: string | null
      stock_qty: number
      option_values: Record<string, unknown> | null
      products: {
        name: string
      } | null
    }

    return (variants as unknown as VariantQueryRow[] || []).map((v) => ({
      id: v.id,
      product_id: v.product_id,
      product_name: v.products?.name || 'Unknown Product',
      sku: v.sku,
      stock_qty: v.stock_qty,
      option_values: v.option_values,
    }))
  } catch (err) {
    console.error('Error fetching low stock list query:', err)
    return []
  }
}
