'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { AccountNav } from '@/components/storefront/account-nav'
import { CheckoutBackgroundArt } from '@/components/storefront/checkout-background-art'

interface AccountLayoutWrapperProps {
  userInitial: string
  displayName: string
  email: string | undefined
  role: string | undefined
  children: React.ReactNode
}

/**
 * AccountLayoutWrapper
 * Dynamically adapts the customer portal container:
 * - On /account/wishlist on mobile screens: hides the top aside identity & nav rail so the saved items are immediately front and center.
 * - On /account/profile: switches the ambient background to Bashtoli's deep forest green and gold stationery palette.
 * - Preserves standard desktop two-column layouts across all views.
 */
export function AccountLayoutWrapper({
  userInitial,
  displayName,
  email,
  role,
  children,
}: AccountLayoutWrapperProps) {
  const pathname = usePathname()
  const isWishlist = pathname === '/account/wishlist'
  const isProfile = pathname === '/account/profile'

  return (
    <div
      className={`relative min-h-[calc(100dvh-5rem)] overflow-hidden transition-colors duration-300 ${
        isProfile
          ? 'bg-forest-950 bg-laid-paper-dark text-cream-100 selection:bg-gold-500/30 py-6 sm:py-10 lg:py-16 pb-36 sm:pb-24'
          : isWishlist
            ? 'bg-cream-50 text-forest-900 pt-0 sm:pt-0 lg:py-16 pb-36 sm:pb-24'
            : 'bg-cream-50 text-forest-900 py-6 sm:py-10 lg:py-16 pb-36 sm:pb-24'
      }`}
    >
      <CheckoutBackgroundArt className={isProfile ? 'opacity-30' : undefined} />

      <div
        className={`relative z-10 mx-auto max-w-[1440px] xl:max-w-[1520px] w-full flex-1 ${
          isWishlist ? 'px-0 lg:px-8 xl:px-10' : 'px-4 sm:px-6 lg:px-8 xl:px-10'
        }`}
      >
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-12 items-start">
          {/* Sidebar / Top Navigation Rail */}
          <aside
            className={`lg:col-span-4 pb-5 lg:pb-0 border-b lg:border-b-0 lg:border-r lg:pr-8 xl:pr-10 ${
              isWishlist ? 'hidden lg:block' : 'block'
            } ${isProfile ? 'border-forest-800/80' : 'border-forest-200/80'}`}
          >
            <div className="space-y-4 sm:space-y-6">
              {/* Customer Identity Card */}
              <div
                className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border shadow-2xs backdrop-blur-xs transition-colors ${
                  isProfile
                    ? 'border-forest-800/90 bg-forest-900/80 text-cream-50 shadow-xl'
                    : 'border-forest-200/80 bg-cream-100/75 text-forest-900'
                }`}
              >
                <div
                  className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl font-display text-lg sm:text-xl font-medium shadow-xs border ${
                    isProfile
                      ? 'bg-forest-950 text-gold-400 border-gold-500/40 ring-2 ring-gold-400/10'
                      : 'bg-forest-900 text-gold-400 border-forest-800'
                  }`}
                >
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-[10px] font-sans font-semibold uppercase tracking-[0.2em] ${
                        isProfile ? 'text-gold-400/90' : 'text-forest-600/90'
                      }`}
                    >
                      Customer
                    </p>
                    {role && role !== 'customer' && (
                      <span className="inline-flex items-center rounded-full bg-gold-400/20 px-2 py-0.2 text-[9px] font-mono font-bold uppercase tracking-wider text-gold-700 border border-gold-400/40">
                        {role}
                      </span>
                    )}
                  </div>
                  <h2
                    className={`text-sm sm:text-lg font-medium font-display truncate mt-0.5 ${
                      isProfile ? 'text-cream-50' : 'text-forest-950'
                    }`}
                  >
                    {displayName}
                  </h2>
                  <p
                    className={`text-xs truncate font-mono ${
                      isProfile ? 'text-forest-400' : 'text-forest-600'
                    }`}
                  >
                    {email}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs (Horizontal on mobile, vertical list on desktop) */}
              <AccountNav isDark={isProfile} />
            </div>
          </aside>

          {/* Main Content Area */}
          <main
            className={`${
              isWishlist ? 'col-span-12 lg:col-span-8' : 'lg:col-span-8'
            } ${isWishlist ? 'pt-0 lg:pt-0' : 'pt-5 lg:pt-0'} min-w-0`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
