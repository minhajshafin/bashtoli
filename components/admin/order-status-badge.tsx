import React from 'react'

export type OrderStatusType =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Verification',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function getLegacyOrderStatusClasses(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'confirmed':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'shipped':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    case 'delivered':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

export function OrderStatusBadge({
  status,
  className = '',
}: {
  status: string
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${getLegacyOrderStatusClasses(status)} ${className}`}
    >
      {status}
    </span>
  )
}
