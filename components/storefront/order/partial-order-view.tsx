import Link from 'next/link'
import React from 'react'
import { OrderStatus } from '@/components/storefront/order-status'
import { OrderLookupForm } from '@/components/storefront/order-lookup-form'
import { OrderReferencePill } from '@/components/storefront/order-reference-pill'
import { WhatsAppLink } from '@/components/storefront/whatsapp-link'
import { CheckoutBackgroundArt } from '@/components/storefront/checkout-background-art'
import type { RedactedOrderDTO } from '@/lib/order/access'
import { CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react'

export interface PartialOrderViewProps {
  order: RedactedOrderDTO
}

/**
 * Gate View: Shown when user does not have owner session, valid access token, or verified phone cookie.
 * Requires user to enter the phone number provided at checkout.
 * Receives ONLY a pre-redacted DTO containing order_number.
 */
export function OrderPhoneVerificationGate({ order }: PartialOrderViewProps) {
  return (
    <div className="relative min-h-[calc(100dvh-5rem)] flex items-center justify-center px-4 py-8 sm:py-16 pb-28 sm:pb-20 overflow-hidden">
      <CheckoutBackgroundArt />
      <div className="relative z-10 w-full max-w-md bg-cream-100/80 border border-forest-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 text-center animate-fade-in backdrop-blur-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-900 text-gold-400 mb-2 shadow-xs border border-forest-800">
          <ShieldCheck className="h-6 w-6 stroke-[2]" />
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
            Security Verification
          </p>
          <h1 className="text-2xl sm:text-3xl font-medium text-forest-950 font-display">
            Verify Phone Number
          </h1>
          <p className="text-xs sm:text-[13px] text-forest-600 leading-relaxed max-w-xs mx-auto font-sans">
            To view tracking information for order{' '}
            <span className="font-semibold text-forest-950 font-mono">{order.order_number}</span>
            , please enter the phone number provided at checkout.
          </p>
        </div>

        <OrderLookupForm initialOrderNumber={order.order_number} />
      </div>
    </div>
  )
}

/**
 * Partial Order Tracking View: Shown for verified phone guests.
 * Displays ONLY order status and item names/quantities.
 * Recipient name, phone, email, and delivery address are strictly hidden.
 */
export function PartialOrderView({ order }: PartialOrderViewProps) {
  const items = order.items || []

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] px-4 py-6 sm:py-8 sm:px-6 lg:px-8 xl:px-10 pb-20 sm:pb-16 overflow-hidden">
      <CheckoutBackgroundArt />
      <div className="relative z-10 mx-auto max-w-2xl space-y-6 sm:space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-900 text-gold-400 mb-1 shadow-xs border border-forest-800">
            <CheckCircle2 className="h-7 w-7 stroke-[2]" />
          </div>

          <div className="flex justify-center">
            <OrderReferencePill orderNumber={order.order_number} size="md" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-medium text-forest-950 tracking-tight font-display">
              Order Tracking
            </h1>
            <p className="text-xs sm:text-[13px] text-forest-600 font-sans max-w-md mx-auto leading-relaxed">
              Guest tracking view. Recipient contact and address details are hidden for privacy.
            </p>
          </div>
        </div>

        <div className="bg-cream-100/75 border border-forest-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-9 shadow-2xs space-y-6">
          {/* Status Stepper */}
          <div className="pb-5 border-b border-forest-200/80">
            <OrderStatus status={order.status} createdAt={order.created_at} />
          </div>

          {/* Ordered Items: ONLY item names and quantities */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5 text-forest-500" />
              <h3 className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
                Ordered Items ({items.length})
              </h3>
            </div>
            <div className="divide-y divide-forest-200/70 border-t border-b border-forest-200/70">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 text-xs sm:text-sm font-sans gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-forest-950 truncate">{item.product_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-cream-200/80 text-[11px] font-mono font-medium text-forest-700">
                      Qty: {item.qty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-3 pt-2">
          <WhatsAppLink orderNumber={order.order_number} className="w-full sm:w-auto" />
          <Link
            href="/products"
            className="inline-flex h-12 sm:h-11 items-center justify-center gap-2 rounded-xl bg-forest-900 hover:bg-forest-850 px-6 text-xs sm:text-sm font-sans font-semibold uppercase tracking-wider text-cream-50 shadow-xs hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer w-full sm:w-auto"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
