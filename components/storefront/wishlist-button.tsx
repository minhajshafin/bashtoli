'use client'

import React, { useTransition } from 'react'
import { useWishlist } from '@/lib/wishlist/wishlist-context'

interface WishlistButtonProps {
  productId: string
  productName?: string
  variant?: 'card' | 'detail'
  className?: string
  isLoggedIn?: boolean
  initialIsWishlisted?: boolean
}

/**
 * Wishlist Toggle Button.
 * Accessible, optimistic heart toggle with instant toast notification.
 */
export function WishlistButton({
  productId,
  productName,
  variant = 'detail',
  className = '',
}: WishlistButtonProps) {
  const { isWishlisted: checkWishlist, toggleWishlist } = useWishlist()
  const [isPending, startTransition] = useTransition()

  const isWishlisted = checkWishlist(productId)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      await toggleWishlist(productId, productName)
    })
  }

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`group/wishlist flex h-9 w-9 items-center justify-center rounded-full bg-forest-900/70 backdrop-blur-xs text-cream-100 hover:bg-forest-900 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer ${className}`}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <svg
          className={`h-4.5 w-4.5 transition-colors ${
            isWishlisted
              ? 'fill-rose-500 text-rose-500'
              : 'fill-none stroke-cream-100 group-hover/wishlist:stroke-gold-400'
          }`}
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs ${
        isWishlisted
          ? 'border-rose-300 bg-rose-50 text-rose-600 shadow-sm'
          : 'border-forest-200 bg-cream-100 text-forest-500 hover:border-gold-500 hover:text-gold-600'
      } ${className}`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      <svg
        className={`h-5 w-5 transition-transform ${isWishlisted ? 'fill-rose-600 scale-110' : 'fill-none stroke-current'}`}
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    </button>
  )
}
