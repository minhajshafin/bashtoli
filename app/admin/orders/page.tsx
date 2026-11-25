import React from 'react'
import { connection } from 'next/server'
import { fetchAdminOrders, ORDERS_PAGE_SIZE } from '@/lib/queries/orders'
import { OrderList } from '@/components/admin/order-list'

export const metadata = {
  title: 'Order Management',
  description: 'View and filter all incoming storefront checkouts.',
}

export const instant = false

interface PageProps {
  searchParams: Promise<{
    status?: string
    search?: string
    page?: string
  }>
}

/**
 * Admin Orders Dashboard route.
 */
export default async function AdminOrdersPage({ searchParams }: PageProps) {
  await connection()
  const resolvedSearchParams = await searchParams
  const status = resolvedSearchParams?.status || undefined
  const search = resolvedSearchParams?.search || undefined
  const page = Math.max(1, parseInt(resolvedSearchParams?.page ?? '1', 10) || 1)

  const { orders, totalCount } = await fetchAdminOrders({ status, search, page })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-5 border-b border-paper-300">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <p className="admin-kicker text-ink-500">03 / Sales &amp; Fulfillment</p>
            <span className="rounded-full bg-ink-950 px-2.5 py-0.5 font-mono text-[11px] font-bold text-paper-50">
              {totalCount.toLocaleString()}
            </span>
          </div>
          <h1 className="admin-page-title text-ink-950">Orders</h1>
          <p className="text-sm text-ink-600">
            Review, filter, and fulfill incoming cash-on-delivery orders.
          </p>
        </div>
      </div>

      <OrderList orders={orders} totalCount={totalCount} pageSize={ORDERS_PAGE_SIZE} />
    </div>
  )
}
