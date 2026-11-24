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
      <div className="relative min-h-screen flex items-center justify-center bg-forest-950 bg-laid-paper-dark text-cream-50 font-sans antialiased selection:bg-gold-500/25 selection:text-gold-200 overflow-x-hidden p-4 sm:p-8 lg:p-12">
        {/* Ambient background art with dark botanical foliage */}
        <CheckoutBackgroundArt variant="dark" className="opacity-30" />

        {/* Ambient warm brass and emerald glow */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 30% 25%, rgba(196,162,101,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 75%, rgba(22,46,33,0.5) 0%, transparent 65%)',
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
              className="group inline-flex items-center gap-3 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-400 rounded-2xl px-3 py-1.5"
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
                <p className="text-[10px] uppercase tracking-[0.22em] text-gold-400 font-semibold leading-none">
                  Bashtoli &nbsp;·&nbsp; Est. 2026
                </p>
                <h2 className="text-sm font-medium text-cream-50 font-display tracking-tight mt-0.5">
                  Bashtoli Stationery
                </h2>
              </div>
            </Link>
          </div>

          {/* Desktop Left Column: Brand Emblem & Tagline (hidden on mobile, lg:flex on desktop) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center text-center py-12">
            <Link
              href="/"
              aria-label="Bashtoli Home"
              className="group block focus:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-400 rounded-3xl p-2 transition-transform duration-300 hover:scale-102"
            >
              <div className="relative flex items-center justify-center">
                {/* Subtle warm halo */}
                <div className="absolute inset-0 rounded-full bg-gold-500/10 blur-2xl transform scale-125 pointer-events-none" />
                <Image
                  src="/logo-round.svg"
                  alt="Bashtoli Stationery"
                  width={280}
                  height={280}
                  priority
                  className="relative z-10 w-48 h-48 md:w-56 md:h-56 object-contain drop-shadow-md"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
            </Link>

            <div className="mt-6 max-w-xs">
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold-400 font-semibold mb-1.5">
                Bashtoli &nbsp;·&nbsp; Est. 2026
              </p>
              <h2 className="text-xl sm:text-2xl font-medium text-cream-50 font-display tracking-tight">
                Bashtoli Stationery
              </h2>
              <p className="mt-1.5 text-xs text-forest-200/90 font-light leading-relaxed">
                Simple pens, papers, and desk essentials crafted for everyday note-taking.
              </p>

              {/* Refined atelier hallmarks */}
              <div className="mt-6 pt-5 border-t border-forest-800/80 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.16em] text-forest-300/90 font-medium">
                <span>Archival Paper</span>
                <span className="text-gold-500/50">·</span>
                <span>Fine Inks</span>
                <span className="text-gold-500/50">·</span>
                <span>Dhaka COD</span>
              </div>
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
