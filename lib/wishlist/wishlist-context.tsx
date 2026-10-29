'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
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
  isLoaded: boolean
  isPending: boolean
  isWishlisted: (productId: string) => boolean
  toggleWishlist: (productId: string, productName?: string) => Promise<boolean>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({
  children,
  isLoggedIn,
  initialWishlistIds,
  pending = false,
}: {
  children: React.ReactNode
  isLoggedIn: boolean
  initialWishlistIds?: string[]
  pending?: boolean
}) {
  const [wishlistIds, setWishlistIds] = useState<string[]>(initialWishlistIds ?? [])
  const [isLoaded, setIsLoaded] = useState(false)
  const locallyToggledIdsRef = useRef<Set<string>>(new Set())
  const { toast } = useToast()

  // Stable primitive key to prevent re-running effect on equal array re-renders
  const hasInitialIds = initialWishlistIds !== undefined
  const initialIdsKey = hasInitialIds
    ? initialWishlistIds.slice().sort().join(',')
    : '__undefined__'

  useEffect(() => {
    let mounted = true
    async function initWishlist() {
      if (isLoggedIn) {
        try {
          // 1. Merge guest items from localStorage if any
          const guestIds = getGuestWishlist()
          let syncedGuestIds: string[] = []
          if (guestIds.length > 0) {
            const res = await mergeGuestWishlistAction(guestIds)
            if (!res.error) {
              localStorage.removeItem(GUEST_WISHLIST_KEY)
              syncedGuestIds = guestIds
            }
          }

          // 2. If server already supplied initialWishlistIds, union successfully synced guest ids and skip redundant fetch
          if (hasInitialIds) {
            if (mounted) {
              if (syncedGuestIds.length > 0) {
                setWishlistIds((current) => Array.from(new Set([...current, ...syncedGuestIds])))
              }
              setIsLoaded(true)
            }
            return
          }

          // 3. Fetch authenticated user's wishlist and reconcile without clobbering local toggles
          const dbIds = await fetchUserWishlistAction()
          if (mounted) {
            setWishlistIds((current) => {
              const untouchedFromDb = dbIds.filter((id) => !locallyToggledIdsRef.current.has(id))
              const locallyModified = current.filter((id) => locallyToggledIdsRef.current.has(id))
              return Array.from(new Set([...untouchedFromDb, ...locallyModified, ...syncedGuestIds]))
            })
          }
        } catch (err) {
          console.error('Failed to load user wishlist:', err)
        } finally {
          if (mounted) {
            setIsLoaded(true)
          }
        }
      } else {
        try {
          const guest = getGuestWishlist()
          if (mounted) {
            setWishlistIds(guest)
          }
        } catch (err) {
          console.error('Failed to load guest wishlist:', err)
        } finally {
          if (mounted) {
            setIsLoaded(true)
          }
        }
      }
    }
    initWishlist()
    return () => {
      mounted = false
    }
  }, [isLoggedIn, hasInitialIds, initialIdsKey])

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  )

  const toggleWishlist = useCallback(
    async (productId: string, productName?: string): Promise<boolean> => {
      // While auth is pending (fallback skeleton), mutations are disallowed
      if (pending) {
        return wishlistIds.includes(productId)
      }

      // Mark this product ID as locally modified to protect it from stale in-flight initial loads
      locallyToggledIdsRef.current.add(productId)

      const alreadyWishlisted = wishlistIds.includes(productId)
      const nextState = !alreadyWishlisted

      // Optimistic state update: immediate synchronous state change
      setWishlistIds((prev) =>
        nextState ? Array.from(new Set([...prev, productId])) : prev.filter((id) => id !== productId)
      )

      const showSuccessToast = () => {
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
      }

      if (isLoggedIn) {
        const action = nextState ? addToWishlistAction : removeFromWishlistAction
        const res = await action(productId)
        if (res.error) {
          // Rollback on error
          setWishlistIds((prev) =>
            alreadyWishlisted ? Array.from(new Set([...prev, productId])) : prev.filter((id) => id !== productId)
          )
          locallyToggledIdsRef.current.delete(productId)
          toast(res.error, 'error')
          return alreadyWishlisted
        }
        showSuccessToast()
      } else {
        const currentGuest = getGuestWishlist()
        const updated = nextState
          ? [...currentGuest.filter((id) => id !== productId), productId]
          : currentGuest.filter((id) => id !== productId)
        saveGuestWishlist(updated)
        showSuccessToast()
      }

      return nextState
    },
    [wishlistIds, isLoggedIn, toast, pending]
  )

  return (
    <WishlistContext.Provider value={{ wishlistIds, isLoaded, isPending: pending, isWishlisted, toggleWishlist }}>
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
