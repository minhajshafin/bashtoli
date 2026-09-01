'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CartIcon } from '@/components/storefront/cart-icon'
import { MobileNav } from '@/components/storefront/mobile-nav'
import { logoutAction } from '@/lib/actions/auth'

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
  const [searchQuery, setSearchQuery] = useState('')
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

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

  const isHome = pathname === '/'
  const isShop = pathname.startsWith('/products')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header
      className="sticky top-0 z-50 w-full bg-forest-800 transition-shadow duration-300"
      style={{ boxShadow: scrolled ? '0 2px 32px rgba(8,15,10,0.35)' : 'none' }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">

        {/* Left: nav links */}
        <div className="hidden md:flex items-center gap-7 shrink-0">
          {([
            { label: 'Home', href: '/', active: isHome },
            { label: 'Shop', href: '/products', active: isShop },
          ] as { label: string; href: string; active: boolean }[]).map(({ label, href, active }) => (
            <Link
              key={label}
              href={href}
              className="text-sm transition-all duration-200"
              style={{
                color: active ? '#1a3326' : '#e2c99a',
                backgroundColor: active ? '#c9a96e' : 'transparent',
                borderRadius: '100px',
                padding: active ? '4px 14px' : '4px 0',
                fontWeight: active ? 600 : 400,
                letterSpacing: '0.04em',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Center: search */}
        <form onSubmit={handleSearch} className="flex-1 hidden md:flex items-center justify-center">
          <div className="relative w-full max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gold-400"
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
              placeholder="Search products\u2026"
              className="w-full pl-9 pr-4 py-2 text-sm outline-none rounded-full bg-forest-700 text-forest-300 placeholder:text-forest-500 border border-forest-600 focus:border-gold-500 transition-colors"
            />
          </div>
        </form>

        {/* Right: icons */}
        <div className="flex items-center gap-1 ml-auto md:ml-0">

          {/* Admin shortcut */}
          {isStaffOrAdmin && (
            <Link
              href="/admin"
              className="hidden sm:flex rounded-full bg-forest-700 border border-forest-600 px-3 py-1.5 text-xs font-bold tracking-wide text-gold-400 hover:bg-gold-500 hover:text-forest-800 hover:border-gold-500 transition-all"
            >
              Admin
            </Link>
          )}

          {/* Account icon with dropdown */}
          <div ref={accountRef} className="relative">
            <button
              onClick={() => setAccountOpen((o) => !o)}
              aria-label="Account"
              className="flex items-center justify-center w-10 h-10 text-gold-400 hover:text-gold-500 transition-colors rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </button>

            {accountOpen && (
              <div className="absolute top-[calc(100%+8px)] right-0 bg-forest-800 border border-forest-700 rounded-2xl p-1.5 shadow-2xl min-w-[160px] z-50">
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-2.5 border-b border-forest-700 mb-1">
                      <p className="text-[10px] text-forest-400 font-bold uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-semibold text-cream-100 truncate mt-0.5">{fullName || 'Customer'}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-forest-300 hover:bg-forest-700 hover:text-gold-400 rounded-xl transition-all"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                      My Account
                    </Link>
                    <form action={logoutAction}>
                      <button type="submit" className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-forest-300 hover:bg-forest-700 hover:text-gold-400 rounded-xl transition-all">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" /></svg>
                        Logout
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-forest-300 hover:bg-forest-700 hover:text-gold-400 rounded-xl transition-all"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-forest-300 hover:bg-forest-700 hover:text-gold-400 rounded-xl transition-all"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Wishlist icon */}
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className="flex items-center justify-center w-10 h-10 text-gold-400 hover:text-gold-500 transition-colors rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </Link>

          {/* Cart */}
          <CartIcon />

          {/* Divider */}
          <div className="w-px h-5 mx-1 bg-forest-700 hidden md:block" aria-hidden="true" />

          {/* Mobile hamburger */}
          <MobileNav isLoggedIn={isLoggedIn} fullName={fullName} />
        </div>
      </div>
    </header>
  )
}
