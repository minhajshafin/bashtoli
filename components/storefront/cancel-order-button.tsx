'use client'

import React, { useTransition } from 'react'
import { customerCancelOrderAction } from '@/lib/actions/customer-cancel-order'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'

interface CancelOrderButtonProps {
  orderId: string
}

/**
 * Cancel Order Button with theme-aligned styling.
 */
export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const confirm = useConfirm()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleCancel = async () => {
    const ok = await confirm({
      title: 'Cancel Order?',
      description:
        'Are you sure you want to cancel this order? This action cannot be reversed and will return items to inventory.',
      confirmText: 'Yes, Cancel Order',
      cancelText: 'Keep Order',
      variant: 'danger',
    })
    if (!ok) return

    startTransition(async () => {
      const res = await customerCancelOrderAction(orderId)
      if (res.error) {
        toast(res.error, 'error')
      } else {
        toast('Order successfully cancelled.', 'success')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={isPending}
      className="inline-flex h-12 items-center justify-center rounded-full border border-rose-200 bg-rose-50/80 px-6 text-sm font-semibold text-rose-700 shadow-xs hover:bg-rose-100 hover:text-rose-800 disabled:opacity-50 transition-all cursor-pointer"
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
          Cancelling...
        </span>
      ) : (
        'Cancel Order'
      )}
    </button>
  )
}
