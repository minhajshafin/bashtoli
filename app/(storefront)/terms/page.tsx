import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: 'Terms of Service | Bashtoli Stationery',
  description: 'Read the Terms of Service governing orders, deliveries, and browsing on Bashtoli Stationery.',
}

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-forest-200 pb-6 mb-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-gold-500 font-bold mb-2">
          Legal
        </p>
        <h1
          className="text-3xl sm:text-4xl text-forest-950 font-normal tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic' }}
        >
          Terms of Service
        </h1>
        <p className="text-xs text-forest-600 mt-2 font-light">
          Last updated: September 2026
        </p>
      </div>

      <div className="prose prose-forest max-w-none space-y-6 text-sm text-forest-800 leading-relaxed font-light">
        <section className="space-y-2">
          <h2
            className="text-xl font-normal text-forest-900 tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or ordering from বাঁশতলী (Bashtoli Stationery), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please refrain from using our website or placing orders.
          </p>
        </section>

        <section className="space-y-2">
          <h2
            className="text-xl font-normal text-forest-900 tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            2. Orders & Pricing
          </h2>
          <p>
            All prices are listed in Bangladeshi Taka (৳ BDT) and are subject to availability.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-forest-700">
            <li><strong>Order Placement:</strong> When you place an order, you agree that your contact information and delivery address are accurate. Orders placed with invalid phone numbers may be canceled.</li>
            <li><strong>Stock Verification:</strong> Prices and stock are authoritative at the moment of order processing. In the event of an inventory discrepancy, our staff will contact you before dispatch.</li>
            <li><strong>Cancellations:</strong> Customers can cancel pending orders within 24 hours of placement directly through their order tracking page, provided the order has not already been packaged or dispatched.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2
            className="text-xl font-normal text-forest-900 tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            3. Delivery & Fulfillment
          </h2>
          <p>
            We offer Cash on Delivery (COD) and store pickup across Bangladesh:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-forest-700">
            <li><strong>Inside Dhaka:</strong> Typical delivery timeframe is 24 to 48 hours from dispatch confirmation.</li>
            <li><strong>Outside Dhaka:</strong> Deliveries are handled by partner courier networks and generally arrive within 3 to 5 business days.</li>
            <li><strong>Delivery Fees:</strong> Standard shipping rates apply based on selected delivery zones and will be reflected during checkout.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2
            className="text-xl font-normal text-forest-900 tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            4. Returns & Defective Items
          </h2>
          <p>
            We take pride in delivering curated, undamaged stationery. If your order arrives damaged, defective, or incorrect, please notify us within 48 hours of receipt with clear photographs via WhatsApp or email. We will arrange a replacement or refund promptly.
          </p>
        </section>

        <section className="space-y-2">
          <h2
            className="text-xl font-normal text-forest-900 tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            5. Intellectual Property
          </h2>
          <p>
            All original photography, branding, logo assets, and custom text published on this website are the property of Bashtoli Stationery and may not be reproduced or distributed without explicit written permission.
          </p>
        </section>

        <div className="pt-6 border-t border-forest-200">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-forest-800 hover:text-gold-600 transition-colors"
          >
            &larr; Return to shop
          </Link>
        </div>
      </div>
    </main>
  )
}
