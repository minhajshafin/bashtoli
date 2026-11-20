'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useSyncExternalStore,
} from 'react'
import {
  addToWishlistAction,
  removeFromWishlistAction,
  fetchUserWishlistAction,
  mergeGuestWishlistAction,
} from '@/lib/actions/wishlist'
import { useToast } from '@/components/ui/toast'

const GUEST_WISHLIST_KEY = 'bashtoli_guest_wishlist'
const emptySubscribe = () => () => {}

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

export interface WishlistStateContextType {
  wishlistIds: string[]
  isLoaded: boolean
  isPending: boolean
}

export interface WishlistActionsContextType {
  toggleWishlist: (productId: string, productName?: string) => Promise<boolean>
  isWishlisted: (productId: string) => boolean
  subscribe: (listener: () => void) => () => void
  isPending: boolean
}

export interface WishlistContextType {
  wishlistIds: string[]
  isLoaded: boolean
  isPending: boolean
  isWishlisted: (productId: string) => boolean
  toggleWishlist: (productId: string, productName?: string) => Promise<boolean>
}

const WishlistStateContext = createContext<WishlistStateContextType | null>(null)
const WishlistActionsContext = createContext<WishlistActionsContextType | null>(null)

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
  const wishlistIdsRef = useRef<string[]>(initialWishlistIds ?? [])
  const locallyToggledIdsRef = useRef<Set<string>>(new Set())
  const listenersRef = useRef<Set<() => void>>(new Set())
  const isLoggedInRef = useRef(isLoggedIn)
  const pendingRef = useRef(pending)
  const { toast } = useToast()

  const notifyListeners = useCallback(() => {
    listenersRef.current.forEach((fn) => fn())
  }, [])

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  useEffect(() => {
    isLoggedInRef.current = isLoggedIn
    pendingRef.current = pending
    wishlistIdsRef.current = wishlistIds
    notifyListeners()
  }, [isLoggedIn, pending, wishlistIds, notifyListeners])

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
    (productId: string) => wishlistIdsRef.current.includes(productId),
    []
  )

  const toggleWishlist = useCallback(
    async (productId: string, productName?: string): Promise<boolean> => {
      // While auth is pending (fallback skeleton), mutations are disallowed
      if (pendingRef.current) {
        return wishlistIdsRef.current.includes(productId)
      }

      // Mark this product ID as locally modified to protect it from stale in-flight initial loads
      locallyToggledIdsRef.current.add(productId)

      const alreadyWishlisted = wishlistIdsRef.current.includes(productId)
      const nextState = !alreadyWishlisted

      // Optimistic synchronous update of ref and state
      wishlistIdsRef.current = nextState
        ? Array.from(new Set([...wishlistIdsRef.current, productId]))
        : wishlistIdsRef.current.filter((id) => id !== productId)

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

      if (isLoggedInRef.current) {
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
    [toast]
  )

  const stateValue = useMemo(
    () => ({
      wishlistIds,
      isLoaded,
      isPending: pending,
    }),
    [wishlistIds, isLoaded, pending]
  )

  const actionsValue = useMemo(
    () => ({
      toggleWishlist,
      isWishlisted,
      subscribe,
      isPending: pending,
    }),
    [toggleWishlist, isWishlisted, subscribe, pending]
  )

  return (
    <WishlistStateContext.Provider value={stateValue}>
      <WishlistActionsContext.Provider value={actionsValue}>
        {children}
      </WishlistActionsContext.Provider>
    </WishlistStateContext.Provider>
  )
}

export function useWishlistState(): WishlistStateContextType {
  const ctx = useContext(WishlistStateContext)
  if (!ctx) {
    throw new Error('useWishlistState must be used within a WishlistProvider')
  }
  return ctx
}

export function useWishlistActions(): WishlistActionsContextType {
  const ctx = useContext(WishlistActionsContext)
  if (!ctx) {
    throw new Error('useWishlistActions must be used within a WishlistProvider')
  }
  return ctx
}

export function useIsProductWishlisted(productId: string): boolean {
  const actions = useContext(WishlistActionsContext)
  return useSyncExternalStore(
    actions ? actions.subscribe : emptySubscribe,
    () => (actions ? actions.isWishlisted(productId) : false),
    () => false
  )
}

export function useWishlist(): WishlistContextType {
  const state = useContext(WishlistStateContext)
  const actions = useContext(WishlistActionsContext)
  if (!state || !actions) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return useMemo(
    () => ({
      wishlistIds: state.wishlistIds,
      isLoaded: state.isLoaded,
      isPending: state.isPending,
      isWishlisted: (productId: string) => state.wishlistIds.includes(productId),
      toggleWishlist: actions.toggleWishlist,
    }),
    [state.wishlistIds, state.isLoaded, state.isPending, actions.toggleWishlist]
  )
}
