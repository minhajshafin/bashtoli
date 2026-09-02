import { OrderLookupForm } from '@/components/storefront/order-lookup-form'
import React from 'react'

export const metadata = {
  title: 'Track Order | Bashtoli',
  description: 'Enter your order details to check real-time status and delivery progress.',
}

export default function OrderLookupPage() {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] flex items-center justify-center bg-cream-50 px-4 py-16 overflow-hidden">
      {/* Botanical corner decorations */}
      <svg
        viewBox="0 0 320 320"
        fill="none"
        className="absolute top-0 right-0 w-64 h-64 md:w-80 md:h-80 pointer-events-none opacity-20"
        aria-hidden="true"
      >
        <path d="M300 10 Q260 70 200 110 Q150 145 170 210 Q185 250 230 270" stroke="#c9a96e" strokeWidth="1.5" fill="none" />
        <path d="M200 90 Q182 65 158 82 Q148 100 168 112 Q188 124 200 90Z" fill="#c9a96e" opacity="0.7" />
        <path d="M240 55 Q222 30 198 47 Q188 65 208 77 Q228 89 240 55Z" fill="#c9a96e" opacity="0.5" />
      </svg>

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
