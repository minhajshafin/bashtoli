import { OrderLookupForm } from '@/components/storefront/order-lookup-form'
import { CheckoutBackgroundArt } from '@/components/storefront/checkout-background-art'
import React from 'react'

export const metadata = {
  title: 'Track Order',
  description: 'Enter your order details to check real-time status and delivery progress.',
}

export default function OrderLookupPage() {
  return (
    <div className="relative min-h-[calc(100dvh-5rem)] flex items-center justify-center bg-cream-50 px-4 py-12 sm:py-16 overflow-hidden">
      <CheckoutBackgroundArt />

      <div className="relative z-10 w-full max-w-md bg-cream-100/70 border border-forest-200/80 rounded-2xl sm:rounded-3xl p-7 sm:p-10 shadow-2xs space-y-6 text-center animate-fade-in backdrop-blur-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-900 text-gold-400 mb-2 shadow-xs border border-forest-800">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div>
          <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90 mb-1.5">
            Order Tracking
          </p>
          <h1 className="text-2xl sm:text-3xl font-medium text-forest-950 font-display">
            Track Your Order
          </h1>
          <p className="mt-1.5 text-xs sm:text-[13px] text-forest-600 leading-relaxed max-w-xs mx-auto font-sans">
            Enter your order reference number and phone number to review real-time status and delivery updates.
          </p>
        </div>

        <OrderLookupForm />
      </div>
    </div>
  )
}
