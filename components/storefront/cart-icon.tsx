'use client'

import Link from 'next/link'
import React from 'react'
import { useCart } from '@/lib/cart/cart-context'

export function CartIcon() {
  const { itemCount, isLoaded } = useCart()

  return (
    <Link
      href="/bag"
      className="relative flex items-center justify-center w-10 h-10 text-gold-400 hover:text-gold-500 transition-colors rounded-full"
      aria-label="View Shopping Bag"
    >
      <svg
        className="h-5 w-5"
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
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-forest-800 shadow-sm animate-fade-in"
          style={{ backgroundColor: '#c9a96e' }}
        >
          {itemCount}
        </span>
      )}
    </Link>
  )
}
