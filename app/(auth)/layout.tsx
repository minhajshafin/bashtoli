import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ToastProvider } from '@/components/ui/toast'
import { CheckoutBackgroundArt } from '@/components/storefront/checkout-background-art'

export const metadata: Metadata = {
  title: {
    template: '%s | Bashtoli',
    default: 'Account | Bashtoli Stationery',
  },
  description: 'Sign in or create your Bashtoli Stationery account.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className="relative min-h-screen flex items-center justify-center bg-forest-900 text-cream-100 font-sans antialiased selection:bg-gold-500/30 selection:text-cream-100 overflow-x-hidden p-4 sm:p-8 lg:p-12">
        {/* Ambient background art */}
        <CheckoutBackgroundArt className="text-gold-400/[0.05]" />

        {/* Ambient lighting */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 30% 40%, rgba(201,169,110,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(13,31,21,0.5) 0%, transparent 65%)',
          }}
          aria-hidden="true"
        />

        {/* 2-Column Main Stage */}
        <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Brand Emblem & Tagline */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center py-6 lg:py-12">
            <Link href="/" aria-label="Bashtoli Home" className="group block focus:outline-none">
              <div className="relative flex items-center justify-center">
                <Image
                  src="/logo-round.svg"
                  alt="Bashtoli Stationery"
                  width={280}
                  height={280}
                  priority
                  className="relative z-10 w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain transition-transform duration-500 group-hover:scale-105 filter drop-shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
            </Link>

            <div className="mt-6 max-w-xs">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold-400 font-bold mb-1.5">
                বাঁশতলী &nbsp;·&nbsp; Est. 2026
              </p>
              <h2 className="text-lg font-medium text-cream-100 font-display tracking-tight">
                Bashtoli Stationery
              </h2>
              <p className="mt-1 text-xs text-forest-300 font-light leading-relaxed">
                Simple pens, papers, and desk essentials crafted for everyday note-taking.
              </p>
            </div>
          </div>

          {/* Right Column: Auth Card Box */}
          <div className="lg:col-span-7 flex items-center justify-center w-full">
            {children}
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}
