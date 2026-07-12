'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useTransition } from 'react'
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

interface CartContextType {
  cart: CartItem[]
  isLoaded: boolean
  itemCount: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'qty'>, qty: number) => void
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
  const [state, setState] = useState<{ cart: CartItem[]; isLoaded: boolean }>({
    cart: [],
    isLoaded: false,
  })
  const [, startTransition] = useTransition()

  // Load and merge cart based on auth state
  useEffect(() => {
    async function initCart() {
      if (isLoggedIn) {
        // 1. Check if there are guest items in local storage to merge
        const guestItems = getGuestCart()
        if (guestItems.length > 0) {
          const mergeRes = await mergeGuestCartAction(guestItems)
          if (mergeRes.notifications && mergeRes.notifications.length > 0) {
            alert(mergeRes.notifications.join('\n'))
          }
          // Clear guest cart from local storage so we do not merge it multiple times
          clearGuestCart()
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
  }, [isLoggedIn])

  const cart = state.cart
  const isLoaded = state.isLoaded

  // Add Item operation (optimistic local state update + persistent storage action)
  const addItem = (item: Omit<CartItem, 'qty'>, qty: number) => {
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

    if (isLoggedIn) {
      startTransition(async () => {
        const res = await addToDbCartAction(item.variant_id, qty)
        if (res.error) {
          alert(res.error)
          const latest = await fetchDbCart()
          setState((prev) => ({ ...prev, cart: latest }))
        }
      })
    } else {
      addToGuestCart(item, qty)
    }
  }

  // Update Quantity operation (optimistic local state update + persistent storage action)
  const updateQty = (variantId: string, qty: number) => {
    const finalQty = Math.max(1, qty)

    setState((prev) => {
      const updated = prev.cart.map((item) =>
        item.variant_id === variantId ? { ...item, qty: finalQty } : item
      )
      return { ...prev, cart: updated }
    })

    if (isLoggedIn) {
      startTransition(async () => {
        const res = await updateDbCartQtyAction(variantId, finalQty)
        if (res.error) {
          alert(res.error)
          const latest = await fetchDbCart()
          setState((prev) => ({ ...prev, cart: latest }))
        }
      })
    } else {
      updateGuestCartQty(variantId, finalQty)
    }
  }

  // Remove Item operation (optimistic local state update + persistent storage action)
  const removeItem = (variantId: string) => {
    setState((prev) => {
      const updated = prev.cart.filter((item) => item.variant_id !== variantId)
      return { ...prev, cart: updated }
    })

    if (isLoggedIn) {
      startTransition(async () => {
        const res = await removeFromDbCartAction(variantId)
        if (res.error) {
          alert(res.error)
          const latest = await fetchDbCart()
          setState((prev) => ({ ...prev, cart: latest }))
        }
      })
    } else {
      removeFromGuestCart(variantId)
    }
  }

  // Clear Cart operation (optimistic local state update + persistent storage action)
  const clearCart = () => {
    setState((prev) => ({ ...prev, cart: [] }))

    if (isLoggedIn) {
      startTransition(async () => {
        const res = await clearDbCartAction()
        if (res.error) {
          alert(res.error)
          const latest = await fetchDbCart()
          setState((prev) => ({ ...prev, cart: latest }))
        }
      })
    } else {
      clearGuestCart()
    }
  }

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoaded,
        itemCount,
        subtotal,
        addItem,
        updateQty,
        removeItem,
        clearCart,
      }}
    >
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
