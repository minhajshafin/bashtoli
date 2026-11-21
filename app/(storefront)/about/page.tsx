import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

export const metadata: Metadata = {
  title: 'Our Story',
  description: 'Learn about Bashtoli Stationery, our neighborhood workshop in Dhaka, and our passion for fine paper goods.',
  alternates: {
    canonical: 'https://bashtoli.com/about',
  },
}

export default function AboutPage() {
  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-cream-50 bg-laid-paper py-8 sm:py-16 px-4 sm:px-6 lg:px-8 pb-32 sm:pb-20 text-forest-950 selection:bg-gold-500/20 selection:text-forest-900">
      <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">
        {/* Header Eyebrow & Title */}
        <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900/5 border border-forest-200 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-700">
            <span>Dhaka, Bangladesh</span>
            <span className="text-gold-600">·</span>
            <span>Est. 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-medium tracking-tight font-display text-forest-950 leading-[1.15]">
            Crafted for thoughtful <em className="font-editorial italic font-normal text-gold-700">daily rituals</em>.
          </h1>

          <p className="text-xs sm:text-base text-forest-700 leading-relaxed font-light">
            A quiet sanctuary for notebook lovers, journal keepers, and fine pen collectors in Dhaka.
          </p>
        </div>

        {/* Feature Image Frame */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-border-primary shadow-atelier bg-cream-100">
          <Image
            src="https://images.unsplash.com/photo-1694754920848-8855ee3ff364?w=1600&h=800&fit=crop&auto=format"
            alt="Handcrafted bamboo stationery desk in Dhaka"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>

        {/* Narrative Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="md:col-span-5 space-y-4">
            <h2 className="font-display text-xl sm:text-2xl font-medium text-forest-950 tracking-tight">
              Our Philosophy &amp; Sourcing
            </h2>
            <p className="text-xs sm:text-sm text-forest-700 leading-relaxed font-light">
              Bashtoli was founded on a simple conviction: the physical tools you use to think, plan, and write shape the clarity of your thoughts.
            </p>
            <div className="p-4 rounded-2xl bg-cream-100/90 border border-border-primary text-xs text-forest-800 space-y-1">
              <span className="font-semibold text-forest-950 block">Cash on Delivery Across Bangladesh</span>
              <span className="text-forest-600 font-light block">Tk 70 flat inside Dhaka &middot; Tk 120 across all 64 districts</span>
            </div>
          </div>

          <div className="md:col-span-7 space-y-4 text-xs sm:text-sm text-forest-800 leading-relaxed font-light">
            <p>
              In an age of endless digital notifications, putting a pen to archival paper creates an irreplaceable pause. Every notebook on our shelves is chosen for its tactile tooth, ink resilience, and binding longevity.
            </p>
            <p>
              From bamboo-pulp sketchpads to fountain-pen friendly Japanese grid registers, we curate only what we use ourselves. Each order is packed by hand in our Shajadpur workshop and dispatched directly to your doorstep.
            </p>

            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="btn-primary inline-flex h-11 items-center justify-center rounded-xl px-6 text-xs font-bold uppercase tracking-wider"
              >
                Explore Catalog &rarr;
              </Link>
              <Link
                href="/order/lookup"
                className="btn-secondary inline-flex h-11 items-center justify-center rounded-xl px-6 text-xs font-semibold"
              >
                Track an Order
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
