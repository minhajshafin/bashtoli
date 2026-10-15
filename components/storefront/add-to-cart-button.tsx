'use client'

import React, { useState } from 'react'

interface AddToCartButtonProps {
  variantId?: string
  stockQty?: number // undefined means no variant selected yet
  onAddToCart: (qty: number) => void
  onBuyNow?: (qty: number) => void
}

export function AddToCartButton({
  stockQty,
  onAddToCart,
  onBuyNow,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isJustAdded, setIsJustAdded] = useState(false)

  const handleAdd = () => {
    onAddToCart(quantity)
    setIsJustAdded(true)
    setTimeout(() => setIsJustAdded(false), 1400)
  }

  // Determine button state
  const isNoVariantSelected = stockQty === undefined
  const isOutOfStock = stockQty !== undefined && stockQty <= 0
  const isButtonDisabled = isNoVariantSelected || isOutOfStock

  const handleIncrement = () => {
    if (stockQty !== undefined && quantity < stockQty) {
      setQuantity((prev) => prev + 1)
    }
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Quantity Picker & Stock Status */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center h-10 sm:h-11 rounded-xl border border-forest-200/80 bg-cream-50/80 px-1 shadow-2xs">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isButtonDisabled || quantity <= 1}
            className="flex w-8 sm:w-9 h-full items-center justify-center rounded-lg text-forest-700 hover:text-forest-950 hover:bg-cream-200/80 active:scale-95 disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer transition-all"
            aria-label="Decrease quantity"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>

          <span className="w-8 sm:w-9 text-center text-xs sm:text-sm font-semibold text-forest-950 select-none font-price">
            {isOutOfStock ? 0 : quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={isButtonDisabled || (stockQty !== undefined && quantity >= stockQty)}
            className="flex w-8 sm:w-9 h-full items-center justify-center rounded-lg text-forest-700 hover:text-forest-950 hover:bg-cream-200/80 active:scale-95 disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer transition-all"
            aria-label="Increase quantity"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Stock status badge */}
        {!isNoVariantSelected && (
          <div>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans font-medium bg-btn-danger-bg/10 text-btn-danger-bg border border-btn-danger-border/30">
                <span className="h-1.5 w-1.5 rounded-full bg-btn-danger-bg" />
                Sold Out
              </span>
            ) : stockQty !== undefined && stockQty <= 3 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans font-medium bg-btn-warning-bg/10 text-btn-warning-border border border-btn-warning-border/30">
                <span className="h-1.5 w-1.5 rounded-full bg-btn-warning-border animate-pulse" />
                Only {stockQty} left in stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans font-medium bg-forest-600/10 text-forest-800 border border-forest-600/25">
                <span className="h-1.5 w-1.5 rounded-full bg-forest-600" />
                In Stock ({stockQty} available)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons: Add to Bag & Buy Now */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
        {/* Add to Bag Button */}
        <button
          type="button"
          disabled={isButtonDisabled}
          onClick={handleAdd}
          className={`h-11 sm:h-12 rounded-xl text-xs font-sans font-medium tracking-[0.14em] uppercase flex items-center justify-center gap-2 ${
            isButtonDisabled
              ? 'bg-cream-200/60 border border-forest-200/60 text-forest-400 cursor-not-allowed opacity-60'
              : isJustAdded
              ? 'bg-forest-800 text-gold-300 border border-forest-700 shadow-xs'
              : 'btn-primary'
          }`}
        >
          {isJustAdded ? (
            <span className="flex items-center gap-1.5 font-semibold text-gold-300">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Added to Bag ✓
            </span>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              </svg>
              <span>{isNoVariantSelected ? 'Select Options' : isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
            </>
          )}
        </button>

        {/* Buy Now Button */}
        {onBuyNow && (
          <button
            type="button"
            disabled={isButtonDisabled}
            onClick={() => onBuyNow(quantity)}
            className={`h-11 sm:h-12 rounded-xl text-xs font-sans font-semibold tracking-[0.14em] uppercase flex items-center justify-center gap-2 ${
              isButtonDisabled
                ? 'bg-cream-200/60 border border-forest-200/60 text-forest-400 cursor-not-allowed opacity-60'
                : 'btn-accent'
            }`}
          >
            <svg className="w-3.5 h-3.5 text-forest-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{isNoVariantSelected ? 'Select Options' : isOutOfStock ? 'Sold Out' : 'Buy Now'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
