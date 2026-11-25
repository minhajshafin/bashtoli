'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { AdminOrderDetail } from '@/lib/queries/orders'
import { OrderStatusSelect } from '@/components/admin/order-status-select'
import { OrderStatusHistory } from '@/components/admin/order-status-history'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'

interface OrderDetailProps {
  detail: AdminOrderDetail
}

export function OrderDetail({ detail }: OrderDetailProps) {
  const { order, items, profile } = detail

  const orderDateStr = new Date(order.created_at).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      {/* Detail view header — preserves h1 + span selector contract */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-paper-300">
        <div className="space-y-1.5">
          <p className="admin-kicker text-ink-500">03 / Order Manifest</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="admin-page-title font-mono text-ink-950">{order.order_number}</h1>
            <OrderStatusBadge status={order.status} className="text-xs px-3 py-1" />
          </div>
          <p className="font-mono text-xs text-ink-600">Placed on {orderDateStr}</p>
        </div>
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-ink-400/70 bg-paper-50 px-4 text-xs font-bold text-ink-950 hover:bg-ink-950 hover:text-paper-50 hover:border-ink-950 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Orders</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Columns: Itemized Ledger + Inverted Obsidian COD Settlement */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-paper-50 border border-paper-300 rounded-2xl overflow-hidden shadow-subtle">
            <div className="px-5 py-4 border-b border-paper-300 bg-paper-200/60 flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink-950">Purchased Items</h2>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-600">
                {items.length} {items.length === 1 ? 'line' : 'lines'}
              </span>
            </div>
            <div className="divide-y divide-paper-200">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-4 px-5 py-4 text-sm">
                  <div className="min-w-0">
                    <p className="font-bold text-ink-950">{item.product_name}</p>
                    <p className="font-mono text-xs text-ink-600 mt-0.5">Qty: {item.qty}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-ink-950 tabular-nums">
                      Tk {(item.price_at_purchase * item.qty).toLocaleString()}
                    </p>
                    {item.qty > 1 && (
                      <p className="font-mono text-[11px] text-ink-500 mt-0.5 tabular-nums">
                        Tk {item.price_at_purchase.toLocaleString()} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inverted Obsidian Financial Settlement Card */}
          <div className="bg-ink-950 text-paper-50 border border-ink-800 rounded-2xl p-6 space-y-3.5 shadow-elevation-2">
            <p className="admin-kicker text-paper-400">Cash on Delivery Ledger</p>
            <div className="flex justify-between text-xs font-medium text-paper-300">
              <span>Subtotal</span>
              <span className="font-mono text-paper-50 tabular-nums">
                Tk {Number(order.subtotal).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs font-medium text-paper-300">
              <span>Delivery Fee</span>
              <span className="font-mono text-paper-50 tabular-nums">
                {Number(order.delivery_fee) === 0
                  ? 'Free'
                  : `Tk ${Number(order.delivery_fee).toLocaleString()}`}
              </span>
            </div>
            <hr className="border-ink-700" />
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-paper-100">Total (COD)</span>
              <span className="admin-metric-value font-mono text-paper-50 tabular-nums">
                Tk {Number(order.total).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Status Control, History Log, Customer Info & Fulfillment */}
        <div className="space-y-6">
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />

          <OrderStatusHistory history={detail.history} />

          <div className="bg-paper-50 border border-paper-300 rounded-2xl p-5 shadow-subtle space-y-4">
            <h2 className="admin-kicker text-ink-500 border-b border-paper-200 pb-2.5">
              Customer Info
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">Name</p>
                <p className="font-bold text-ink-950 mt-0.5">{order.customer_name}</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">Phone</p>
                <p className="font-mono font-semibold text-ink-900 mt-0.5">{order.phone}</p>
              </div>
              {order.guest_email && (
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">Email</p>
                  <p className="font-medium text-ink-900 break-all mt-0.5">{order.guest_email}</p>
                </div>
              )}
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">Linked Profile</p>
                <div className="font-semibold mt-0.5">
                  {profile ? (
                    <span className="text-ink-950">
                      {profile.full_name || 'Linked Account'}
                    </span>
                  ) : (
                    <span className="text-ink-500 font-normal italic">Guest Order</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-paper-50 border border-paper-300 rounded-2xl p-5 shadow-subtle space-y-4">
            <h2 className="admin-kicker text-ink-500 border-b border-paper-200 pb-2.5">
              Fulfillment Details
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">Fulfillment Method</p>
                <p className="font-bold text-ink-950 capitalize mt-0.5">{order.fulfillment_type}</p>
              </div>
              {order.fulfillment_type === 'delivery' && (
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">Delivery Zone</p>
                  <p className="font-semibold text-ink-900 capitalize mt-0.5">
                    {order.delivery_zone?.replace('_', ' ')}
                  </p>
                </div>
              )}
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">Shipping Address</p>
                <p className="font-medium text-ink-900 whitespace-pre-line leading-relaxed mt-1.5 bg-paper-100 p-3 rounded-xl border border-paper-300">
                  {order.address}
                </p>
              </div>
              {order.notes && (
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">Order Notes</p>
                  <p className="font-medium text-ink-900 italic leading-relaxed mt-1.5 bg-paper-200/70 p-3 rounded-xl border border-paper-300">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
