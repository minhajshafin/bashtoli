import { OrderLookupForm } from '@/components/storefront/order-lookup-form'
import { CheckoutBackgroundArt } from '@/components/storefront/checkout-background-art'
import { Search, HelpCircle } from 'lucide-react'
import React from 'react'

export const metadata = {
  title: 'Track Order',
  description: 'Enter your order details to check real-time status and delivery progress.',
}

export default function OrderLookupPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801825414737'
  const supportLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bashtoli, I need help tracking my order.')}`

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] flex items-center justify-center bg-bg-canvas px-4 py-8 sm:py-16 pb-32 sm:pb-20 overflow-hidden">
      <CheckoutBackgroundArt className="opacity-25" />

      <div className="relative z-10 w-full max-w-md bg-white/95 border border-border-primary rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-atelier space-y-6 text-center">
        {/* Icon Badge */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-900 text-gold-400 mb-1 shadow-xs border border-forest-800">
          <Search className="h-6 w-6 stroke-[2]" />
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-text-accent">
            Parcel Tracker
          </p>
          <h1 className="text-2xl sm:text-3xl font-medium text-text-primary font-display">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-[13px] text-text-secondary leading-relaxed max-w-xs mx-auto font-sans">
            Enter your order reference number and phone number to review real-time status and delivery updates.
          </p>
        </div>

        {/* Form */}
        <OrderLookupForm />

        {/* Support hint */}
        <div className="pt-2 border-t border-border-primary text-center">
          <a
            href={supportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-accent font-sans transition-colors cursor-pointer py-1"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Need help finding your reference? Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  )
}
