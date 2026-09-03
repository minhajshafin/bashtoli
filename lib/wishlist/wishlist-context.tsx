'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  addToWishlistAction,
  removeFromWishlistAction,
  fetchUserWishlistAction,
  mergeGuestWishlistAction,
} from '@/lib/actions/wishlist'
import { useToast } from '@/components/ui/toast'

const GUEST_WISHLIST_KEY = 'bashtoli_guest_wishlist'

function getGuestWishlist(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const val = localStorage.getItem(GUEST_WISHLIST_KEY)
    return val ? JSON.parse(val) : []
  } catch {
    return []
  }
}

function saveGuestWishlist(ids: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids))
  } catch {}
}

interface WishlistContextType {
  wishlistIds: string[]
  isWishlisted: (productId: string) => boolean
  toggleWishlist: (productId: string, productName?: string) => Promise<boolean>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({
  children,
  isLoggedIn,
}: {
  children: React.ReactNode
  isLoggedIn: boolean
}) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    async function initWishlist() {
      if (isLoggedIn) {
        // 1. Merge guest items from localStorage if any
        const guestIds = getGuestWishlist()
        if (guestIds.length > 0) {
          const res = await mergeGuestWishlistAction(guestIds)
          if (!res.error) {
            // Only clear after successful merge to prevent data loss
            localStorage.removeItem(GUEST_WISHLIST_KEY)
          } else {
            console.error('Guest wishlist merge failed:', res.error)
          }
        }
        // 2. Fetch authenticated user's wishlist
        const dbIds = await fetchUserWishlistAction()
        setWishlistIds(dbIds)
      } else {
        setWishlistIds(getGuestWishlist())
      }
    }
    initWishlist()
  }, [isLoggedIn])

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  )

  const toggleWishlist = useCallback(
    async (productId: string, productName?: string): Promise<boolean> => {
      const alreadyWishlisted = wishlistIds.includes(productId)
      const nextState = !alreadyWishlisted

      // Optimistic state update
      setWishlistIds((prev) =>
        nextState ? [...prev, productId] : prev.filter((id) => id !== productId)
      )

      if (nextState) {
        toast(
          productName ? `Added "${productName}" to your wishlist!` : 'Added to your wishlist!',
          'success'
        )
      } else {
        toast(
          productName ? `Removed "${productName}" from your wishlist` : 'Removed from your wishlist',
          'info'
        )
      }

      if (isLoggedIn) {
        const action = nextState ? addToWishlistAction : removeFromWishlistAction
        const res = await action(productId)
        if (res.error) {
          // Rollback on error
          setWishlistIds((prev) =>
            alreadyWishlisted ? [...prev, productId] : prev.filter((id) => id !== productId)
          )
          toast(res.error, 'error')
          return alreadyWishlisted
        }
      } else {
        const currentGuest = getGuestWishlist()
        const updated = nextState
          ? [...currentGuest.filter((id) => id !== productId), productId]
          : currentGuest.filter((id) => id !== productId)
        saveGuestWishlist(updated)
      }

      return nextState
    },
    [wishlistIds, isLoggedIn, toast]
  )

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return ctx
}
