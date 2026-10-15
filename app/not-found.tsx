import React from 'react'
import Link from 'next/link'
import { CheckoutBackgroundArt } from '@/components/storefront/checkout-background-art'

export const metadata = {
  title: 'Page Not Found',
  description: 'The requested page seems to have escaped between the margins.',
}

/**
 * Global 404 Page View with stationery aesthetics & Bashtoli brand harmony.
 */
export default function NotFoundPage() {
  return (
    <div className="relative min-h-[calc(100dvh-5rem)] flex items-center justify-center bg-cream-50 bg-laid-paper px-4 py-16 text-center overflow-hidden selection:bg-gold-500/20 selection:text-forest-900">
      {/* Ambient stationery line art */}
      <CheckoutBackgroundArt className="text-forest-900/[0.04]" />

      <div className="relative z-10 w-full max-w-lg mx-auto bg-cream-100/95 border border-forest-200/85 rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
        {/* Stationery badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-forest-900/5 border border-forest-200/80 px-4 py-1.5 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-600" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-forest-700">
            404 · Unwritten Sheet
          </span>
        </div>

        {/* Heading & description */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-normal text-forest-950 tracking-tight font-display">
            Slipped between the margins.
          </h1>
          <p className="text-xs sm:text-[13px] text-forest-600 leading-relaxed max-w-sm mx-auto font-light">
            The page or collection you are looking for does not exist in our stationery catalog, or may have been renamed.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/products"
            className="btn-primary inline-flex h-11 items-center justify-center gap-2 px-6 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Return to Shop &rarr;
          </Link>

          <Link
            href="/"
            className="btn-secondary inline-flex h-11 items-center justify-center px-6 rounded-xl text-xs font-semibold"
          >
            Visit Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
