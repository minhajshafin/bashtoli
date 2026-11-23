'use client'

import React from 'react'
import Link from 'next/link'
import type { CustomerOrderSummary } from '@/lib/queries/customer-orders'
import { Clock, ChevronRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format-price'

interface OrderHistoryListProps {
  orders: CustomerOrderSummary[]
}

function getStatusBadgeStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
    case 'processing':
      return 'bg-gold-500/20 text-gold-300 border-gold-500/40'
    case 'shipped':
    case 'out_for_delivery':
      return 'bg-forest-700/50 text-forest-200 border-forest-600/40'
    case 'delivered':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    case 'cancelled':
      return 'bg-terracotta-500/20 text-terracotta-300 border-terracotta-500/40'
    default:
      return 'bg-forest-800 text-cream-200 border-forest-700'
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
            className="group block rounded-2xl border border-forest-800/80 bg-forest-900/90 shadow-xs text-cream-50 p-4 sm:p-5 hover:border-gold-500/40 transition-colors cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-sm sm:text-base font-bold text-cream-50 font-mono group-hover:text-gold-300 transition-colors">
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
                <p className="text-xs text-forest-300 font-sans flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-gold-400/80" />
                  <span>Placed on {orderDateStr}</span>
                  <span>·</span>
                  <span>{o.item_count} {o.item_count === 1 ? 'item' : 'items'}</span>
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-forest-800">
                <span className="text-base sm:text-lg font-bold text-cream-50 font-price">
                  {formatPrice(o.total)}
                </span>
                <span className="inline-flex h-9 items-center justify-center gap-1 text-xs font-sans font-semibold px-4 rounded-xl bg-forest-800 hover:bg-forest-750 text-cream-50 border border-forest-700 hover:border-gold-400 hover:text-gold-200 transition-colors">
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
