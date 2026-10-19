'use client'

import React from 'react'
import Link from 'next/link'
import type { CustomerOrderSummary } from '@/lib/queries/customer-orders'
import { Clock, ChevronRight } from 'lucide-react'

interface OrderHistoryListProps {
  orders: CustomerOrderSummary[]
}

function getStatusBadgeStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
    case 'processing':
      return 'bg-gold-100 text-gold-800 border-gold-300/80'
    case 'shipped':
    case 'out_for_delivery':
      return 'bg-forest-100 text-forest-900 border-forest-300/80'
    case 'delivered':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300/80'
    case 'cancelled':
      return 'bg-terracotta-100 text-terracotta-800 border-terracotta-300/80'
    default:
      return 'bg-forest-100 text-forest-800 border-forest-300/60'
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
            className="group block rounded-2xl border border-forest-200/90 bg-cream-50 shadow-md text-forest-950 p-4 sm:p-5 hover:border-gold-500/60 hover:shadow-lg active:scale-[0.99] transition-all duration-200 cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-sm sm:text-base font-bold text-forest-950 font-mono group-hover:text-gold-700 transition-colors">
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
                <p className="text-xs text-forest-600 font-sans flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-forest-400" />
                  <span>Placed on {orderDateStr}</span>
                  <span>·</span>
                  <span>{o.item_count} {o.item_count === 1 ? 'item' : 'items'}</span>
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-forest-200/60">
                <span className="text-base sm:text-lg font-bold text-forest-950 font-price">
                  ৳{o.total.toLocaleString()}
                </span>
                <span className="inline-flex h-9 items-center justify-center gap-1 text-xs font-sans font-semibold px-4 rounded-xl bg-forest-900 text-cream-50 group-hover:bg-gold-500 group-hover:text-forest-950 transition-all shadow-xs">
                  <span>Track &amp; Invoice</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
