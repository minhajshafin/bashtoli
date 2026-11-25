import React from 'react'
import { connection } from 'next/server'
import { fetchAdminOrders, ORDERS_PAGE_SIZE } from '@/lib/queries/orders'
import { OrderList } from '@/components/admin/order-list'

export const metadata = {
  title: 'Orders',
  description: 'View and filter storefront checkouts.',
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
 * Admin Orders route.
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
      <div className="pb-5 border-b border-adm-border">
        <h1 className="admin-page-title text-adm-fg flex items-center gap-3">
          <span>Orders</span>
          <span className="rounded-full bg-adm-surface-2 border border-adm-border px-2.5 py-0.5 font-mono text-xs font-semibold text-adm-muted">
            {totalCount.toLocaleString()}
          </span>
        </h1>
      </div>

      <OrderList orders={orders} totalCount={totalCount} pageSize={ORDERS_PAGE_SIZE} />
    </div>
  )
}
