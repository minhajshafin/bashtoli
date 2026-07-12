'use client'

import React, { useTransition } from 'react'
import { customerCancelOrderAction } from '@/lib/actions/customer-cancel-order'

interface CancelOrderButtonProps {
  orderId: string
}

/**
 * Cancel Order Button.
 * Prompts user for confirmation and triggers order cancellation Server Action.
 */
export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleCancel = () => {
    const confirmCancel = confirm(
      'Are you sure you want to cancel this order? This will cancel your order and return items to inventory.'
    )
    if (!confirmCancel) return

    startTransition(async () => {
      const res = await customerCancelOrderAction(orderId)
      if (res.error) {
        alert(res.error)
      } else {
        alert('Order successfully cancelled.')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={isPending}
      className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-6 text-sm font-bold text-rose-600 shadow-sm hover:bg-rose-100/50 hover:text-rose-700 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all dark:border-rose-950 dark:bg-rose-950/20 dark:text-rose-450 dark:hover:bg-rose-950/40"
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          Cancelling...
        </span>
      ) : (
        'Cancel Order'
      )}
    </button>
  )
}
