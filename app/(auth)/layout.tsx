import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ToastProvider } from '@/components/ui/toast'
import { LeafDownfacing, LeafUprising } from '@/components/storefront/leaf-decorations'

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
      <div className="relative min-h-screen flex items-center justify-center bg-forest-800 text-cream-100 font-sans antialiased selection:bg-gold-500 selection:text-forest-900 overflow-x-hidden p-4 sm:p-8 lg:p-12">
        {/* Background ambient lighting */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 25% 45%, rgba(201,169,110,0.12) 0%, transparent 60%), radial-gradient(ellipse at 85% 75%, rgba(13,31,21,0.4) 0%, transparent 65%)',
          }}
          aria-hidden="true"
        />

        {/* Botanical corner decorations (matching Hero section) */}
        <LeafDownfacing
          className="fixed -top-4 -right-4 w-60 h-auto sm:w-72 md:w-84 lg:w-96 pointer-events-none text-gold-400"
          style={{ opacity: 0.16 }}
        />
        <LeafUprising
          className="fixed -bottom-4 -left-4 w-52 h-auto sm:w-64 md:w-76 lg:w-88 pointer-events-none text-gold-400"
          style={{ opacity: 0.13 }}
        />

        {/* 2-Column Main Stage */}
        <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Big Center Round Logo */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center text-center py-6 lg:py-12">
            <Link href="/" aria-label="Bashtoli Home" className="group block focus:outline-none">
              <div className="relative flex items-center justify-center">
                {/* Soft ambient back-glow */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-35 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, #c9a96e 0%, rgba(36,61,46,0.5) 70%)' }}
                />
                <Image
                  src="/logo-round.svg"
                  alt="Bashtoli Stationery"
                  width={340}
                  height={340}
                  loading="eager"
                  fetchPriority="high"
                  className="relative z-10 w-44 h-44 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[340px] lg:h-[340px] object-contain transition-transform duration-500 group-hover:scale-105 filter drop-shadow-[0_12px_36px_rgba(0,0,0,0.4)]"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
            </Link>

            <div className="mt-6 max-w-sm">
              <p
                className="text-[11px] uppercase tracking-[0.3em] text-gold-400 font-bold mb-1"
                style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
              >
                বাঁশতলী &nbsp;·&nbsp; Est. 2026
              </p>
              <p className="text-xs text-forest-300 font-light leading-relaxed">
                A sanctuary for writers, dreamers, and ink-lovers.
              </p>
            </div>
          </div>

          {/* Right Column: Auth Card Box */}
          <div className="lg:col-span-6 flex items-center justify-center w-full">
            {children}
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}
