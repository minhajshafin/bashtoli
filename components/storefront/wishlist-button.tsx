'use client'

import React, { useState, useTransition } from 'react'
import { addToWishlistAction, removeFromWishlistAction } from '@/lib/actions/wishlist'

interface WishlistButtonProps {
  productId: string
  isLoggedIn: boolean
  initialIsWishlisted: boolean
}

/**
 * Wishlist Toggle Button.
 * Heart button that optimistically toggles wishlist membership, visible only to logged-in users.
 */
export function WishlistButton({
  productId,
  isLoggedIn,
  initialIsWishlisted,
}: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted)
  const [isPending, startTransition] = useTransition()

  if (!isLoggedIn) return null

  const handleToggle = () => {
    const nextState = !isWishlisted
    setIsWishlisted(nextState) // optimistic UI update

    startTransition(async () => {
      const action = nextState ? addToWishlistAction : removeFromWishlistAction
      const res = await action(productId)
      if (res.error) {
        alert(res.error)
        setIsWishlisted(!nextState) // rollback
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
        isWishlisted
          ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-500 shadow-sm'
          : 'border-zinc-200 bg-white text-zinc-400 hover:border-zinc-300 hover:text-zinc-650 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-300'
      }`}
      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      <svg
        className={`h-5 w-5 ${isWishlisted ? 'fill-current' : 'fill-none stroke-current'}`}
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}
