'use client'

import React, { useState } from 'react'

interface AddToCartButtonProps {
  variantId?: string
  stockQty?: number // undefined means no variant selected yet
  onAddToCart: (qty: number) => void
  onBuyNow?: (qty: number) => void
}

export function AddToCartButton({
  variantId: _variantId,
  stockQty,
  onAddToCart,
  onBuyNow,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)

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
      <div className="flex items-center gap-4">
        <div className="flex items-center h-12 rounded-full border border-forest-200 bg-cream-50 px-1 shadow-xs">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isButtonDisabled || quantity <= 1}
            className="flex w-10 h-full items-center justify-center text-forest-600 hover:text-forest-900 disabled:opacity-30 cursor-pointer"
            aria-label="Decrease quantity"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>
          
          <span className="w-10 text-center text-sm font-bold text-forest-900 select-none font-mono">
            {isOutOfStock ? 0 : quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={isButtonDisabled || (stockQty !== undefined && quantity >= stockQty)}
            className="flex w-10 h-full items-center justify-center text-forest-600 hover:text-forest-900 disabled:opacity-30 cursor-pointer"
            aria-label="Increase quantity"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Stock status indicator */}
        {!isNoVariantSelected && (
          <div className="text-xs font-semibold">
            {isOutOfStock ? (
              <span className="text-rose-600 uppercase tracking-wider">Out of Stock</span>
            ) : stockQty !== undefined && stockQty <= 3 ? (
              <span className="text-gold-600 font-bold">Only {stockQty} left in stock!</span>
            ) : (
              <span className="text-forest-600">In Stock ({stockQty} available)</span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons: Add to Bag & Buy Now */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {/* Add to Bag Button */}
        <button
          type="button"
          disabled={isButtonDisabled}
          onClick={() => onAddToCart(quantity)}
          className={`h-12 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
            isButtonDisabled
              ? 'bg-cream-200 border border-forest-200 text-forest-400 cursor-not-allowed'
              : 'bg-forest-800 text-cream-100 border border-forest-700 shadow-sm hover:bg-forest-700 active:scale-[0.98]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
          </svg>
          <span>{isNoVariantSelected ? 'Select Options' : isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
        </button>

        {/* Buy Now Button */}
        {onBuyNow && (
          <button
            type="button"
            disabled={isButtonDisabled}
            onClick={() => onBuyNow(quantity)}
            className={`h-12 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              isButtonDisabled
                ? 'bg-cream-200 border border-forest-200 text-forest-400 cursor-not-allowed opacity-60'
                : 'bg-gold-500 text-forest-900 shadow-md shadow-gold-500/20 hover:bg-gold-400 active:scale-[0.98]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{isNoVariantSelected ? 'Select Options' : isOutOfStock ? 'Out of Stock' : 'Buy Now'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
