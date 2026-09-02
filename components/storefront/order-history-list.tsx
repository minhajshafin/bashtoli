'use client'

import React from 'react'
import Link from 'next/link'
import type { CustomerOrderSummary } from '@/lib/queries/customer-orders'

interface OrderHistoryListProps {
  orders: CustomerOrderSummary[]
}

function getStatusBadgeStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
    case 'processing':
      return 'bg-gold-400/20 text-gold-600 border-gold-400/40'
    case 'shipped':
      return 'bg-forest-700/15 text-forest-700 border-forest-600/30'
    case 'delivered':
      return 'bg-forest-800 text-cream-100 border-forest-800'
    case 'cancelled':
      return 'bg-rose-900/10 text-rose-700 border-rose-900/20'
    default:
      return 'bg-forest-100 text-forest-700 border-forest-200'
  }
}

export function OrderHistoryList({ orders }: OrderHistoryListProps) {
  return (
    <div className="space-y-3.5">
      {orders.map((o) => {
        const orderDateStr = new Date(o.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })

        return (
          <Link
            key={o.id}
            href={`/order/${o.order_number}`}
            className="group block rounded-2xl border border-forest-200 bg-cream-100/70 p-4 sm:p-5 hover:bg-cream-100 hover:border-gold-500/50 hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm sm:text-base font-bold text-forest-900 group-hover:text-gold-600 transition-colors">
                    {o.order_number}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadgeStyle(
                      o.status
                    )}`}
                  >
                    {o.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-forest-500 font-light">
                  Placed on {orderDateStr} · {o.item_count} {o.item_count === 1 ? 'item' : 'items'}
                </p>
              </div>

              <div className="flex sm:flex-col sm:items-end justify-between items-center pt-3 sm:pt-0 border-t sm:border-t-0 border-forest-200/60 gap-1">
                <span className="text-base sm:text-lg font-bold text-forest-900">
                  ৳{o.total.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-gold-600 group-hover:text-gold-500 flex items-center gap-1">
                  View invoice &rarr;
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
