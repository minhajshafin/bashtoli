import Link from 'next/link'
import React from 'react'
import { OrderStatus } from '@/components/storefront/order-status'
import { OrderReferencePill } from '@/components/storefront/order-reference-pill'
import { WhatsAppLink } from '@/components/storefront/whatsapp-link'
import { CancelOrderButton } from '@/components/storefront/cancel-order-button'
import { CheckoutSteps } from '@/components/storefront/checkout-steps'
import { PrintReceiptButton } from '@/components/storefront/print-receipt-button'
import { CheckoutBackgroundArt } from '@/components/storefront/checkout-background-art'
import { isOrderCancelable, type FullOrderDTO, type FullOrderItemDTO } from '@/lib/order/access'
import {
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  Store,
  Banknote,
  ShoppingBag,
  ArrowRight,
  Phone,
  Mail,
} from 'lucide-react'

export interface FullOrderViewProps {
  order: FullOrderDTO
  items: FullOrderItemDTO[]
  isOwner: boolean
}

/**
 * Full Order Details View: Shown for verified owners, staff, and admin, or callers with valid token.
 * Displays complete order receipt with customer details, address, invoice line items, and print/cancel actions.
 */
export function FullOrderView({ order, items, isOwner }: FullOrderViewProps) {
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const isPendingAndCancelable = isOrderCancelable(order.created_at, order.status)

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] px-4 py-6 sm:py-8 sm:px-6 lg:px-8 xl:px-10 pb-20 sm:pb-16 overflow-hidden">
      <CheckoutBackgroundArt />
      <div className="relative z-10 mx-auto max-w-3xl space-y-6 sm:space-y-8">
        {/* 3-Step Visual Progress Track */}
        <div className="print:hidden">
          <CheckoutSteps currentStep={3} />
        </div>

        {/* Celebratory Header Banner */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-900 text-gold-400 mb-1 shadow-xs border border-forest-800">
            <CheckCircle2 className="h-7 w-7 stroke-[2]" />
          </div>

          <div className="flex justify-center">
            <OrderReferencePill orderNumber={order.order_number} size="md" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-[2.2rem] font-medium text-forest-950 tracking-tight font-display">
              Thank you, {order.customer_name.split(' ')[0]}!
            </h1>
            <p className="text-xs sm:text-[13px] text-forest-600 font-sans max-w-md mx-auto leading-relaxed">
              Your stationery goods are confirmed. We are carefully packaging your items at our Dhaka studio.
            </p>
          </div>
        </div>

        {/* Main Order Card / Receipt */}
        <div className="bg-cream-100/75 border border-forest-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-9 shadow-2xs space-y-6 sm:space-y-7 print:bg-white print:border-none print:shadow-none print:p-0">
          {/* Header row: Order ID + Date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-forest-200/80">
            <div>
              <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
                Official Order Reference
              </p>
              <div className="mt-1">
                <OrderReferencePill orderNumber={order.order_number} size="sm" />
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
                Placement Timestamp
              </p>
              <p className="text-xs sm:text-sm font-medium text-forest-700 mt-1 font-sans flex sm:justify-end items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-forest-400" />
                {orderDate}
              </p>
            </div>
          </div>

          {/* Stepper block */}
          <div className="pb-5 border-b border-forest-200/80 print:hidden">
            <OrderStatus status={order.status} createdAt={order.created_at} />
          </div>

          {/* Delivery Details & Fulfillment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery Info */}
            <div className="rounded-2xl bg-cream-50/90 border border-forest-200/70 p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-forest-500" />
                <h3 className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
                  Recipient Details
                </h3>
              </div>
              <div>
                <p className="text-sm font-semibold text-forest-950 font-sans">{order.customer_name}</p>
                <a
                  href={`tel:${order.phone}`}
                  className="inline-flex items-center gap-1 text-xs font-mono font-medium text-forest-700 hover:text-gold-600 transition-colors mt-0.5"
                >
                  <Phone className="h-3 w-3 text-forest-400" />
                  <span>{order.phone}</span>
                </a>
              </div>
              <p className="text-xs sm:text-[13px] text-forest-600 leading-relaxed whitespace-pre-line font-sans pt-0.5">
                {order.address}
              </p>
              {order.guest_email && (
                <div className="flex items-center gap-1.5 text-xs text-forest-500 font-mono pt-1">
                  <Mail className="h-3 w-3 text-forest-400" />
                  <span>{order.guest_email}</span>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="rounded-2xl bg-cream-50/90 border border-forest-200/70 p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center gap-1.5">
                {order.fulfillment_type === 'pickup' ? (
                  <Store className="h-3.5 w-3.5 text-forest-500" />
                ) : (
                  <Truck className="h-3.5 w-3.5 text-forest-500" />
                )}
                <h3 className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
                  Fulfillment &amp; Payment
                </h3>
              </div>
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-forest-500">Method</span>
                  <span className="font-semibold text-forest-950 capitalize">
                    {order.fulfillment_type === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
                  </span>
                </div>
                {order.fulfillment_type === 'delivery' && (
                  <div className="flex justify-between items-center">
                    <span className="text-forest-500">Region</span>
                    <span className="font-semibold text-forest-950 capitalize">
                      {order.delivery_zone?.replace('_', ' ')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-forest-500">Payment Type</span>
                  <span className="font-semibold text-forest-950">Cash on Delivery (COD)</span>
                </div>
              </div>

              {/* Cash on Delivery / Pickup Reassurance Reminder */}
              {order.fulfillment_type === 'delivery' ? (
                <div className="mt-2.5 rounded-xl bg-gold-400/10 border border-gold-500/25 p-3 text-xs text-forest-900 flex items-start gap-2.5">
                  <Banknote className="h-4 w-4 text-gold-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-forest-950 font-sans">Cash on Delivery Reminder</p>
                    <p className="text-forest-600 text-[11px] leading-relaxed font-sans">
                      Please keep <span className="font-bold text-forest-950 font-price">৳{order.total.toLocaleString()}</span> in exact cash ready for the courier upon parcel delivery.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-2.5 rounded-xl bg-forest-900/5 border border-forest-800/15 p-3 text-xs text-forest-900 flex items-start gap-2.5">
                  <Store className="h-4 w-4 text-forest-800 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-forest-950 font-sans">Store Pickup · Dhaka Studio</p>
                    <p className="text-forest-600 text-[11px] leading-relaxed font-sans">
                      We will notify you via SMS/WhatsApp when your package is ready for collection at our studio.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer notes if any */}
          {order.notes && (
            <div className="rounded-xl bg-cream-50 border border-forest-200/80 p-3.5 text-xs space-y-1">
              <p className="font-sans font-semibold uppercase tracking-wider text-gold-600 text-[10px]">
                Customer Instructions
              </p>
              <p className="text-forest-700 italic leading-relaxed">{order.notes}</p>
            </div>
          )}

          {/* Purchased Items breakdown */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5 text-forest-500" />
              <h3 className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
                Purchased Items ({items.length})
              </h3>
            </div>
            <div className="divide-y divide-forest-200/70 border-t border-b border-forest-200/70">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 text-xs sm:text-sm font-sans gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-forest-950 truncate">{item.product_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-cream-200/80 text-[11px] font-mono font-medium text-forest-700">
                        Qty: {item.qty}
                      </span>
                      {item.qty > 1 && (
                        <span className="text-[11px] text-forest-500 font-price">
                          ৳{item.price_at_purchase.toLocaleString()} each
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-forest-950 font-price text-sm sm:text-base">
                      ৳{(item.price_at_purchase * item.qty).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Cost card block */}
          <div className="space-y-2.5 bg-cream-200/60 p-4 sm:p-5 rounded-2xl border border-forest-200/80">
            <div className="flex justify-between text-xs sm:text-[13px] font-sans">
              <span className="text-forest-600">Subtotal</span>
              <span className="font-semibold text-forest-950 font-price">৳{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-[13px] font-sans">
              <span className="text-forest-600">Shipping &amp; Delivery</span>
              <span className="font-semibold text-forest-950 font-price">
                {order.delivery_fee === 0 ? (
                  <span className="text-emerald-700 font-semibold uppercase tracking-wider text-xs">Free</span>
                ) : (
                  `৳${order.delivery_fee.toLocaleString()}`
                )}
              </span>
            </div>
            <hr className="border-forest-200/80 my-1" />
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-semibold text-forest-950 font-sans">Total (Pay on Delivery)</span>
              <span className="text-xl sm:text-2xl font-bold text-forest-950 font-price">
                ৳{order.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Full-width stacked on mobile, row on tablet/desktop */}
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-3 pt-2 print:hidden">
          <WhatsAppLink orderNumber={order.order_number} className="w-full sm:w-auto" />
          <Link
            href="/products"
            className="inline-flex h-12 sm:h-11 items-center justify-center gap-2 rounded-xl bg-forest-900 hover:bg-forest-850 px-6 text-xs sm:text-sm font-sans font-semibold uppercase tracking-wider text-cream-50 shadow-xs hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer w-full sm:w-auto"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <PrintReceiptButton className="w-full sm:w-auto" />
          {isOwner && isPendingAndCancelable && (
            <CancelOrderButton orderId={order.id} className="w-full sm:w-auto" />
          )}
        </div>
      </div>
    </div>
  )
}
