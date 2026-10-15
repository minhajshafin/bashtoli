'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart/cart-context'
import { useWishlist } from '@/lib/wishlist/wishlist-context'

export function MobileBottomDock() {
  const pathname = usePathname()
  const { itemCount, openDrawer } = useCart()
  const wishlistContext = useWishlist()
  const wishlistCount = wishlistContext?.wishlistIds?.length ?? 0

  // Do not render bottom dock on checkout, admin, or individual product detail pages
  if (
    pathname === '/checkout' ||
    pathname?.startsWith('/checkout/') ||
    pathname?.startsWith('/admin') ||
    (pathname?.startsWith('/products/') && pathname !== '/products')
  ) {
    return null
  }

  const isHome = pathname === '/'
  const isShop = pathname.startsWith('/products')
  const isWishlist = pathname === '/account/wishlist'
  const isAccount = pathname.startsWith('/account') && !isWishlist
  const isBag = pathname === '/bag'

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-forest-950/92 backdrop-blur-md border-t border-forest-800"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-md mx-auto">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
            isHome ? 'text-text-accent font-semibold' : 'text-forest-400 hover:text-gold-300 hover:bg-forest-900/60'
          }`}
        >
          <svg className="h-5 w-5 stroke-[1.6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="text-[10px] tracking-wider uppercase">Home</span>
        </Link>

        {/* 2. Shop / Catalog */}
        <Link
          href="/products"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
            isShop ? 'text-text-accent font-semibold' : 'text-forest-400 hover:text-gold-300 hover:bg-forest-900/60'
          }`}
        >
          <svg className="h-5 w-5 stroke-[1.6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
          </svg>
          <span className="text-[10px] tracking-wider uppercase">Shop</span>
        </Link>

        {/* 3. Wishlist */}
        <Link
          href="/account/wishlist"
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
            isWishlist ? 'text-text-accent font-semibold' : 'text-forest-400 hover:text-gold-300 hover:bg-forest-900/60'
          }`}
        >
          <div className="relative">
            <svg className="h-5 w-5 stroke-[1.6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-btn-accent-bg text-btn-accent-text border border-gold-400/40 text-[9px] font-bold font-price animate-fade-in">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wider uppercase">Wishlist</span>
        </Link>

        {/* 4. Bag Drawer Trigger */}
        <button
          type="button"
          onClick={openDrawer}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
            isBag ? 'text-text-accent font-semibold' : 'text-forest-400 hover:text-gold-300 hover:bg-forest-900/60'
          }`}
          aria-label="Open Shopping Bag"
        >
          <div className="relative">
            <svg className="h-5 w-5 stroke-[1.6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-btn-accent-bg text-btn-accent-text border border-gold-400/40 text-[9px] font-bold font-price animate-fade-in">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wider uppercase">Bag</span>
        </button>

        {/* 5. Account */}
        <Link
          href="/account"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
            isAccount ? 'text-text-accent font-semibold' : 'text-forest-400 hover:text-gold-300 hover:bg-forest-900/60'
          }`}
        >
          <svg className="h-5 w-5 stroke-[1.6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span className="text-[10px] tracking-wider uppercase">Account</span>
        </Link>
      </div>
    </nav>
  )
}
