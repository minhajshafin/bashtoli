'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { CartIcon } from '@/components/storefront/cart-icon'
import { MobileNav } from '@/components/storefront/mobile-nav'
import { logoutAction } from '@/lib/actions/auth'
import { useWishlist } from '@/lib/wishlist/wishlist-context'

interface NavHeaderProps {
  isLoggedIn: boolean
  fullName: string | null
  isStaffOrAdmin: boolean
}

export function NavHeader({ isLoggedIn, fullName, isStaffOrAdmin }: NavHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const accountRef = useRef<HTMLDivElement>(null)
  const wishlistContext = useWishlist()
  const wishlistCount = wishlistContext?.wishlistIds?.length ?? 0

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!accountOpen) return
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [accountOpen])

  const isShop = pathname.startsWith('/products')

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setMobileSearchOpen(false)
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-forest-950/98 backdrop-blur-md shadow-[0_8px_32px_rgba(10,22,15,0.4)] border-b border-forest-800/80'
          : 'bg-forest-950 border-b border-forest-800/70'
      }`}
    >
      <div className="mx-auto flex h-18 sm:h-20 max-w-[1440px] xl:max-w-[1520px] items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 lg:px-8 xl:px-10">

        {/* Mobile: Hamburger Toggle + Prominent Brand Logo */}
        <div className="md:hidden flex items-center gap-2.5 sm:gap-3">
          <MobileNav isLoggedIn={isLoggedIn} fullName={fullName} />
          <Link
            href="/"
            className="relative block h-9 sm:h-10 w-24 sm:w-28 shrink-0 active:scale-98 transition-transform"
            aria-label="Bashtoli Home"
          >
            <Image
              src="/logo-text.svg"
              alt="Bashtoli Stationery"
              fill
              priority
              className="object-contain object-left"
            />
          </Link>
        </div>

        {/* Desktop Left: Prominent Brand Logo + Primary Nav Links */}
        <div className="hidden md:flex items-center gap-5 lg:gap-6 shrink-0">
          <Link
            href="/"
            className="relative block h-11 lg:h-12 w-28 lg:w-32 shrink-0 hover:opacity-90 active:scale-98 transition-all"
            aria-label="Bashtoli Home"
          >
            <Image
              src="/logo-text.svg"
              alt="Bashtoli Stationery"
              fill
              priority
              className="object-contain object-left"
            />
          </Link>

          {/* Hairline Divider */}
          <div className="h-4 w-px bg-forest-700/60" aria-hidden="true" />

          {/* Navigation links (Shop & Track Order — tight, balanced atelier rhythm) */}
          <nav className="flex items-center gap-5 lg:gap-6" aria-label="Primary Navigation">
            <Link
              href="/products"
              className={`text-xs uppercase tracking-widest font-semibold transition-colors ${
                isShop ? 'text-gold-400 font-bold' : 'text-cream-100/80 hover:text-gold-300'
              }`}
            >
              Shop
            </Link>

            <Link
              href="/order/lookup"
              className="text-xs uppercase tracking-widest font-semibold text-cream-100/80 hover:text-gold-300 transition-colors"
            >
              Track Order
            </Link>
          </nav>
        </div>

        {/* Desktop Center: Refined Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 hidden md:flex items-center justify-center max-w-md mx-auto">
          <div className="relative w-full">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gold-400/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search journals, pens, paper..."
              className="w-full pl-10.5 pr-14 py-2.5 text-xs rounded-full bg-forest-800/80 text-cream-100 placeholder:text-forest-400 border border-forest-700/80 focus:border-gold-500/80 focus:outline-none focus:ring-1 focus:ring-gold-500/25 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-forest-400 hover:text-gold-400 transition-colors cursor-pointer select-none"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Right Action Icons (Balanced Spacing) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Admin shortcut badge (Staff only) */}
          {isStaffOrAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-forest-800/90 border border-forest-700/90 px-3.5 py-1.5 text-[11px] font-bold tracking-wider uppercase text-gold-400 hover:bg-gold-500 hover:text-forest-950 hover:border-gold-500 transition-all"
            >
              <span>Admin</span>
            </Link>
          )}

          {/* Mobile search toggle button */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((o) => !o)}
            aria-label="Search"
            className="md:hidden flex items-center justify-center w-10 h-10 text-gold-400 hover:text-gold-300 transition-colors rounded-full cursor-pointer hover:bg-forest-800/50"
          >
            {mobileSearchOpen ? (
              <svg className="w-5 h-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            )}
          </button>

          {/* Desktop Wishlist Icon */}
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className="relative hidden md:flex items-center justify-center w-10 h-10 text-gold-400 hover:text-gold-300 hover:bg-forest-800/50 transition-colors rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-forest-950 font-price shadow-sm">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Desktop Account Icon with Dropdown */}
          <div ref={accountRef} className="relative hidden md:block">
            <button
              onClick={() => setAccountOpen((o) => !o)}
              aria-label="Account"
              className="flex items-center justify-center w-10 h-10 text-gold-400 hover:text-gold-300 hover:bg-forest-800/50 transition-colors rounded-full cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </button>

            {accountOpen && (
              <div className="absolute top-[calc(100%+10px)] right-0 bg-forest-900 border border-forest-700/80 rounded-2xl p-1.5 shadow-2xl min-w-44 z-50 animate-fade-in">
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-2.5 border-b border-forest-800 mb-1">
                      <p className="text-[10px] text-forest-400 font-bold uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-semibold text-cream-100 truncate mt-0.5">{fullName || 'Customer'}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-forest-300 hover:bg-forest-800 hover:text-gold-400 rounded-xl transition-all"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                      My Account
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-forest-300 hover:bg-forest-800 hover:text-gold-400 rounded-xl transition-all"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
                      Order History
                    </Link>
                    <form action={logoutAction}>
                      <button type="submit" className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-forest-300 hover:bg-forest-800 hover:text-terracotta-400 rounded-xl transition-all cursor-pointer">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" /></svg>
                        Sign Out
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-forest-300 hover:bg-forest-800 hover:text-gold-400 rounded-xl transition-all"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-forest-300 hover:bg-forest-800 hover:text-gold-400 rounded-xl transition-all"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Shopping Bag Icon (Triggers Slide-Over Drawer) */}
          <CartIcon />
        </div>
      </div>

      {/* Mobile Expandable Search Dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-forest-800 bg-forest-950/95 px-4 py-3 animate-fade-in shadow-xl backdrop-blur-md">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gold-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-14 py-2 text-sm rounded-full bg-forest-800 text-cream-100 placeholder:text-forest-400 border border-forest-700 focus:border-gold-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-forest-400 hover:text-gold-400 transition-colors cursor-pointer select-none"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="px-2.5 py-2 text-xs font-semibold text-forest-300 hover:text-gold-400 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </header>
  )
}
