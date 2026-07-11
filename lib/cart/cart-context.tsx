'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  CartItem,
  getGuestCart,
  addToGuestCart,
  updateGuestCartQty,
  removeFromGuestCart,
  clearGuestCart,
} from './guest-cart'

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

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ cart: CartItem[]; isLoaded: boolean }>({
    cart: [],
    isLoaded: false,
  })

  // Load cart from localStorage only after component mounts (browser context)
  useEffect(() => {
    const timer = setTimeout(() => {
      setState({
        cart: getGuestCart(),
        isLoaded: true,
      })
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const cart = state.cart
  const isLoaded = state.isLoaded

  const addItem = (item: Omit<CartItem, 'qty'>, qty: number) => {
    const updated = addToGuestCart(item, qty)
    setState((prev) => ({ ...prev, cart: updated }))
  }

  const updateQty = (variantId: string, qty: number) => {
    const updated = updateGuestCartQty(variantId, qty)
    setState((prev) => ({ ...prev, cart: updated }))
  }

  const removeItem = (variantId: string) => {
    const updated = removeFromGuestCart(variantId)
    setState((prev) => ({ ...prev, cart: updated }))
  }

  const clearCart = () => {
    clearGuestCart()
    setState((prev) => ({ ...prev, cart: [] }))
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
