'use client'

import React, { useState } from 'react'

interface AddToCartButtonProps {
  variantId?: string
  stockQty?: number // undefined means no variant selected yet
  onAddToCart: (qty: number) => void
}

export function AddToCartButton({ variantId, stockQty, onAddToCart }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)

  const [prevVariantId, setPrevVariantId] = useState(variantId)

  // Reset quantity to 1 when selected variant changes
  if (variantId !== prevVariantId) {
    setPrevVariantId(variantId)
    setQuantity(1)
  }

  // Determine button state
  const isNoVariantSelected = stockQty === undefined
  const isOutOfStock = stockQty !== undefined && stockQty <= 0
  const isButtonDisabled = isNoVariantSelected || isOutOfStock

  let buttonText = 'Add to Bag'
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
        <div className="flex items-center h-12 rounded-xl border border-forest-200 bg-white">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isButtonDisabled || quantity <= 1}
            className="flex w-10 h-full items-center justify-center text-forest-400 hover:text-forest-700 disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>
          
          <span className="w-12 text-center text-sm font-bold text-forest-900 select-none">
            {isOutOfStock ? 0 : quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={isButtonDisabled || (stockQty !== undefined && quantity >= stockQty)}
            className="flex w-10 h-full items-center justify-center text-forest-400 hover:text-forest-700 disabled:opacity-30"
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
              <span className="text-gold-600 font-bold">Only {stockQty} items left!</span>
            ) : (
              <span className="text-forest-500">In Stock ({stockQty} available)</span>
            )}
          </div>
        )}
      </div>

      {/* Add To Cart CTA Button */}
      <button
        type="button"
        disabled={isButtonDisabled}
        onClick={() => onAddToCart(quantity)}
        className={`w-full h-12 rounded-full text-sm font-bold tracking-wide uppercase transition-all duration-300 ${
          isButtonDisabled
            ? 'bg-forest-100 border border-forest-200 text-forest-400 cursor-not-allowed'
            : 'bg-gold-500 text-forest-800 shadow-md shadow-gold-500/20 hover:bg-gold-400 hover:shadow-lg'
        }`}
      >
        {buttonText}
      </button>
    </div>
  )
}

