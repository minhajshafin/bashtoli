'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/lib/actions/auth'

interface MobileNavProps {
  isLoggedIn: boolean
  fullName: string | null
}

export function MobileNav({ isLoggedIn, fullName }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <div className="md:hidden flex items-center">
      {/* Trigger */}
      <button
        id="storefront-mobile-nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-8.5 h-8.5 rounded-lg text-gold-400 hover:text-gold-300 hover:bg-forest-800/60 transition-all cursor-pointer active:scale-95"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <svg className="h-5 w-5 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-forest-950/80 backdrop-blur-xs transition-opacity animate-fade-in"
            aria-hidden="true"
          />
          {/* Panel - Slides from Left */}
          <div className="relative mr-auto flex h-full w-80 max-w-[85vw] flex-col bg-forest-900 border-r border-forest-800/80 p-6 shadow-sm animate-slide-in-left overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-forest-800 pb-4">
              <Link href="/" onClick={() => setIsOpen(false)} aria-label="Home" className="shrink-0">
                <div className="relative h-8 w-20">
                  <Image
                    src="/logo-text.svg"
                    alt="Bashtoli Stationery"
                    fill
                    className="object-contain object-left"
                  />
                </div>
              </Link>
              <button
                id="storefront-mobile-nav-close"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-forest-400 hover:text-gold-300 hover:bg-forest-800/60 active:scale-95 transition-all cursor-pointer"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-5 space-y-1" aria-label="Mobile Navigation">
              {[
                { label: 'Home', href: '/' },
                { label: 'Shop All Products', href: '/products' },
                { label: 'Our Story', href: '/#aboutus' },
                { label: 'Track My Order', href: '/order/lookup' },
                { label: 'Wishlist', href: '/account/wishlist' },
                { label: 'Shopping Bag', href: '/bag' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block py-2.5 px-3.5 rounded-xl text-xs uppercase tracking-[0.14em] font-medium text-cream-100/90 hover:text-gold-300 hover:bg-forest-800/60 active:scale-98 transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Account Footer */}
            <div className="border-t border-forest-800 pt-5 space-y-3">
              {isLoggedIn ? (
                <>
                  <div className="px-3">
                    <p className="text-[9px] text-forest-400/80 font-semibold uppercase tracking-[0.16em]">Signed in as</p>
                    <p className="text-xs font-semibold text-cream-100 truncate mt-0.5">
                      {fullName || 'Customer'}
                    </p>
                  </div>
                  <Link
                    href="/account"
                    className="block text-center py-2.5 rounded-xl border border-forest-700/80 bg-forest-800/40 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-400 hover:bg-forest-800 hover:text-gold-300 transition-all active:scale-98"
                  >
                    Manage Account
                  </Link>
                  <form action={logoutAction} className="w-full">
                    <button
                      type="submit"
                      className="btn-danger w-full text-center py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-[0.14em]"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="btn-accent block text-center py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em]"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
