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
        classes: 'bg-adm-success-bg text-adm-success border-adm-success-border',
        Icon: PackageCheck,
      }
    case 'out_for_delivery':
      return {
        classes: 'bg-adm-accent-tint text-adm-accent-text border-adm-accent-border',
        Icon: Navigation,
      }
    case 'shipped':
      return {
        classes: 'bg-adm-info-bg text-adm-info border-adm-info-border',
        Icon: Truck,
      }
    case 'confirmed':
      return {
        classes: 'bg-adm-info-bg text-adm-info border-adm-info-border',
        Icon: CheckCircle2,
      }
    case 'pending':
      return {
        classes: 'bg-adm-warning-bg text-adm-warning border-adm-warning-border',
        Icon: Clock,
      }
    case 'cancelled':
      return {
        classes: 'bg-adm-danger-bg text-adm-danger border-adm-danger-border',
        Icon: XCircle,
      }
    default:
      return {
        classes: 'bg-adm-surface-2 text-adm-muted border-adm-border',
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight whitespace-nowrap capitalize ${classes} ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  )
}
