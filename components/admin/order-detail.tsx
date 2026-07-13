'use client'

import React from 'react'
import Link from 'next/link'
import type { AdminOrderDetail } from '@/lib/queries/orders'
import { OrderStatusSelect } from '@/components/admin/order-status-select'
import { OrderStatusHistory } from '@/components/admin/order-status-history'

interface OrderDetailProps {
  detail: AdminOrderDetail
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'text-amber-600 border-amber-200 bg-amber-50'
    case 'confirmed':
      return 'text-blue-600 border-blue-200 bg-blue-50'
    case 'shipped':
      return 'text-indigo-600 border-indigo-200 bg-indigo-50'
    case 'delivered':
      return 'text-emerald-600 border-emerald-200 bg-emerald-50'
    case 'cancelled':
      return 'text-rose-600 border-rose-200 bg-rose-50'
    default:
      return 'text-slate-600 border-slate-200 bg-slate-50'
  }
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
      {/* Detail view header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{order.order_number}</h1>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Placed on {orderDateStr}</p>
        </div>
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Columns: Details and Items list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table Snapshot */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-150 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-800">Purchased Items</h2>
            </div>
            <div className="divide-y divide-slate-150">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 text-sm">
                  <div>
                    <p className="font-bold text-slate-900">{item.product_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Quantity: {item.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">৳{(item.price_at_purchase * item.qty).toLocaleString()}</p>
                    {item.qty > 1 && (
                      <p className="text-[10px] text-slate-405 mt-0.5">৳{item.price_at_purchase.toLocaleString()} each</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing breakdowns card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Subtotal</span>
              <span className="text-slate-900">৳{Number(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Delivery Fee</span>
              <span className="text-slate-900">
                {Number(order.delivery_fee) === 0 ? 'Free' : `৳${Number(order.delivery_fee).toLocaleString()}`}
              </span>
            </div>
            <hr className="border-slate-150" />
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-800">Total (COD)</span>
              <span className="text-xl font-black text-slate-900">
                ৳{Number(order.total).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Status Control, History Log, Customer Info & Fulfillment */}
        <div className="space-y-6">
          {/* Status Selection Panel */}
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />

          {/* Status Transition History Log */}
          <OrderStatusHistory history={detail.history} />

          {/* Customer Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Customer Info
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Name</p>
                <p className="font-bold text-slate-800">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="font-semibold text-slate-850">{order.phone}</p>
              </div>
              {order.guest_email && (
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="font-medium text-slate-850 break-all">{order.guest_email}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400">Linked Profile</p>
                <div className="font-semibold text-indigo-600 mt-0.5">
                  {profile ? (
                    <Link href={`/admin/customers/${profile.id}`} className="hover:underline">
                      {profile.full_name || 'Linked Profile'}
                    </Link>
                  ) : (
                    <span className="text-slate-400 font-normal italic">Guest Order</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Zone / Fulfillment Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Fulfillment details
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Fulfillment Method</p>
                <p className="font-bold text-slate-800 capitalize">{order.fulfillment_type}</p>
              </div>
              {order.fulfillment_type === 'delivery' && (
                <div>
                  <p className="text-xs text-slate-400">Delivery Zone</p>
                  <p className="font-semibold text-slate-850 capitalize">
                    {order.delivery_zone?.replace('_', ' ')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400">Shipping Address</p>
                <p className="font-medium text-slate-800 whitespace-pre-line leading-relaxed mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {order.address}
                </p>
              </div>
              {order.notes && (
                <div>
                  <p className="text-xs text-slate-400">Order Notes</p>
                  <p className="font-medium text-slate-700 italic leading-relaxed mt-1 bg-amber-50/30 p-2.5 rounded-lg border border-amber-200/50">
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
