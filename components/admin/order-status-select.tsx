'use client'

import React, { useState, useTransition } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { updateOrderStatusAction } from '@/lib/actions/order-status'
import { useAdminConfirm } from '@/components/admin/admin-confirm-dialog'
import { ORDER_STATUS_LABELS, type OrderStatusType } from '@/components/admin/order-status-badge'

interface OrderStatusSelectProps {
  orderId: string
  currentStatus: string
}

type StatusType = OrderStatusType

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [status, setStatus] = useState<StatusType>(currentStatus as StatusType)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()
  const confirm = useAdminConfirm()

  const getAllowedOptions = (curr: StatusType): { value: StatusType; label: string }[] => {
    const list: { value: StatusType; label: string }[] = [
      { value: curr, label: `${ORDER_STATUS_LABELS[curr] || curr} (Current)` },
    ]

    if (curr === 'delivered' || curr === 'cancelled') {
      return list
    }

    const addCancel = () => {
      list.push({ value: 'cancelled', label: ORDER_STATUS_LABELS.cancelled })
    }

    if (curr === 'pending') {
      list.push({ value: 'confirmed', label: ORDER_STATUS_LABELS.confirmed })
      addCancel()
    } else if (curr === 'confirmed') {
      list.push({ value: 'shipped', label: ORDER_STATUS_LABELS.shipped })
      addCancel()
    } else if (curr === 'shipped') {
      list.push({ value: 'out_for_delivery', label: ORDER_STATUS_LABELS.out_for_delivery })
      list.push({ value: 'delivered', label: ORDER_STATUS_LABELS.delivered })
      addCancel()
    } else if (curr === 'out_for_delivery') {
      list.push({ value: 'delivered', label: ORDER_STATUS_LABELS.delivered })
    }

    return list
  }

  const allowedOptions = getAllowedOptions(status)

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as StatusType
    if (nextStatus === status) return

    setError(null)
    setSuccess(false)

    if (nextStatus === 'cancelled') {
      const confirmed = await confirm({
        title: 'Cancel this Order?',
        description:
          'Cancelling this order restores its reserved quantities back into inventory.',
        confirmText: 'Cancel Order',
        cancelText: 'Keep Order',
        variant: 'danger',
      })
      if (!confirmed) return
    }

    const previousStatus = status
    setStatus(nextStatus)

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, nextStatus)
      if (result.error) {
        setError(result.error)
        setStatus(previousStatus)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  const isFinalState = status === 'delivered' || status === 'cancelled'

  return (
    <div className="bg-adm-surface border border-adm-border rounded-2xl p-5 shadow-subtle space-y-3.5">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold text-adm-fg">Order Status</h2>
        {isPending && (
          <span className="flex h-2.5 w-2.5 relative" aria-label="Updating status">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-adm-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-adm-accent"></span>
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label
            htmlFor="order-status-select-input"
            className="block text-xs font-medium text-adm-muted mb-1.5"
          >
            Transition Status
          </label>
          <select
            id="order-status-select-input"
            value={status}
            onChange={handleStatusChange}
            disabled={isPending || isFinalState}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-adm-input-border bg-adm-surface text-sm font-medium text-adm-fg focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1 disabled:opacity-60 disabled:bg-adm-surface-2 disabled:cursor-not-allowed cursor-pointer"
          >
            {allowedOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-adm-danger-bg border border-adm-danger-border p-3 text-xs font-semibold text-adm-danger animate-shake"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl bg-adm-success-bg border border-adm-success-border p-3 text-xs font-semibold text-adm-success"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>Order status updated.</span>
          </div>
        )}

        {isFinalState && (
          <p className="text-xs text-adm-muted">
            Order is {status} and cannot be changed further.
          </p>
        )}
      </div>
    </div>
  )
}
