import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ToastProvider } from '@/components/ui/toast'
import { CheckoutBackgroundArt } from '@/components/storefront/checkout-background-art'

export const metadata: Metadata = {
  title: {
    template: '%s | Bashtoli Stationery',
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
      <div className="relative min-h-screen flex items-center justify-center bg-bg-canvas text-text-primary font-sans antialiased selection:bg-gold-500/20 selection:text-text-primary overflow-x-hidden p-4 sm:p-8 lg:p-12">
        {/* Ambient background art */}
        <CheckoutBackgroundArt className="text-gold-800/[0.04]" />

        {/* Ambient paper gradient */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 30% 30%, rgba(196,162,101,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(16,34,24,0.03) 0%, transparent 65%)',
          }}
          aria-hidden="true"
        />

        {/* 2-Column Main Stage */}
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-5 lg:gap-14 items-center">
          {/* Mobile Brand Header (Compact, visible only on < lg) */}
          <div className="lg:hidden flex items-center justify-center text-center pt-1 pb-1">
            <Link
              href="/"
              aria-label="Bashtoli Home"
              className="group inline-flex items-center gap-3 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-500 rounded-2xl px-3 py-1.5"
            >
              <Image
                src="/logo-round.svg"
                alt="Bashtoli Stationery"
                width={40}
                height={40}
                priority
                className="w-10 h-10 object-contain drop-shadow-xs shrink-0"
              />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.22em] text-text-accent font-semibold leading-none">
                  Bashtoli &nbsp;·&nbsp; Est. 2026
                </p>
                <h2 className="text-sm font-medium text-text-primary font-display tracking-tight mt-0.5">
                  Bashtoli Stationery
                </h2>
              </div>
            </Link>
          </div>

          {/* Desktop Left Column: Brand Emblem & Tagline (hidden on mobile, lg:flex on desktop) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center text-center py-12">
            <Link href="/" aria-label="Bashtoli Home" className="group block focus:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-500 rounded-3xl p-2">
              <div className="relative flex items-center justify-center">
                <Image
                  src="/logo-round.svg"
                  alt="Bashtoli Stationery"
                  width={280}
                  height={280}
                  priority
                  className="relative z-10 w-48 h-48 md:w-56 md:h-56 object-contain"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
            </Link>

            <div className="mt-6 max-w-xs">
              <p className="text-[10px] uppercase tracking-[0.22em] text-text-accent font-semibold mb-1.5">
                Bashtoli &nbsp;·&nbsp; Est. 2026
              </p>
              <h2 className="text-xl font-medium text-text-primary font-display tracking-tight">
                Bashtoli Stationery
              </h2>
              <p className="mt-1 text-xs text-text-secondary font-light leading-relaxed">
                Simple pens, papers, and desk essentials crafted for everyday note-taking.
              </p>
            </div>
          </div>

          {/* Right Column: Auth Card Box */}
          <div className="w-full lg:col-span-7 flex items-center justify-center min-h-[460px]">
            {children}
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}
