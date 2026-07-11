'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart/cart-context'
import { CartItemRow } from '@/components/storefront/cart-item'
import { CartSummary } from '@/components/storefront/cart-summary'
import { checkCartItemsAvailability } from '@/lib/actions/cart'
import type { ValidatedCartItem } from '@/lib/queries/cart'

export default function CartPage() {
  const { cart, isLoaded, updateQty, removeItem, clearCart } = useCart()
  const [dbStatuses, setDbStatuses] = useState<Record<string, ValidatedCartItem>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Validate cart items against the database on mount or when cart keys change
  useEffect(() => {
    if (!isLoaded || cart.length === 0) return

    async function validateItems() {
      setIsValidating(true)
      const variantIds = cart.map((item) => item.variant_id)
      const results = await checkCartItemsAvailability(variantIds)

      const statusMap: Record<string, ValidatedCartItem> = {}
      for (const res of results) {
        statusMap[res.variant_id] = res

        // Automatic adjustment: if current quantity exceeds database stock, cap it
        const cartItem = cart.find((i) => i.variant_id === res.variant_id)
        if (cartItem && res.active && cartItem.qty > res.stock_qty) {
          updateQty(res.variant_id, Math.max(1, res.stock_qty))
        }
      }
      setDbStatuses(statusMap)
      setIsValidating(false)
    }

    validateItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, cart.length]) // only run when the set of items changes or loaded

  if (!isLoaded) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
      </div>
    )
  }

  // Check if cart has unavailable items (either missing from DB, inactive, or parent inactive)
  const hasUnavailableItems = cart.some((item) => {
    const dbStatus = dbStatuses[item.variant_id]
    // If we validated and database status says inactive/unavailable, it's unavailable
    if (dbStatus) {
      return !dbStatus.active
    }
    return false
  })

  // Calculate dynamic subtotal using the latest database price if validated, otherwise fallback to snapshot price
  const validatedSubtotal = cart.reduce((sum, item) => {
    const dbStatus = dbStatuses[item.variant_id]
    const price = dbStatus ? dbStatus.price : item.price
    const isItemActive = dbStatus ? dbStatus.active : true

    // Only sum active/available items for the checkout subtotal
    return isItemActive ? sum + price * item.qty : sum
  }, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight dark:text-zinc-50">
          Shopping Cart
        </h1>
        {cart.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear your cart?')) {
                clearCart()
              }
            }}
            className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-rose-600 transition-colors"
          >
            Clear Cart
          </button>
        )}
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            {isValidating && Object.keys(dbStatuses).length === 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 animate-pulse">
                Validating inventory and prices...
              </div>
            )}

            {cart.map((item) => (
              <CartItemRow
                key={item.variant_id}
                item={item}
                dbStatus={dbStatuses[item.variant_id]}
                onQtyChange={(qty) => updateQty(item.variant_id, qty)}
                onRemove={() => removeItem(item.variant_id)}
              />
            ))}
          </div>

          {/* Checkout sidebar */}
          <div className="lg:col-span-1">
            <CartSummary
              subtotal={validatedSubtotal}
              hasUnavailableItems={hasUnavailableItems}
              isCartEmpty={cart.length === 0}
            />
          </div>
        </div>
      ) : (
        /* Empty Cart View */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white py-20 px-4 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
            <svg
              className="h-8 w-8 stroke-[1.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Your cart is empty
          </h2>
          <p className="mt-2 text-sm text-zinc-500 max-w-sm dark:text-zinc-400">
            Looks like you haven&apos;t added anything to your cart yet. Head back to the store to explore our beautiful handcrafted items.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-amber-600 px-6 text-sm font-bold text-white shadow-md shadow-amber-600/10 hover:bg-amber-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  )
}
