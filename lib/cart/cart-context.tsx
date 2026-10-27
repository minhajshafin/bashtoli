'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode, useTransition } from 'react'
import {
  CartItem,
  getGuestCart,
  addToGuestCart,
  updateGuestCartQty,
  removeFromGuestCart,
  clearGuestCart,
} from './guest-cart'
import {
  fetchDbCart,
  addToDbCartAction,
  updateDbCartQtyAction,
  removeFromDbCartAction,
  clearDbCartAction,
  mergeGuestCartAction,
} from '@/lib/actions/cart'
import { useToast } from '@/components/ui/toast'

interface CartContextType {
  cart: CartItem[]
  isLoaded: boolean
  itemCount: number
  subtotal: number
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  addItem: (item: Omit<CartItem, 'qty'>, qty: number, openDrawerOnAdd?: boolean) => void
  updateQty: (variantId: string, qty: number) => void
  removeItem: (variantId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

/**
 * Global Cart Provider.
 * Integrates guest localStorage cart with server-side Supabase cart.
 * Employs optimistic UI state updates for immediate customer visual feedback.
 */
export function CartProvider({ children, isLoggedIn }: { children: ReactNode; isLoggedIn: boolean }) {
  const { toast } = useToast()
  const [state, setState] = useState<{ cart: CartItem[]; isLoaded: boolean }>({
    cart: [],
    isLoaded: false,
  })
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])
  const [, startTransition] = useTransition()

  // Refs for debouncing updateQty and tracking latest local edits
  const pendingQtyRef = useRef<Map<string, number>>(new Map())
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Clean up any pending debounce timers on unmount
  useEffect(() => {
    const timers = debounceTimersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  // Load and merge cart based on auth state
  useEffect(() => {
    async function initCart() {
      if (isLoggedIn) {
        // 1. Check if there are guest items in local storage to merge
        const guestItems = getGuestCart()
        if (guestItems.length > 0) {
          // Clear guest cart immediately before calling mergeGuestCartAction so another tab cannot double-merge
          clearGuestCart()
          try {
            const mergeRes = await mergeGuestCartAction(guestItems)
            if (!mergeRes.error) {
              if (mergeRes.notifications && mergeRes.notifications.length > 0) {
                toast(mergeRes.notifications.join(' • '), 'info')
              }
            } else {
              console.error('Guest cart merge failed:', mergeRes.error)
              // Restore guest cart items on failure so customer data is preserved
              for (const item of guestItems) {
                addToGuestCart(item, item.qty)
              }
            }
          } catch (err) {
            console.error('Guest cart merge threw exception:', err)
            for (const item of guestItems) {
              addToGuestCart(item, item.qty)
            }
          }
        }

        // 2. Load the user's database cart
        const dbCart = await fetchDbCart()
        setState({
          cart: dbCart,
          isLoaded: true,
        })
      } else {
        // Guest user: load items from guest local storage
        setState({
          cart: getGuestCart(),
          isLoaded: true,
        })
      }
    }

    initCart()
  }, [isLoggedIn, toast])

  const cart = state.cart
  const isLoaded = state.isLoaded

  // Add Item operation (optimistic local state update + persistent storage action)
  const addItem = useCallback((item: Omit<CartItem, 'qty'>, qty: number, openDrawerOnAdd: boolean = false) => {
    setState((prev) => {
      const updated = [...prev.cart]
      const existing = updated.find((i) => i.variant_id === item.variant_id)
      if (existing) {
        existing.qty += qty
      } else {
        updated.push({ ...item, qty })
      }
      return { ...prev, cart: updated }
    })

    if (openDrawerOnAdd) {
      setIsDrawerOpen(true)
    }

    if (isLoggedIn) {
      startTransition(async () => {
        const res = await addToDbCartAction(item.variant_id, qty)
        if (res.error) {
          toast(res.error, 'error')
          const latest = await fetchDbCart()
          setState((prev) => ({ ...prev, cart: latest }))
        }
      })
    } else {
      addToGuestCart(item, qty)
    }
  }, [isLoggedIn, toast])

  // Update Quantity operation (optimistic local state update + debounced persistent storage action)
  const updateQty = useCallback((variantId: string, qty: number) => {
    const finalQty = Math.max(1, qty)

    // 1. Optimistic UI update
    setState((prev) => {
      const updated = prev.cart.map((item) =>
        item.variant_id === variantId ? { ...item, qty: finalQty } : item
      )
      return { ...prev, cart: updated }
    })

    if (!isLoggedIn) {
      updateGuestCartQty(variantId, finalQty)
      return
    }

    // 2. Track latest requested absolute quantity
    pendingQtyRef.current.set(variantId, finalQty)

    // 3. Clear existing debounce timer for this variant if any
    const existingTimer = debounceTimersRef.current.get(variantId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 4. Debounce (300 ms) server syncs per variant, always sending latest absolute qty
    const timer = setTimeout(async () => {
      debounceTimersRef.current.delete(variantId)
      const targetQty = pendingQtyRef.current.get(variantId) ?? finalQty

      const res = await updateDbCartQtyAction(variantId, targetQty)
      if (res.error) {
        toast(res.error, 'error')
        // On error, re-fetch once without clobbering newer local edits
        const latest = await fetchDbCart()
        setState((prev) => {
          const merged = latest.map((item) => {
            const pending = pendingQtyRef.current.get(item.variant_id)
            if (pending !== undefined) {
              return { ...item, qty: pending }
            }
            return item
          })
          return { ...prev, cart: merged }
        })
      } else {
        // Clean up pending entry if it hasn't been updated since dispatch
        if (pendingQtyRef.current.get(variantId) === targetQty) {
          pendingQtyRef.current.delete(variantId)
        }
      }
    }, 300)

    debounceTimersRef.current.set(variantId, timer)
  }, [isLoggedIn, toast])

  // Remove Item operation (optimistic local state update + persistent storage action)
  const removeItem = useCallback((variantId: string) => {
    // Cancel any pending debounce timer and delete pending qty entry before server call
    const existingTimer = debounceTimersRef.current.get(variantId)
    if (existingTimer) {
      clearTimeout(existingTimer)
      debounceTimersRef.current.delete(variantId)
    }
    pendingQtyRef.current.delete(variantId)

    setState((prev) => {
      const updated = prev.cart.filter((item) => item.variant_id !== variantId)
      return { ...prev, cart: updated }
    })

    if (isLoggedIn) {
      startTransition(async () => {
        const res = await removeFromDbCartAction(variantId)
        if (res.error) {
          toast(res.error, 'error')
          const latest = await fetchDbCart()
          setState((prev) => ({ ...prev, cart: latest }))
        }
      })
    } else {
      removeFromGuestCart(variantId)
    }
  }, [isLoggedIn, toast])

  // Clear Cart operation (optimistic local state update + persistent storage action)
  const clearCart = useCallback(() => {
    // Cancel all pending debounce timers and delete all pending qty entries before server call
    debounceTimersRef.current.forEach((timer) => clearTimeout(timer))
    debounceTimersRef.current.clear()
    pendingQtyRef.current.clear()

    setState((prev) => ({ ...prev, cart: [] }))

    if (isLoggedIn) {
      startTransition(async () => {
        const res = await clearDbCartAction()
        if (res.error) {
          toast(res.error, 'error')
          const latest = await fetchDbCart()
          setState((prev) => ({ ...prev, cart: latest }))
        }
      })
    } else {
      clearGuestCart()
    }
  }, [isLoggedIn, toast])

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  const contextValue = useMemo(() => ({
    cart,
    isLoaded,
    itemCount,
    subtotal,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    addItem,
    updateQty,
    removeItem,
    clearCart,
  }), [cart, isLoaded, itemCount, subtotal, isDrawerOpen, openDrawer, closeDrawer, addItem, updateQty, removeItem, clearCart])

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
