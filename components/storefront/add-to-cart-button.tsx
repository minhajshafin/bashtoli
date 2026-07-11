'use client'

import React, { useState, useEffect } from 'react'

interface AddToCartButtonProps {
  variantId?: string
  stockQty?: number // undefined means no variant selected yet
  onAddToCart: (qty: number) => void
}

export function AddToCartButton({ variantId, stockQty, onAddToCart }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)

  // Reset quantity to 1 when selected variant changes
  useEffect(() => {
    setQuantity(1)
  }, [variantId])

  // Determine button state
  const isNoVariantSelected = stockQty === undefined
  const isOutOfStock = stockQty !== undefined && stockQty <= 0
  const isButtonDisabled = isNoVariantSelected || isOutOfStock

  let buttonText = 'Add to Cart'
  if (isNoVariantSelected) {
    buttonText = 'Select Options'
  } else if (isOutOfStock) {
    buttonText = 'Out of Stock'
  }

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
      <div className="flex items-center gap-4">
        {/* Quantity Picker (only enabled if a variant is selected and in stock) */}
        <div className="flex items-center h-12 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isButtonDisabled || quantity <= 1}
            className="flex w-10 h-full items-center justify-center text-zinc-500 hover:text-zinc-900 disabled:opacity-30 dark:hover:text-zinc-100"
            aria-label="Decrease quantity"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>
          
          <span className="w-12 text-center text-sm font-bold text-zinc-900 select-none dark:text-zinc-50">
            {isOutOfStock ? 0 : quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={isButtonDisabled || (stockQty !== undefined && quantity >= stockQty)}
            className="flex w-10 h-full items-center justify-center text-zinc-500 hover:text-zinc-900 disabled:opacity-30 dark:hover:text-zinc-100"
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
              <span className="text-amber-600">Only {stockQty} items left!</span>
            ) : (
              <span className="text-emerald-600">In Stock ({stockQty} available)</span>
            )}
          </div>
        )}
      </div>

      {/* Add To Cart CTA Button */}
      <button
        type="button"
        disabled={isButtonDisabled}
        onClick={() => onAddToCart(quantity)}
        className={`w-full h-12 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-300 ${
          isButtonDisabled
            ? 'bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-600'
            : 'bg-amber-600 text-white shadow-md shadow-amber-600/10 hover:bg-amber-700 hover:shadow-lg'
        }`}
      >
        {buttonText}
      </button>
    </div>
  )
}
