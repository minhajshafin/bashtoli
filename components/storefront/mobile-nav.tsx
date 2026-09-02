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
  const [lastPath, setLastPath] = useState(pathname)

  if (pathname !== lastPath) {
    setLastPath(pathname)
    setIsOpen(false)
  }

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
        className="inline-flex items-center justify-center p-2 rounded-xl text-gold-400 hover:text-gold-500 transition-colors cursor-pointer"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <svg className="h-6 w-6 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="fixed inset-0 bg-forest-950/70 backdrop-blur-xs"
            aria-hidden="true"
          />
          {/* Panel - Slides from Left */}
          <div className="relative mr-auto flex h-full w-80 max-w-[85vw] flex-col bg-forest-800 p-6 shadow-2xl animate-slide-in-left overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-forest-700 pb-4">
              <Link href="/" onClick={() => setIsOpen(false)} aria-label="Home" className="shrink-0">
                <div className="relative h-6 w-24">
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
                className="rounded-lg p-1.5 text-forest-400 hover:text-gold-500 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-6 space-y-1 text-sm font-medium text-gold-400">
              <Link
                href="/"
                className="block py-3 px-3 rounded-xl border border-transparent hover:border-forest-600 hover:text-gold-500 hover:bg-forest-700/50 transition-all"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="block py-3 px-3 rounded-xl border border-transparent hover:border-forest-600 hover:text-gold-500 hover:bg-forest-700/50 transition-all"
              >
                Shop All Products
              </Link>
              <Link
                href="/account/wishlist"
                className="block py-3 px-3 rounded-xl border border-transparent hover:border-forest-600 hover:text-gold-500 hover:bg-forest-700/50 transition-all"
              >
                Wishlist
              </Link>
              <Link
                href="/cart"
                className="block py-3 px-3 rounded-xl border border-transparent hover:border-forest-600 hover:text-gold-500 hover:bg-forest-700/50 transition-all"
              >
                Shopping Bag
              </Link>
              <Link
                href="/order/lookup"
                className="block py-3 px-3 rounded-xl border border-transparent hover:border-forest-600 hover:text-gold-500 hover:bg-forest-700/50 transition-all"
              >
                Track Order
              </Link>
            </nav>

            {/* Account Footer */}
            <div className="border-t border-forest-700 pt-5 space-y-3">
              {isLoggedIn ? (
                <>
                  <div className="px-3">
                    <p className="text-[10px] text-forest-400 font-bold uppercase tracking-wider">Signed in as</p>
                    <p className="text-xs font-semibold text-cream-100 truncate mt-0.5">
                      {fullName || 'Customer'}
                    </p>
                  </div>
                  <Link
                    href="/account"
                    className="block text-center py-2.5 rounded-xl border border-forest-600 text-xs font-bold text-gold-400 hover:bg-forest-700 transition-colors"
                  >
                    Manage Account
                  </Link>
                  <form action={logoutAction} className="w-full">
                    <button
                      type="submit"
                      className="w-full text-center py-2.5 rounded-xl bg-rose-900/30 text-xs font-bold text-rose-400 hover:bg-rose-900/50 transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block text-center py-3 rounded-full bg-gold-500 text-xs font-bold text-forest-800 hover:bg-gold-400 transition-colors shadow-sm"
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
