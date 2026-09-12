import { OrderLookupForm } from '@/components/storefront/order-lookup-form'
import { LeafDownfacing } from '@/components/storefront/leaf-decorations'
import React from 'react'

export const metadata = {
  title: 'Track Order | Bashtoli',
  description: 'Enter your order details to check real-time status and delivery progress.',
}

export default function OrderLookupPage() {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] flex items-center justify-center bg-cream-50 px-4 py-16 overflow-hidden">
      {/* Botanical corner decorations */}
      <LeafDownfacing
        className="absolute top-0 right-0 w-60 h-auto md:w-80 pointer-events-none text-forest-800"
        style={{ opacity: 0.15 }}
      />

      <div className="relative z-10 w-full max-w-md bg-cream-100 border border-forest-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6 text-center animate-fade-in">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-800 text-gold-400 mb-2 shadow-sm">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div>
          <h1
            className="text-2xl sm:text-3xl font-light text-forest-900"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic' }}
          >
            Track Your Order
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-forest-600 leading-relaxed max-w-xs mx-auto font-light">
            Enter your order reference number and phone number to review real-time status and delivery updates.
          </p>
        </div>

        <OrderLookupForm />
      </div>
    </div>
  )
}
