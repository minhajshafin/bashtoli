import React from 'react'
import {
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  Navigation,
  XCircle,
} from 'lucide-react'

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

function getStatusPresentation(status: string): {
  classes: string
  Icon: React.ComponentType<{ className?: string }>
} {
  switch (status) {
    case 'delivered':
      return {
        classes: 'bg-ink-950 text-paper-50 border-ink-950',
        Icon: PackageCheck,
      }
    case 'shipped':
      return {
        classes: 'bg-ink-800 text-paper-50 border-ink-800',
        Icon: Truck,
      }
    case 'out_for_delivery':
      return {
        classes: 'bg-paper-200 text-ink-950 border-ink-400',
        Icon: Navigation,
      }
    case 'confirmed':
      return {
        classes: 'bg-paper-200 text-ink-950 border-ink-400/80',
        Icon: CheckCircle2,
      }
    case 'pending':
      return {
        classes: 'bg-paper-50 text-ink-800 border-ink-400 border-dashed',
        Icon: Clock,
      }
    case 'cancelled':
      return {
        classes: 'bg-signal-danger-bg text-signal-danger border-signal-danger-border',
        Icon: XCircle,
      }
    default:
      return {
        classes: 'bg-paper-100 text-ink-700 border-paper-300',
        Icon: Clock,
      }
  }
}

export function OrderStatusBadge({
  status,
  className = '',
}: {
  status: string
  className?: string
}) {
  const { classes, Icon } = getStatusPresentation(status)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold capitalize whitespace-nowrap ${classes} ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  )
}
