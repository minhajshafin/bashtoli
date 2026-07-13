import React from 'react'
import { fetchAdminOrders } from '@/lib/queries/orders'
import { OrderList } from '@/components/admin/order-list'

export const metadata = {
  title: 'Order Management | Bashtoli Admin',
  description: 'View and filter all incoming storefront checkouts.',
}

interface PageProps {
  searchParams: Promise<{
    status?: string
    search?: string
  }>
}

/**
 * Admin Orders Dashboard route.
 * Server component loading incoming orders matching optional search keywords and status filters.
 */
export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const status = resolvedSearchParams?.status || undefined
  const search = resolvedSearchParams?.search || undefined

  // Retrieve matching checkouts list
  const orders = await fetchAdminOrders({ status, search })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Orders</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review, filter, and manage customer storefront orders.
          </p>
        </div>
      </div>

      {/* Overview Table List */}
      <OrderList orders={orders} />
    </div>
  )
}
