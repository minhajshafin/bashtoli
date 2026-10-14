import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Bashtoli Stationery collects, protects, and manages your personal information.',
}

export default function PrivacyPolicyPage() {
  const sections = [
    { id: 'overview', number: '01', title: 'Overview' },
    { id: 'collection', number: '02', title: 'Information We Collect' },
    { id: 'usage', number: '03', title: 'How We Use Your Information' },
    { id: 'security', number: '04', title: 'Data Security & Storage' },
    { id: 'contact', number: '05', title: 'Contact & Data Rights' },
  ]

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-cream-50 bg-laid-paper py-10 sm:py-16 px-4 sm:px-6 lg:px-8 selection:bg-gold-500/20 selection:text-forest-900">
      <div className="max-w-5xl mx-auto">
        {/* Header Banner */}
        <div className="mb-10 sm:mb-14 border-b border-forest-200/80 pb-6 sm:pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900/5 border border-forest-200 text-[10px] font-bold uppercase tracking-[0.25em] text-forest-700 mb-3">
              <span>Customer Care</span>
              <span className="text-gold-600">·</span>
              <span>Legal Notice</span>
            </div>
            <h1 className="text-3xl sm:text-4xl text-forest-950 font-normal tracking-tight font-display">
              Privacy Policy
            </h1>
            <p className="mt-2 text-xs sm:text-[13px] text-forest-600 font-light">
              How we protect your details when you shop for papers and pens.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="inline-block text-[11px] font-mono text-forest-500 bg-cream-100/90 border border-forest-200/60 px-3 py-1 rounded-lg">
              Updated · September 2026
            </span>
          </div>
        </div>

        {/* Editorial 2-Column Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Sticky Anchor Index & Support Box */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
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

            {/* Direct Support Card */}
            <div className="p-5 rounded-2xl bg-forest-900 text-cream-100 border border-forest-800 shadow-sm space-y-2.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold">
                Need Assistance?
              </p>
              <p className="text-xs text-forest-300 font-light leading-relaxed">
                Have questions about your order or want to update your stored delivery address?
              </p>
              <div className="pt-1 flex flex-col gap-1.5 text-xs">
                <a
                  href="mailto:contact@bashtoli.com"
                  className="inline-flex items-center gap-1.5 font-medium text-gold-300 hover:text-gold-200 transition-colors"
                >
                  <span>✉</span> contact@bashtoli.com
                </a>
                <span className="text-[11px] text-forest-400">
                  Dhaka, Bangladesh · 7 Days a week
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
          <div className="lg:col-span-8 p-6 sm:p-10 rounded-3xl bg-cream-100/90 border border-forest-200/80 shadow-xs space-y-10">
            {/* Section 01 */}
            <section id="overview" className="scroll-mt-28 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-gold-600">01</span>
                <div className="h-px w-6 bg-forest-200" />
                <h2 className="text-lg sm:text-xl font-medium text-forest-950 font-display">
                  Overview
                </h2>
              </div>
              <p className="text-xs sm:text-[13px] text-forest-800 leading-relaxed font-normal">
                At বাঁশতলী (Bashtoli Stationery), we respect your privacy and are committed to safeguarding the personal details you share with us. This policy outlines the types of information we collect, how it is used to fulfill your stationery orders, and the measures we take to keep your data secure.
              </p>
            </section>

            {/* Section 02 */}
            <section id="collection" className="scroll-mt-28 space-y-3 border-t border-forest-200/70 pt-8">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-gold-600">02</span>
                <div className="h-px w-6 bg-forest-200" />
                <h2 className="text-lg sm:text-xl font-medium text-forest-950 font-display">
                  Information We Collect
                </h2>
              </div>
              <p className="text-xs sm:text-[13px] text-forest-800 leading-relaxed font-normal">
                When you browse our catalog, place an order, or create an account, we may collect the following information:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-cream-50/80 border border-forest-200/60">
                  <p className="text-[11px] font-bold text-forest-900 uppercase tracking-wide mb-1">
                    Contact Details
                  </p>
                  <p className="text-xs text-forest-700 leading-relaxed">
                    Full name, delivery phone number, and optional email address.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-cream-50/80 border border-forest-200/60">
                  <p className="text-[11px] font-bold text-forest-900 uppercase tracking-wide mb-1">
                    Delivery Address
                  </p>
                  <p className="text-xs text-forest-700 leading-relaxed">
                    Shipping address, selected delivery zone (Inside / Outside Dhaka), and notes.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-cream-50/80 border border-forest-200/60">
                  <p className="text-[11px] font-bold text-forest-900 uppercase tracking-wide mb-1">
                    Order Records
                  </p>
                  <p className="text-xs text-forest-700 leading-relaxed">
                    Purchased items, quantities, pricing snapshots, and fulfillment history.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-cream-50/80 border border-forest-200/60">
                  <p className="text-[11px] font-bold text-forest-900 uppercase tracking-wide mb-1">
                    Authentication
                  </p>
                  <p className="text-xs text-forest-700 leading-relaxed">
                    Encrypted session tokens managed securely via Supabase Auth.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 03 */}
            <section id="usage" className="scroll-mt-28 space-y-3 border-t border-forest-200/70 pt-8">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-gold-600">03</span>
                <div className="h-px w-6 bg-forest-200" />
                <h2 className="text-lg sm:text-xl font-medium text-forest-950 font-display">
                  How We Use Your Information
                </h2>
              </div>
              <p className="text-xs sm:text-[13px] text-forest-800 leading-relaxed font-normal">
                We use your personal data strictly for legitimate operational purposes:
              </p>
              <ul className="space-y-2 text-xs sm:text-[13px] text-forest-700 pl-4 list-disc marker:text-gold-600">
                <li>Processing and dispatching your stationery packages via courier partners across Bangladesh.</li>
                <li>Sending transactional updates including order receipts and delivery confirmation via WhatsApp, phone, or email.</li>
                <li>Allowing you to lookup past orders and track package progress anytime.</li>
                <li>Maintaining store inventory balance and improving our stationery selections.</li>
              </ul>
            </section>

            {/* Section 04 */}
            <section id="security" className="scroll-mt-28 space-y-3 border-t border-forest-200/70 pt-8">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-gold-600">04</span>
                <div className="h-px w-6 bg-forest-200" />
                <h2 className="text-lg sm:text-xl font-medium text-forest-950 font-display">
                  Data Security & Payment Privacy
                </h2>
              </div>
              <p className="text-xs sm:text-[13px] text-forest-800 leading-relaxed font-normal">
                Your account credentials and passwords are encrypted using industry-standard protocols. We do not store sensitive payment card credentials on our servers — all retail transactions are settled safely via Cash on Delivery (COD) upon physical package inspection.
              </p>
              <div className="p-4 rounded-xl bg-forest-900/5 border border-forest-200 text-xs text-forest-800 flex items-start gap-3">
                <span className="text-base text-gold-600 mt-0.5">✓</span>
                <p>
                  <strong>No Marketing Spam:</strong> We will never sell, lease, or rent your phone number or contact information to third-party marketing networks.
                </p>
              </div>
            </section>

            {/* Section 05 */}
            <section id="contact" className="scroll-mt-28 space-y-3 border-t border-forest-200/70 pt-8">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-gold-600">05</span>
                <div className="h-px w-6 bg-forest-200" />
                <h2 className="text-lg sm:text-xl font-medium text-forest-950 font-display">
                  Contact & Data Rights
                </h2>
              </div>
              <p className="text-xs sm:text-[13px] text-forest-800 leading-relaxed font-normal">
                If you have questions about your stored data, wish to request account deletion, or want to update your delivery address, write to us directly at{' '}
                <a
                  href="mailto:contact@bashtoli.com"
                  className="text-forest-950 font-semibold underline decoration-gold-400 hover:text-gold-600"
                >
                  contact@bashtoli.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
