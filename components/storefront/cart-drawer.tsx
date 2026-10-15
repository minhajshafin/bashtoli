'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cart/cart-context'
import { ProductImageSkeleton } from '@/components/storefront/product-image-skeleton'

export function CartDrawer() {
  const {
    cart,
    isLoaded,
    itemCount,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    updateQty,
    removeItem,
  } = useCart()

  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!isDrawerOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen, closeDrawer])

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  if (!isDrawerOpen) return null

  // Packaging / Delivery milestone target
  const milestoneTarget = 1500
  const progressPercent = Math.min(100, Math.round((subtotal / milestoneTarget) * 100))
  const amountRemaining = Math.max(0, milestoneTarget - subtotal)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag Drawer"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Dimmed Backdrop with Gaussian Blur */}
      <div
        onClick={closeDrawer}
        aria-hidden="true"
        className="fixed inset-0 bg-forest-950/70 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
      />

      {/* Slide-out Drawer Panel */}
      <div
        ref={drawerRef}
        className="relative flex h-full w-full max-w-md flex-col bg-cream-50 text-forest-900 shadow-sm animate-slide-in-right border-l border-forest-200/80 z-10"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-forest-200/80 bg-cream-100/60 px-6 py-4.5">
          <div className="flex items-center gap-2.5">
            <h2
              className="font-display text-xl tracking-tight text-forest-950 font-medium"
            >
              Your Selection
            </h2>
            {isLoaded && itemCount > 0 && (
              <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-xs font-bold text-forest-800 font-price">
                {itemCount}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close Shopping Bag"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-btn-ghost-hover-bg hover:text-btn-ghost-hover-text transition-colors cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Milestone Indicator Banner */}
        <div className="border-b border-forest-200/70 bg-cream-100/40 px-6 py-3">
          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
            <span className="text-forest-700">
              {amountRemaining > 0 ? (
                <>Add <strong className="text-forest-950 font-price">৳{amountRemaining.toLocaleString()}</strong> for complimentary gift packaging</>
              ) : (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Complimentary artisanal packaging unlocked!
                </span>
              )}
            </span>
            <span className="font-price font-bold text-gold-600 text-[11px]">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-forest-200/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Drawer Item List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-200/80 text-forest-400 mb-4">
                <svg className="h-8 w-8 stroke-[1.3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <h3 className="font-display text-lg text-forest-900 mb-1">
                Your bag is empty
              </h3>
              <p className="text-xs text-forest-500 max-w-[24ch] mb-6 font-light leading-relaxed">
                Discover our handpicked journals, pens, and desk companions.
              </p>
              <Link
                href="/products"
                onClick={closeDrawer}
                className="btn-primary inline-flex items-center justify-center rounded-full px-6 py-2.5 text-xs font-semibold tracking-wide"
              >
                Browse Collection
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.variant_id}
                className="flex items-center gap-3.5 rounded-2xl border border-forest-200/70 bg-cream-100/40 p-3 hover:border-gold-500/40 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border border-forest-200/80 bg-cream-200">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  ) : (
                    <ProductImageSkeleton size="sm" showText={false} />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <h4 className="font-display text-sm font-medium text-forest-950 truncate leading-snug">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-forest-500 mt-0.5 truncate">
                    {item.variant_name}
                  </p>
                  <p className="font-price text-xs font-semibold text-forest-900 mt-1">
                    ৳{(item.price * item.qty).toLocaleString()}
                  </p>

                  {/* Quantity bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center rounded-lg border border-forest-200/90 bg-white h-7">
                      <button
                        type="button"
                        onClick={() => updateQty(item.variant_id, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="flex h-full w-6.5 items-center justify-center text-forest-400 hover:text-forest-900 hover:bg-cream-200/80 disabled:opacity-30 cursor-pointer active:scale-95 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                        </svg>
                      </button>

                      <span className="font-price w-6 text-center text-xs font-bold text-forest-950 select-none">
                        {item.qty}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQty(item.variant_id, item.qty + 1)}
                        className="flex h-full w-6.5 items-center justify-center text-forest-400 hover:text-forest-900 hover:bg-cream-200/80 cursor-pointer active:scale-95 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.variant_id)}
                      className="text-[11px] text-text-muted hover:text-btn-danger-bg transition-colors ml-auto p-1 cursor-pointer active:scale-90"
                      title="Remove item"
                      aria-label={`Remove ${item.name}`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {cart.length > 0 && (
          <div className="border-t border-forest-200/80 bg-cream-100/70 p-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-forest-600">
              <span>Estimated Subtotal</span>
              <span className="font-price text-base font-bold text-forest-950">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>

            <p className="text-[11px] text-forest-500 leading-tight">
              Delivery calculated at checkout · Cash on Delivery available across Bangladesh.
            </p>

            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="btn-accent flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-xs font-bold uppercase tracking-wider"
            >
              <span>Proceed to Checkout</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <div className="text-center pt-1">
              <Link
                href="/bag"
                onClick={closeDrawer}
                className="link-editorial text-xs font-medium"
              >
                View Full Shopping Bag
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
