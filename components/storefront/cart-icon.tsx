'use client'

import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart/cart-context'

export function CartIcon() {
  const { itemCount, isLoaded, openDrawer } = useCart()
  const pathname = usePathname()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If not already on checkout or bag page, smoothly open drawer instead of page navigation
    if (pathname !== '/checkout' && pathname !== '/bag') {
      e.preventDefault()
      openDrawer()
    }
  }

  return (
    <Link
      href="/bag"
      onClick={handleClick}
      className="relative flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 text-gold-400 hover:text-gold-300 hover:bg-forest-800/60 transition-all duration-200 rounded-full active:scale-95 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-500"
      aria-label="View Shopping Bag"
    >
      <svg
        className="h-4.5 w-4.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
        />
      </svg>

      {/* Cart quantity badge */}
      {isLoaded && itemCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full text-[9px] font-bold bg-btn-accent-bg text-btn-accent-text border border-gold-400/40 font-price shadow-xs animate-fade-in"
        >
          {itemCount}
        </span>
      )}
    </Link>
  )
}
