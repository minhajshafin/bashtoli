import React from 'react'
import { notFound } from 'next/navigation'
import { fetchAdminOrderDetail } from '@/lib/queries/orders'
import { OrderDetail } from '@/components/admin/order-detail'

export const metadata = {
  title: 'Order Details | Bashtoli Admin',
  description: 'Manage and review order customer particulars.',
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Admin Order Details route.
 * Server component loading full snapshot information for a specific order.
 */
export default async function AdminOrderDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const orderId = resolvedParams.id

  const detail = await fetchAdminOrderDetail(orderId)

  if (!detail) {
    notFound()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <OrderDetail detail={detail} />
    </div>
  )
}
