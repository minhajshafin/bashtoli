'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart/cart-context'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { CartItemRow } from '@/components/storefront/cart-item'
import { CartSummary } from '@/components/storefront/cart-summary'
import { checkCartItemsAvailability } from '@/lib/actions/cart'
import type { ValidatedCartItem } from '@/lib/queries/cart'

export function BagClient() {
  const confirm = useConfirm()
  const { cart, isLoaded, updateQty, removeItem, clearCart } = useCart()
  const [dbStatuses, setDbStatuses] = useState<Record<string, ValidatedCartItem>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Stable key that changes whenever the set of variant IDs changes (not just the count).
  // Using sorted IDs ensures swapping one item for another (same length, different IDs) triggers re-validation.
  const cartKey = cart
    .map((item) => item.variant_id)
    .sort()
    .join(',')

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
  }, [isLoaded, cartKey])

  if (!isLoaded) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
      </div>
    )
  }

  // Check if cart has unavailable items (either missing from DB, inactive, or parent inactive)
  const hasUnavailableItems = cart.some((item) => {
    const dbStatus = dbStatuses[item.variant_id]
    if (dbStatus) {
      return !dbStatus.active
    }
    return false
  })

  // Calculate dynamic subtotal using latest database price if validated, fallback to snapshot price
  const validatedSubtotal = cart.reduce((sum, item) => {
    const dbStatus = dbStatuses[item.variant_id]
    const price = dbStatus ? dbStatus.price : item.price
    const isItemActive = dbStatus ? dbStatus.active : true
    return isItemActive ? sum + price * item.qty : sum
  }, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 min-h-[calc(100dvh-4rem)] flex flex-col justify-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-5 border-b border-forest-200 gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-1">
            Your Selection
          </p>
          <h1
            className="text-3xl font-normal text-forest-900 tracking-tight sm:text-4xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic' }}
          >
            Shopping Bag
          </h1>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={async () => {
              const ok = await confirm({
                title: 'Clear Shopping Bag?',
                description: 'Are you sure you want to remove all items from your bag? This action cannot be undone.',
                confirmText: 'Clear Bag',
                cancelText: 'Keep Items',
                variant: 'danger',
              })
              if (ok) {
                clearCart()
              }
            }}
            className="self-start sm:self-auto text-xs font-bold uppercase tracking-wider text-forest-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Clear Bag
          </button>
        )}
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Bag items list */}
          <div className="lg:col-span-2 space-y-4">
            {isValidating && Object.keys(dbStatuses).length === 0 && (
              <div className="rounded-2xl border border-gold-300 bg-gold-300/20 p-4 text-sm text-forest-700 animate-pulse">
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
        /* Empty Bag View */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-forest-200 bg-cream-100 py-20 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-500 mb-2">
            <svg
              className="h-8 w-8 stroke-[1.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
              />
            </svg>
          </div>
          <h2
            className="mt-4 text-xl font-normal text-forest-900"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic' }}
          >
            Your shopping bag is empty
          </h2>
          <p className="mt-2 text-sm text-forest-600 max-w-sm">
            Looks like you haven&apos;t added anything to your bag yet. Head back to the store to explore our beautiful stationery items.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gold-500 px-7 text-sm font-bold text-forest-800 hover:bg-gold-400 shadow-md shadow-gold-500/20 transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  )
}
