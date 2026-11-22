'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart/cart-context'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { CartItemRow } from '@/components/storefront/cart-item'
import { CartSummary } from '@/components/storefront/cart-summary'
import { CheckoutSteps } from '@/components/storefront/checkout-steps'
import { checkCartItemsAvailability, type ValidatedCartItem } from '@/lib/queries/cart'
import { runWhenIdle } from '@/lib/utils/run-when-idle'

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

  // Validate cart items against the database deferred to idle so initial render/hydration remains instantaneous
  useEffect(() => {
    if (!isLoaded || cart.length === 0) return

    let cancelled = false
    async function validateItems() {
      setIsValidating(true)
      const variantIds = cart.map((item) => item.variant_id)
      const results = await checkCartItemsAvailability(variantIds)

      if (cancelled) return

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

    const cancelIdle = runWhenIdle(validateItems, 2500)
    return () => {
      cancelled = true
      cancelIdle()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, cartKey])

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

  const totalQuantity = cart.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div className="min-h-screen bg-cream-50 bg-laid-paper text-forest-950 py-5 sm:py-8 lg:py-10 pb-36 sm:pb-16 selection:bg-gold-500/20 selection:text-forest-900">
      <div className="mx-auto max-w-[1440px] xl:max-w-[1520px] px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col justify-start">
        {/* Top Utility Navigation Row */}
        <div className="flex items-center justify-between pb-3 mb-4 sm:mb-5 border-b border-forest-900/10">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-forest-700 hover:text-forest-950 transition-colors duration-fast cursor-pointer group"
          >
            <svg className="h-3.5 w-3.5 text-gold-700 transition-transform duration-fast group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span>Continue Shopping</span>
          </Link>

          {isLoaded && cart.length > 0 && (
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
              className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-forest-600 hover:text-btn-danger-bg transition-colors duration-fast cursor-pointer group"
            >
              <svg className="h-3.5 w-3.5 text-forest-500 group-hover:text-btn-danger-bg transition-colors duration-fast" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              <span>Clear Bag</span>
            </button>
          )}
        </div>

        {/* Masthead Title & Progress Section (Always rendered immediately to ensure stable shell and immediate LCP) */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6 pb-5 border-b border-forest-900/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-px w-5 bg-gold-700/60" />
              <span className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-700">
                Order Review · Dhaka Shop
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-forest-950 font-display tracking-tight">
                Shopping Bag
              </h1>
              {isLoaded && cart.length > 0 && (
                <span className="rounded-pill bg-gold-400/20 border border-gold-600/30 px-2.5 py-0.5 text-xs font-bold text-gold-800 font-price">
                  {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-[13px] text-forest-600 font-sans mt-1.5 max-w-md leading-relaxed">
              Review your chosen stationery pieces and desk essentials before checkout.
            </p>
          </div>

          {/* 3-Step Segmented Progress Track */}
          <div className="w-full md:w-auto md:min-w-[280px] lg:min-w-[340px]">
            <CheckoutSteps currentStep={1} variant="light" />
          </div>
        </div>

        {!isLoaded ? (
          /* Neutral Skeleton with the same dimensions as the items layout */
          <div
            key="bag-skeleton"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start"
            aria-busy="true"
            aria-label="Loading shopping bag"
          >
            {/* Bag items list skeleton */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-3.5">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-md border border-forest-900/10 bg-white p-4 sm:p-5 flex gap-4 items-center shadow-elevation-1"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md bg-cream-200/80 skeleton-shimmer shrink-0" />
                  <div className="flex-1 space-y-2.5 py-1">
                    <div className="h-4 w-3/5 rounded-md bg-cream-200/80 skeleton-shimmer" />
                    <div className="h-3.5 w-24 rounded-md bg-cream-200/60 skeleton-shimmer" />
                    <div className="h-5 w-20 rounded-md bg-cream-200/80 skeleton-shimmer mt-2" />
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary skeleton */}
            <div className="lg:col-span-1 p-5 sm:p-6 rounded-md bg-white border border-forest-900/10 shadow-elevation-1 space-y-4">
              <div className="h-4 w-32 rounded-md bg-cream-200/80 skeleton-shimmer" />
              <div className="h-10 w-full rounded-md bg-cream-200/60 skeleton-shimmer" />
              <div className="space-y-2 py-2">
                <div className="flex justify-between">
                  <div className="h-4 w-20 rounded-md bg-cream-200/60 skeleton-shimmer" />
                  <div className="h-4 w-16 rounded-md bg-cream-200/60 skeleton-shimmer" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 rounded-md bg-cream-200/60 skeleton-shimmer" />
                  <div className="h-4 w-16 rounded-md bg-cream-200/60 skeleton-shimmer" />
                </div>
              </div>
              <div className="h-12 w-full rounded-md bg-cream-200/80 skeleton-shimmer" />
            </div>
          </div>
        ) : cart.length > 0 ? (
          <div
            key="bag-items"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start"
          >
            {/* Bag items list */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-3.5">
              {isValidating && Object.keys(dbStatuses).length === 0 && (
                <div className="rounded-md border border-gold-400/40 bg-gold-400/10 p-4 text-xs font-sans text-gold-800 animate-pulse">
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
          /* Empty Bag View (rendered only once cart is confirmed empty) */
          <div
            key="bag-empty"
            className="rounded-md border border-forest-900/10 bg-white p-8 sm:p-12 text-center max-w-xl mx-auto shadow-elevation-1 text-forest-950 mb-6"
          >
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-md bg-cream-100 border border-forest-900/10 text-forest-800 shadow-2xs mb-2">
              <svg
                className="h-7 w-7 stroke-[1.5] text-forest-700"
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
            <h2 className="mt-3 text-2xl sm:text-3xl font-medium text-forest-950 font-display">
              Your shopping bag is empty
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-forest-600 max-w-md mx-auto leading-relaxed font-sans">
              You haven&apos;t added any stationery or desk goods yet. Explore our curated catalogue to find fountain pens, journals, and bamboo desk accessories.
            </p>

            {/* Category Exploration Pills */}
            <div className="mt-6 pt-5 border-t border-forest-900/10 flex flex-wrap justify-center gap-2">
              <Link
                href="/products?category=notebooks-and-journals"
                className="rounded-pill border border-forest-900/15 bg-cream-50 hover:border-gold-600 px-3.5 py-2 text-xs font-medium text-forest-800 hover:text-forest-950 transition-colors duration-fast active:scale-95 cursor-pointer shadow-2xs"
              >
                Notebooks &amp; Journals
              </Link>
              <Link
                href="/products?category=study-and-exam-essentials"
                className="rounded-pill border border-forest-900/15 bg-cream-50 hover:border-gold-600 px-3.5 py-2 text-xs font-medium text-forest-800 hover:text-forest-950 transition-colors duration-fast active:scale-95 cursor-pointer shadow-2xs"
              >
                Writing Tools
              </Link>
              <Link
                href="/products?category=gift-and-craft"
                className="rounded-pill border border-forest-900/15 bg-cream-50 hover:border-gold-600 px-3.5 py-2 text-xs font-medium text-forest-800 hover:text-forest-950 transition-colors duration-fast active:scale-95 cursor-pointer shadow-2xs"
              >
                Paper &amp; Craft Studio
              </Link>
            </div>

            <div className="mt-6">
              <Link
                href="/products"
                className="btn-accent rounded-md inline-flex min-h-[48px] items-center justify-center px-8 text-xs font-sans font-bold uppercase tracking-[0.14em] cursor-pointer active:scale-95 shadow-elevation-1 transition-transform duration-fast"
              >
                Explore Catalogue &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
