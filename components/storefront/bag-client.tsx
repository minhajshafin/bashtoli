'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart/cart-context'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { CartItemRow } from '@/components/storefront/cart-item'
import { CartSummary } from '@/components/storefront/cart-summary'
import { CheckoutSteps } from '@/components/storefront/checkout-steps'
import { checkCartItemsAvailability } from '@/lib/actions/cart'
import type { ValidatedCartItem } from '@/lib/queries/cart'

export function BagClient() {
  const confirm = useConfirm()
  const { cart, isLoaded, updateQty, removeItem, clearCart } = useCart()
  const [dbStatuses, setDbStatuses] = useState<Record<string, ValidatedCartItem>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Stable key that changes whenever the set of variant IDs changes (not just the count).
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

        const cartItem = cart.find((i) => i.variant_id === res.variant_id)
        if (cartItem && res.active && res.stock_qty > 0 && cartItem.qty > res.stock_qty) {
          updateQty(res.variant_id, res.stock_qty)
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
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-gold-500 border-t-transparent" />
      </div>
    )
  }

  const hasUnavailableItems =
    !isValidating &&
    Object.keys(dbStatuses).length > 0 &&
    cart.some((item) => {
      const dbStatus = dbStatuses[item.variant_id]
      if (!dbStatus) return true
      return !dbStatus.active || dbStatus.stock_qty <= 0
    })

  const validatedSubtotal = cart.reduce((sum, item) => {
    const dbStatus = dbStatuses[item.variant_id]
    const price = dbStatus ? dbStatus.price : item.price
    const isItemAvailable = dbStatus ? dbStatus.active && dbStatus.stock_qty > 0 : true
    return isItemAvailable ? sum + price * item.qty : sum
  }, 0)

  return (
    <div className="mx-auto max-w-[1440px] xl:max-w-[1520px] px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 lg:py-10 min-h-[calc(100dvh-5rem)] flex flex-col justify-start">
      {/* 3-Step Visual Progress Track */}
      <CheckoutSteps currentStep={1} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-forest-200/80 gap-3">
        <div>
          <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90 mb-1">
            Curated Selection
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-medium text-forest-950 tracking-[-0.02em] font-display">
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
            className="self-start sm:self-auto text-xs font-sans font-medium uppercase tracking-[0.14em] text-forest-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Clear Bag
          </button>
        )}
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Bag items list */}
          <div className="lg:col-span-2 space-y-3.5">
            {isValidating && Object.keys(dbStatuses).length === 0 && (
              <div className="rounded-2xl border border-gold-300 bg-gold-400/10 p-4 text-xs font-sans text-forest-700 animate-pulse">
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
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-forest-200/80 bg-cream-100/40 py-16 sm:py-20 px-4 text-center my-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-900/10 text-forest-800 mb-2">
            <svg
              className="h-7 w-7 stroke-[1.5]"
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
          <h2 className="mt-3 text-xl sm:text-2xl font-medium text-forest-950 font-display">
            Your shopping bag is empty
          </h2>
          <p className="mt-2 text-xs sm:text-[13px] text-forest-600 max-w-sm leading-relaxed font-sans">
            You haven&apos;t added any stationery or desk goods yet. Explore our curated catalogue to find fountain pens, journals, and bamboo desk accessories.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-gold-500 px-6 text-xs font-sans font-bold uppercase tracking-[0.14em] text-forest-950 hover:bg-gold-400 shadow-xs shadow-gold-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            Explore Catalogue &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}
