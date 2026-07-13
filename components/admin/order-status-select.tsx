'use client'

import React, { useState, useTransition } from 'react'
import { updateOrderStatusAction } from '@/lib/actions/order-status'

interface OrderStatusSelectProps {
  orderId: string
  currentStatus: string
}

type StatusType = 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'

const STATUS_LABELS: Record<StatusType, string> = {
  pending: 'Pending Verification',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [status, setStatus] = useState<StatusType>(currentStatus as StatusType)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()

  // Determines option list based on allowed workflow transitions
  const getAllowedOptions = (curr: StatusType): { value: StatusType; label: string }[] => {
    const list: { value: StatusType; label: string }[] = [
      { value: curr, label: `${STATUS_LABELS[curr]} (Current)` },
    ]

    if (curr === 'delivered' || curr === 'cancelled') {
      return list // Final states cannot transition
    }

    // Cancellation is always allowed from active states
    const addCancel = () => {
      list.push({ value: 'cancelled', label: STATUS_LABELS.cancelled })
    }

    if (curr === 'pending') {
      list.push({ value: 'confirmed', label: STATUS_LABELS.confirmed })
      addCancel()
    } else if (curr === 'confirmed') {
      list.push({ value: 'shipped', label: STATUS_LABELS.shipped })
      addCancel()
    } else if (curr === 'shipped') {
      list.push({ value: 'out_for_delivery', label: STATUS_LABELS.out_for_delivery })
      list.push({ value: 'delivered', label: STATUS_LABELS.delivered })
      addCancel()
    } else if (curr === 'out_for_delivery') {
      list.push({ value: 'delivered', label: STATUS_LABELS.delivered })
      addCancel()
    }

    return list
  }

  const allowedOptions = getAllowedOptions(status)

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as StatusType
    if (nextStatus === status) return

    setError(null)
    setSuccess(false)

    // Confirm cancellations explicitly to prevent accidents
    if (nextStatus === 'cancelled') {
      const confirm = window.confirm('Are you sure you want to cancel this order? This will restock all inventory items.')
      if (!confirm) {
        // Reset select value to current
        e.target.value = status
        return
      }
    }

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, nextStatus)
      if (result.error) {
        setError(result.error)
        e.target.value = status // revert selection UI
      } else {
        setSuccess(true)
        setStatus(nextStatus)
        // Automatically clear success banner after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  const isFinalState = status === 'delivered' || status === 'cancelled'

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Order Status Control
        </h2>
        {isPending && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="order-status-select-input" className="block text-xs font-semibold text-slate-500 mb-1.5">
            Update Status Flow
          </label>
          <select
            id="order-status-select-input"
            defaultValue={status}
            onChange={handleStatusChange}
            disabled={isPending || isFinalState}
            className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {allowedOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 animate-shake">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
            Order status updated successfully!
          </div>
        )}

        {isFinalState && (
          <p className="text-[11px] text-slate-400 font-medium italic">
            This order is in a final state ({status}) and cannot be transitioned further.
          </p>
        )}
      </div>
    </div>
  )
}
