import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'About Bashtoli — fine notebooks, writing instruments, and paper essentials.',
  alternates: {
    canonical: 'https://bashtoli.com/about',
  },
}

/**
 * About Page
 * TODO: Shop owner to provide verified brand story, workshop history, and sourcing details.
 * No unverified or invented claims are permitted here.
 */
export default function AboutPage() {
  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-cream-50 bg-laid-paper py-8 sm:py-16 px-4 sm:px-6 lg:px-8 pb-32 sm:pb-20 text-forest-950 selection:bg-gold-500/20 selection:text-forest-900">
      <div className="max-w-3xl mx-auto space-y-10 sm:space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900/5 border border-forest-200 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-forest-700">
            <span>Stationery Store</span>
            <span className="text-gold-700">&middot;</span>
            <span>Dhaka</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight font-display text-forest-950">
            About Bashtoli
          </h1>

          <p className="text-xs sm:text-sm text-forest-700 leading-relaxed font-light">
            Quality paper goods, journals, and desktop essentials for daily work and study.
          </p>
        </div>

        {/* Content Card with Clear Placeholder Tag */}
        <div className="rounded-2xl border border-border-primary bg-white/80 p-6 sm:p-10 shadow-elevation-1 space-y-6 text-xs sm:text-sm text-forest-800 leading-relaxed font-light">
          <div className="rounded-lg bg-cream-100 border border-border-primary p-4 text-xs text-forest-800 space-y-1">
            <span className="font-semibold text-forest-950 block">Notice</span>
            <p className="text-forest-700">
              {/* TODO: Shop owner to supply official brand narrative, verified sourcing background, and store history. */}
              Our complete brand background and workshop story will be published here upon official launch.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-lg sm:text-xl font-medium text-forest-950">
              Our Catalog &amp; Service
            </h2>
            <p>
              Bashtoli offers a curated selection of notebooks, journals, office essentials, and stationery supplies.
              All orders are delivered with Cash on Delivery across Bangladesh.
            </p>
            <p>
              Deliveries within Dhaka are charged at a flat rate of Tk 70, and deliveries outside Dhaka across all 64 districts are charged at Tk 120. Store pickup is available free of charge.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap gap-3 border-t border-forest-900/10">
            <Link
              href="/products"
              className="btn-primary inline-flex h-10 items-center justify-center rounded-xl px-5 text-xs font-bold uppercase tracking-wider"
            >
              Browse Products &rarr;
            </Link>
            <Link
              href="/order/lookup"
              className="btn-secondary inline-flex h-10 items-center justify-center rounded-xl px-5 text-xs font-semibold"
            >
              Track an Order
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
