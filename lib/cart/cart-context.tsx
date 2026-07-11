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
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage only after component mounts (browser context)
  useEffect(() => {
    setCart(getGuestCart())
    setIsLoaded(true)
  }, [])

  const addItem = (item: Omit<CartItem, 'qty'>, qty: number) => {
    const updated = addToGuestCart(item, qty)
    setCart(updated)
  }

  const updateQty = (variantId: string, qty: number) => {
    const updated = updateGuestCartQty(variantId, qty)
    setCart(updated)
  }

  const removeItem = (variantId: string) => {
    const updated = removeFromGuestCart(variantId)
    setCart(updated)
  }

  const clearCart = () => {
    clearGuestCart()
    setCart([])
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
