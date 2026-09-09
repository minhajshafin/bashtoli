import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Bashtoli Stationery',
  description: 'Learn how Bashtoli Stationery collects, protects, and manages your personal information.',
}

export default function PrivacyPolicyPage() {
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
          Privacy Policy
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
            1. Overview
          </h2>
          <p>
            At বাঁশতলী (Bashtoli Stationery), we respect your privacy and are committed to safeguarding the personal details you share with us. This policy outlines the types of information we collect, how it is used to fulfill your stationery orders, and the measures we take to keep your data secure.
          </p>
        </section>

        <section className="space-y-2">
          <h2
            className="text-xl font-normal text-forest-900 tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            2. Information We Collect
          </h2>
          <p>
            When you browse our catalog, place an order, or create an account, we may collect the following information:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-forest-700">
            <li><strong>Contact details:</strong> Full name, phone number, and email address.</li>
            <li><strong>Delivery information:</strong> Shipping address, delivery zone, and delivery instructions/notes.</li>
            <li><strong>Order history:</strong> Items purchased, quantities, pricing snapshots, and status tracking history.</li>
            <li><strong>Account credentials:</strong> Email and encrypted session tokens managed securely via Supabase Auth.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2
            className="text-xl font-normal text-forest-900 tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            3. How We Use Your Information
          </h2>
          <p>
            We use your personal data strictly for legitimate operational purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-forest-700">
            <li>Processing and dispatching your stationery orders via our local courier partners in Bangladesh.</li>
            <li>Sending transactional notifications including order confirmations, delivery updates, and customer support messages via WhatsApp, phone, or email.</li>
            <li>Enabling order lookups and past order tracking for guest and registered users.</li>
            <li>Improving our website performance, inventory management, and curated product offerings.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2
            className="text-xl font-normal text-forest-900 tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            4. Data Security & Storage
          </h2>
          <p>
            Your account credentials, passwords, and sessions are encrypted and managed using industry-standard security protocols. We do not store sensitive payment card credentials on our servers — all retail transactions are settled via Cash on Delivery (COD) or authorized mobile financial services.
          </p>
        </section>

        <section className="space-y-2">
          <h2
            className="text-xl font-normal text-forest-900 tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            5. Contact Us
          </h2>
          <p>
            If you have questions about your personal data, wish to request account deletion, or want to update your delivery details, please reach out to us at{' '}
            <a
              href="mailto:contact@bashtoli.com"
              className="text-forest-900 font-semibold underline decoration-gold-400 hover:text-gold-600"
            >
              contact@bashtoli.com
            </a>{' '}
            or visit us at our shop in Dhaka.
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
