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
      return 'bg-gold-400/15 text-gold-700 border-gold-400/40'
    case 'shipped':
    case 'out_for_delivery':
      return 'bg-forest-800/10 text-forest-800 border-forest-300/80'
    case 'delivered':
      return 'bg-emerald-800/10 text-emerald-800 border-emerald-300/80'
    case 'cancelled':
      return 'bg-rose-800/10 text-rose-800 border-rose-300/80'
    default:
      return 'bg-forest-200/80 text-forest-800 border-forest-300/60'
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
            className="group block rounded-2xl border border-forest-200/80 bg-cream-100/60 p-4 sm:p-5 hover:bg-cream-100 hover:border-gold-500/50 hover:shadow-2xs transition-all duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm sm:text-base font-bold text-forest-950 font-mono group-hover:text-gold-600 transition-colors">
                    {o.order_number}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-sans font-semibold capitalize tracking-wide ${getStatusBadgeStyle(
                      o.status
                    )}`}
                  >
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-forest-600 font-sans">
                  Placed on {orderDateStr} · {o.item_count} {o.item_count === 1 ? 'item' : 'items'}
                </p>
              </div>

              <div className="flex sm:flex-col sm:items-end justify-between items-center pt-3 sm:pt-0 border-t sm:border-t-0 border-forest-200/60 gap-1">
                <span className="text-base sm:text-lg font-bold text-forest-950 font-price">
                  ৳{o.total.toLocaleString()}
                </span>
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-gold-600 group-hover:text-gold-500 flex items-center gap-1">
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
