'use client'

import React, { useState } from 'react'
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
  const [isPending, setIsPending] = useState(false)

  const isWishlisted = checkWishlist(productId)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isPending) return

    setIsPending(true)
    try {
      await toggleWishlist(productId, productName)
    } finally {
      setIsPending(false)
    }
  }

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`group/wishlist flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-forest-950/70 hover:bg-forest-950/95 backdrop-blur-md text-text-inverse border border-border-gold-subtle hover:border-border-gold active:scale-90 transition-all duration-200 cursor-pointer ${className}`}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <svg
          className={`h-4 w-4 transition-transform duration-200 group-hover/wishlist:scale-110 ${
            isWishlisted
              ? 'fill-terracotta-500 text-terracotta-500 stroke-terracotta-500'
              : 'fill-none stroke-white/90 group-hover/wishlist:stroke-white'
          }`}
          viewBox="0 0 24 24"
          strokeWidth="1.8"
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
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer ${
        isWishlisted
          ? 'border-terracotta-400 bg-terracotta-100 text-terracotta-600'
          : 'border-border-primary bg-bg-surface text-text-secondary hover:border-border-gold hover:text-text-accent hover:bg-bg-surface-elevated'
      } ${className}`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      <svg
        className={`h-5 w-5 transition-transform ${isWishlisted ? 'fill-terracotta-600 scale-110' : 'fill-none stroke-current'}`}
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
