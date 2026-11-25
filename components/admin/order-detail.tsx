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
      {/* Detail header — preserves h1 + span selector contract */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-adm-border">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="admin-page-title font-mono text-adm-fg">{order.order_number}</h1>
            <OrderStatusBadge status={order.status} className="text-xs px-3 py-1" />
          </div>
          <p className="font-mono text-xs text-adm-muted">{orderDateStr}</p>
        </div>
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-adm-border bg-adm-surface px-4 text-xs font-semibold text-adm-fg hover:bg-adm-surface-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-adm-muted" aria-hidden="true" />
            <span>Back to Orders</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-adm-surface border border-adm-border rounded-2xl overflow-hidden shadow-subtle">
            <div className="px-5 py-3.5 border-b border-adm-border bg-adm-surface-2/60 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-adm-fg">Purchased Items</h2>
              <span className="font-mono text-xs text-adm-muted">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="divide-y divide-adm-border">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-4 px-5 py-4 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-adm-fg">{item.product_name}</p>
                    <p className="font-mono text-xs text-adm-muted mt-0.5">Qty: {item.qty}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-semibold text-adm-fg tabular-nums">
                      Tk {(item.price_at_purchase * item.qty).toLocaleString()}
                    </p>
                    {item.qty > 1 && (
                      <p className="font-mono text-[11px] text-adm-muted mt-0.5 tabular-nums">
                        Tk {item.price_at_purchase.toLocaleString()} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-adm-surface border border-adm-border rounded-2xl p-5 space-y-3 shadow-subtle">
            <div className="flex justify-between text-xs font-medium text-adm-muted">
              <span>Subtotal</span>
              <span className="font-mono text-adm-fg tabular-nums">
                Tk {Number(order.subtotal).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs font-medium text-adm-muted">
              <span>Delivery Fee</span>
              <span className="font-mono text-adm-fg tabular-nums">
                {Number(order.delivery_fee) === 0
                  ? 'Free'
                  : `Tk ${Number(order.delivery_fee).toLocaleString()}`}
              </span>
            </div>
            <hr className="border-adm-border" />
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-semibold text-adm-fg">Total (COD)</span>
              <span className="admin-metric-value font-mono text-adm-accent-text tabular-nums">
                Tk {Number(order.total).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />

          <OrderStatusHistory history={detail.history} />

          <div className="bg-adm-surface border border-adm-border rounded-2xl p-5 shadow-subtle space-y-3.5">
            <h2 className="text-sm font-semibold text-adm-fg border-b border-adm-border pb-2.5">
              Customer
            </h2>
            <div className="space-y-2.5 text-sm">
              <div>
                <p className="text-xs text-adm-muted">Name</p>
                <p className="font-semibold text-adm-fg mt-0.5">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-adm-muted">Phone</p>
                <p className="font-mono font-medium text-adm-fg mt-0.5">{order.phone}</p>
              </div>
              {order.guest_email && (
                <div>
                  <p className="text-xs text-adm-muted">Email</p>
                  <p className="font-medium text-adm-fg break-all mt-0.5">{order.guest_email}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-adm-muted">Account</p>
                <div className="font-medium mt-0.5">
                  {profile ? (
                    <span className="text-adm-fg">
                      {profile.full_name || 'Linked Account'}
                    </span>
                  ) : (
                    <span className="text-adm-muted">Guest Order</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-adm-surface border border-adm-border rounded-2xl p-5 shadow-subtle space-y-3.5">
            <h2 className="text-sm font-semibold text-adm-fg border-b border-adm-border pb-2.5">
              Shipping Details
            </h2>
            <div className="space-y-2.5 text-sm">
              <div>
                <p className="text-xs text-adm-muted">Fulfillment</p>
                <p className="font-semibold text-adm-fg capitalize mt-0.5">{order.fulfillment_type}</p>
              </div>
              {order.fulfillment_type === 'delivery' && (
                <div>
                  <p className="text-xs text-adm-muted">Delivery Zone</p>
                  <p className="font-medium text-adm-fg capitalize mt-0.5">
                    {order.delivery_zone?.replace('_', ' ')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-adm-muted">Address</p>
                <p className="text-adm-fg whitespace-pre-line leading-relaxed mt-1.5 bg-adm-surface-2/70 p-3 rounded-xl border border-adm-border text-xs sm:text-sm">
                  {order.address}
                </p>
              </div>
              {order.notes && (
                <div>
                  <p className="text-xs text-adm-muted">Notes</p>
                  <p className="text-adm-fg-2 leading-relaxed mt-1.5 bg-adm-surface-2/70 p-3 rounded-xl border border-adm-border text-xs sm:text-sm">
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
