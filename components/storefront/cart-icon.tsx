'use client'

import Link from 'next/link'
import React from 'react'
import { useCart } from '@/lib/cart/cart-context'

export function CartIcon() {
  const { itemCount, isLoaded } = useCart()

  return (
    <Link
      href="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-all hover:bg-zinc-100/50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850 dark:hover:text-zinc-100"
      aria-label="View Cart"
    >
      <svg
        className="h-5 w-5 stroke-[2]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>

      {/* Cart quantity badge */}
      {isLoaded && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-fade-in dark:ring-zinc-950">
          {itemCount}
        </span>
      )}
    </Link>
  )
}
