'use client'

import React from 'react'
import Link from 'next/link'
import type { CustomerOrderSummary } from '@/lib/queries/customer-orders'

interface OrderHistoryListProps {
  orders: CustomerOrderSummary[]
}

/**
 * Maps order status labels to style classes.
 */
function getStatusBadgeStyle(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-500 dark:border-amber-900/50'
    case 'processing':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-500 dark:border-blue-900/50'
    case 'shipped':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-500 dark:border-indigo-900/50'
    case 'delivered':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-500 dark:border-emerald-900/50'
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-500 dark:border-rose-900/50'
    default:
      return 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-500 dark:border-zinc-800'
  }
}

/**
 * Order History list layout cards.
 * Renders lists of past checkouts.
 */
export function OrderHistoryList({ orders }: OrderHistoryListProps) {
  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const orderDateStr = new Date(o.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        return (
          <Link
            key={o.id}
            href={`/order/${o.order_number}`}
            className="group block rounded-3xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 shadow-xs transition-all dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-black text-zinc-900 dark:text-zinc-50 group-hover:text-amber-600 transition-colors">
                    {o.order_number}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${getStatusBadgeStyle(
                      o.status
                    )}`}
                  >
                    {o.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Placed on {orderDateStr}</p>
              </div>

              <div className="flex sm:flex-col sm:items-end justify-between items-center pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-850">
                <div className="text-xs text-zinc-650 dark:text-zinc-400">
                  <span className="font-bold text-zinc-850 dark:text-zinc-300">{o.item_count}</span>{' '}
                  {o.item_count === 1 ? 'item' : 'items'}
                </div>
                <p className="mt-0.5 text-sm font-black text-zinc-900 dark:text-zinc-50">
                  ৳{o.total.toLocaleString()}
                </p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
