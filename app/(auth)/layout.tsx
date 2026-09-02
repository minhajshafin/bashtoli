import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ToastProvider } from '@/components/ui/toast'

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
        <svg
          viewBox="0 0 320 320"
          fill="none"
          className="fixed top-0 right-0 w-64 h-64 md:w-80 md:h-80 pointer-events-none opacity-20"
          aria-hidden="true"
        >
          <path d="M300 10 Q260 70 200 110 Q150 145 170 210 Q185 250 230 270" stroke="#c9a96e" strokeWidth="1.5" fill="none" />
          <path d="M200 90 Q182 65 158 82 Q148 100 168 112 Q188 124 200 90Z" fill="#c9a96e" opacity="0.7" />
          <path d="M240 55 Q222 30 198 47 Q188 65 208 77 Q228 89 240 55Z" fill="#c9a96e" opacity="0.5" />
          <path d="M275 25 Q257 5 233 22 Q223 38 243 47 Q263 56 275 25Z" fill="#c9a96e" opacity="0.4" />
        </svg>

        <svg
          viewBox="0 0 280 280"
          fill="none"
          className="fixed bottom-0 left-0 w-56 h-56 md:w-72 md:h-72 pointer-events-none opacity-18"
          aria-hidden="true"
        >
          <path d="M20 260 Q60 215 80 155 Q100 95 55 45" stroke="#c9a96e" strokeWidth="1.5" fill="none" />
          <path d="M75 120 Q95 95 80 70 Q62 63 57 80 Q52 97 75 120Z" fill="#c9a96e" opacity="0.6" />
          <path d="M55 165 Q78 140 62 115 Q44 108 39 125 Q34 142 55 165Z" fill="#c9a96e" opacity="0.5" />
        </svg>

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
                  priority
                  className="relative z-10 w-44 h-44 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[340px] lg:h-[340px] object-contain transition-transform duration-500 group-hover:scale-105 filter drop-shadow-[0_12px_36px_rgba(0,0,0,0.4)]"
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
