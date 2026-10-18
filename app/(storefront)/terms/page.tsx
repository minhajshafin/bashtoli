import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the Terms of Service governing orders, deliveries, and browsing on Bashtoli Stationery.',
}

export default function TermsOfServicePage() {
  const sections = [
    { id: 'acceptance', number: '01', title: 'Acceptance of Terms' },
    { id: 'orders', number: '02', title: 'Orders & Pricing' },
    { id: 'delivery', number: '03', title: 'Delivery & Fulfillment' },
    { id: 'returns', number: '04', title: 'Returns & Replacements' },
    { id: 'property', number: '05', title: 'Store Brand & Content' },
  ]

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-cream-50 bg-laid-paper py-6 sm:py-16 px-4 sm:px-6 lg:px-8 pb-32 sm:pb-16 selection:bg-gold-500/20 selection:text-forest-900">
      <div className="max-w-5xl mx-auto">
        {/* Header Banner */}
        <div className="mb-6 sm:mb-12 border-b border-forest-200/80 pb-5 sm:pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900/5 border border-forest-200 text-[10px] font-bold uppercase tracking-[0.25em] text-forest-700 mb-2.5">
              <span>Customer Care</span>
              <span className="text-gold-600">·</span>
              <span>Store Policies</span>
            </div>
            <h1 className="text-2xl sm:text-4xl text-forest-950 font-medium tracking-tight font-display">
              Terms of Service
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-forest-600 font-light">
              Clear, transparent guidelines for purchasing stationery items and journals.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="inline-block text-[11px] font-mono text-forest-500 bg-cream-100/90 border border-forest-200/60 px-3 py-1 rounded-lg">
              Updated · September 2026
            </span>
          </div>
        </div>

        {/* Mobile Quick Jump Accordion (< lg only) */}
        <div className="lg:hidden mb-6">
          <details className="group rounded-2xl bg-cream-100/90 border border-forest-200/80 shadow-xs overflow-hidden">
            <summary className="flex items-center justify-between p-4 text-xs font-semibold uppercase tracking-wider text-forest-800 cursor-pointer list-none select-none">
              <div className="flex items-center gap-2">
                <span className="text-gold-600 font-mono text-[11px]">§</span>
                <span>Jump to Section ({sections.length})</span>
              </div>
              <svg className="w-4 h-4 text-forest-500 group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 pb-3 pt-1 border-t border-forest-200/60 divide-y divide-forest-200/40">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center justify-between py-2.5 text-xs text-forest-700 hover:text-forest-950 font-medium active:text-gold-600 transition-colors"
                >
                  <span>{s.title}</span>
                  <span className="font-mono text-[11px] text-gold-600">{s.number}</span>
                </a>
              ))}
            </div>
          </details>
        </div>

        {/* Editorial 2-Column Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Desktop Left Sticky Anchor Index & Policy Box (hidden on mobile, lg:block on desktop) */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <nav className="p-5 sm:p-6 rounded-2xl bg-cream-100/90 border border-forest-200/80 shadow-xs space-y-3" aria-label="Table of contents">
              <p className="text-[10px] uppercase tracking-[0.25em] text-forest-500 font-bold">
                Table of Contents
              </p>
              <ul className="space-y-2 text-xs">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group flex items-center justify-between py-1 px-2 rounded-lg text-forest-700 hover:text-forest-950 hover:bg-forest-900/5 transition-all"
                    >
                      <span className="font-medium">{s.title}</span>
                      <span className="font-mono text-[11px] text-gold-600 group-hover:translate-x-0.5 transition-transform">
                        {s.number}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Reassurance Callout Card */}
            <div className="p-5 rounded-2xl bg-forest-900 text-cream-100 border border-forest-800 shadow-sm space-y-2.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold">
                7-Day Replacement Promise
              </p>
              <p className="text-xs text-forest-300 font-light leading-relaxed">
                If paper leaves arrive bent or pen nibs defective, notify us within 48 hours for a quick doorstep replacement.
              </p>
              <div className="pt-1 flex flex-col gap-1.5 text-xs">
                <a
                  href="mailto:contact@bashtoli.com"
                  className="inline-flex items-center gap-1.5 font-medium text-gold-300 hover:text-gold-200 transition-colors"
                >
                  <span>✉</span> contact@bashtoli.com
                </a>
                <span className="text-[11px] text-forest-400">
                  Dhaka, Bangladesh · Prompt customer support
                </span>
              </div>
            </div>

            <div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs font-semibold text-forest-700 hover:text-forest-950 transition-colors py-2"
              >
                <span>&larr;</span> Return to Shop
              </Link>
            </div>
          </aside>

          {/* Right Main Editorial Content Card */}
          <div className="lg:col-span-8 p-5 sm:p-10 rounded-3xl bg-cream-100/90 border border-forest-200/80 shadow-xs space-y-8 sm:space-y-10">
            {/* Section 01 */}
            <section id="acceptance" className="scroll-mt-20 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-gold-600">01</span>
                <div className="h-px w-6 bg-forest-200" />
                <h2 className="text-lg sm:text-xl font-medium text-forest-950 font-display">
                  Acceptance of Terms
                </h2>
              </div>
              <p className="text-[13px] sm:text-sm text-forest-800 leading-relaxed font-normal">
                By browsing or ordering items from বাঁশতলী (Bashtoli Stationery), you agree to these standard store terms. If you do not agree with any part, please refrain from using the store or placing delivery orders.
              </p>
            </section>

            {/* Section 02 */}
            <section id="orders" className="scroll-mt-20 space-y-3 border-t border-forest-200/70 pt-8">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-gold-600">02</span>
                <div className="h-px w-6 bg-forest-200" />
                <h2 className="text-lg sm:text-xl font-medium text-forest-950 font-display">
                  Orders & Pricing
                </h2>
              </div>
              <p className="text-[13px] sm:text-sm text-forest-800 leading-relaxed font-normal">
                All prices are stated clearly in Bangladeshi Taka (৳ BDT) and include applicable local taxes.
              </p>
              <div className="space-y-2.5 pt-1">
                <div className="p-3.5 rounded-xl bg-cream-50/80 border border-forest-200/60 text-xs sm:text-[13px] text-forest-800 space-y-1">
                  <strong className="text-forest-950 block">Accuracy of Information:</strong>
                  Orders require a valid mobile phone number and delivery address. Incomplete orders may be verified by our staff before parcel dispatch.
                </div>
                <div className="p-3.5 rounded-xl bg-cream-50/80 border border-forest-200/60 text-xs sm:text-[13px] text-forest-800 space-y-1">
                  <strong className="text-forest-950 block">Stock Verification:</strong>
                  If an item goes out of stock prior to dispatch, we will contact you immediately to offer an alternative selection or prompt cancellation.
                </div>
                <div className="p-3.5 rounded-xl bg-cream-50/80 border border-forest-200/60 text-xs sm:text-[13px] text-forest-800 space-y-1">
                  <strong className="text-forest-950 block">Self-Service Cancellation:</strong>
                  You may cancel any pending order directly from your order tracking page within 24 hours of placement prior to packing.
                </div>
              </div>
            </section>

            {/* Section 03 */}
            <section id="delivery" className="scroll-mt-20 space-y-3 border-t border-forest-200/70 pt-8">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-gold-600">03</span>
                <div className="h-px w-6 bg-forest-200" />
                <h2 className="text-lg sm:text-xl font-medium text-forest-950 font-display">
                  Delivery & Fulfillment
                </h2>
              </div>
              <p className="text-[13px] sm:text-sm text-forest-800 leading-relaxed font-normal">
                We deliver nationwide across Bangladesh using trusted courier networks:
              </p>
              <ul className="space-y-2 text-[13px] sm:text-sm text-forest-700 pl-4 list-disc marker:text-gold-600">
                <li><strong>Inside Dhaka (৳70):</strong> Typically delivered within 24 to 48 hours of dispatch.</li>
                <li><strong>Outside Dhaka (৳120):</strong> Delivered within 3 to 5 business days across divisional and district hubs.</li>
                <li><strong>Store Pickup (Free):</strong> Orders can be collected from our shop location in Dhaka at no shipping cost.</li>
              </ul>
            </section>

            {/* Section 04 */}
            <section id="returns" className="scroll-mt-20 space-y-3 border-t border-forest-200/70 pt-8">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-gold-600">04</span>
                <div className="h-px w-6 bg-forest-200" />
                <h2 className="text-lg sm:text-xl font-medium text-forest-950 font-display">
                  Returns & Replacements
                </h2>
              </div>
              <p className="text-[13px] sm:text-sm text-forest-800 leading-relaxed font-normal">
                We inspect every notebook, pen, and desk accessory before packaging. If an item arrives physically damaged, torn, or non-functional, please send us photographs via WhatsApp within 48 hours of delivery. We will arrange a replacement or refund immediately.
              </p>
            </section>

            {/* Section 05 */}
            <section id="property" className="scroll-mt-20 space-y-3 border-t border-forest-200/70 pt-8">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-gold-600">05</span>
                <div className="h-px w-6 bg-forest-200" />
                <h2 className="text-lg sm:text-xl font-medium text-forest-950 font-display">
                  Store Brand & Content
                </h2>
              </div>
              <p className="text-[13px] sm:text-sm text-forest-800 leading-relaxed font-normal">
                Original product photography, store copy, and branding marks belong to Bashtoli Stationery. Unauthorized reproduction or scraping for commercial resale is strictly prohibited.
              </p>
            </section>

            {/* Mobile Support & Return Box (lg:hidden) */}
            <div className="lg:hidden pt-6 border-t border-forest-200/70 space-y-4">
              <div className="p-4 rounded-2xl bg-forest-900 text-cream-100 border border-forest-800 shadow-sm space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold">
                  7-Day Replacement Promise
                </p>
                <p className="text-xs text-forest-300 font-light leading-relaxed">
                  If paper leaves arrive bent or pen nibs defective, notify us within 48 hours for a quick doorstep replacement.
                </p>
                <div className="pt-1 flex flex-col gap-1 text-xs">
                  <a
                    href="mailto:contact@bashtoli.com"
                    className="inline-flex items-center gap-1.5 font-medium text-gold-300 hover:text-gold-200 transition-colors"
                  >
                    <span>✉</span> contact@bashtoli.com
                  </a>
                  <span className="text-[11px] text-forest-400">
                    Dhaka, Bangladesh · Prompt customer support
                  </span>
                </div>
              </div>

              <div>
                <Link
                  href="/products"
                  className="btn-secondary w-full h-12 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold"
                >
                  <span>&larr;</span> Return to Shop
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

