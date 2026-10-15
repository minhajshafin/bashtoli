'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ImageGallery } from '@/components/storefront/image-gallery'
import { VariantSelector } from '@/components/storefront/variant-selector'
import { AddToCartButton } from '@/components/storefront/add-to-cart-button'
import { WishlistButton } from '@/components/storefront/wishlist-button'
import type { ProductDetailData } from '@/lib/queries/product-detail'
import { useCart } from '@/lib/cart/cart-context'
import { useToast } from '@/components/ui/toast'

interface ProductDetailClientProps {
  detailData: ProductDetailData
  isLoggedIn?: boolean
  initialIsWishlisted?: boolean
}

export function ProductDetailClient({
  detailData,
  isLoggedIn = false,
  initialIsWishlisted = false,
}: ProductDetailClientProps) {
  const { product, images, variants, options } = detailData
  const router = useRouter()
  const { addItem } = useCart()
  const { toast } = useToast()

  // State to hold user selected options
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [showStickyBar, setShowStickyBar] = useState(false)
  const mainActionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (mainActionsRef.current) {
        const rect = mainActionsRef.current.getBoundingClientRect()
        setShowStickyBar(rect.bottom < 60)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle option selection
  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }))
  }

  // Determine if selection is complete
  const isSelectionComplete = Object.keys(selectedOptions).length === options.length

  // Find the variant matching all selected options
  const selectedVariant = isSelectionComplete
    ? variants.find((v) => {
        const optVals = (v.option_values || {}) as Record<string, string>
        return options.every((opt) => optVals[opt.name] === selectedOptions[opt.name])
      })
    : undefined

  // Calculate pricing range or current variant price
  const lowestActivePrice =
    variants.length > 0
      ? Math.min(...variants.map((v) => v.price))
      : product.base_price

  const highestActivePrice =
    variants.length > 0
      ? Math.max(...variants.map((v) => v.price))
      : product.base_price

  // Render price: single price or range if not selected yet
  const renderPrice = () => {
    if (selectedVariant) {
      return `৳${selectedVariant.price.toLocaleString()}`
    }
    if (lowestActivePrice === highestActivePrice) {
      return `৳${lowestActivePrice.toLocaleString()}`
    }
    return `৳${lowestActivePrice.toLocaleString()} - ৳${highestActivePrice.toLocaleString()}`
  }

  const variantName = Object.keys(selectedOptions).length > 0
    ? Object.values(selectedOptions).join(' / ')
    : 'Standard'

  // Handle Add to Cart via CartContext
  const handleAddToCart = (qty: number = 1) => {
    // If no variant explicitly selected yet, default to first available variant if exists
    const targetVariant = selectedVariant || (variants.length === 1 ? variants[0] : undefined)
    if (!targetVariant) return

    const primaryImage = images?.[0]
    const imageUrl = primaryImage?.url || null

    addItem({
      variant_id: targetVariant.id,
      product_id: product.id,
      name: product.name,
      variant_name: variantName,
      price: targetVariant.price,
      image_url: imageUrl,
    }, qty)

    toast(`Added "${product.name}" to your bag!`, 'success')
  }

  // Handle Buy Now -> adds item and directs straight to checkout
  const handleBuyNow = (qty: number = 1) => {
    const targetVariant = selectedVariant || (variants.length === 1 ? variants[0] : undefined)
    if (!targetVariant) return
    handleAddToCart(qty)
    router.push('/checkout')
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 pb-6 md:pb-0 items-center">
        {/* Left - Image Gallery */}
        <div className="flex justify-center md:justify-start">
          <ImageGallery images={images} fallbackName={product.name} />
        </div>

        {/* Right - Product details & purchasing options */}
        <div className="flex flex-col max-w-xl">
          {/* Category & Featured tag */}
          <div className="flex items-center gap-2 mb-1.5">
            {product.categories && (
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-sans font-medium text-forest-600/90">
                {product.categories.name}
              </span>
            )}
            {product.featured && (
              <span className="rounded-full px-2 py-0.5 text-[9px] font-sans font-semibold uppercase tracking-[0.1em] bg-gold-400/20 text-gold-700 border border-gold-400/35">
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-[1.75rem] lg:text-3xl font-medium text-forest-950 tracking-[-0.015em] font-display leading-[1.15]">
            {product.name}
          </h1>

          {/* Price Display */}
          <div className="text-xl sm:text-2xl font-semibold my-2 pb-2.5 border-b border-forest-200/70 text-forest-950 font-price flex items-baseline gap-2">
            <span>{renderPrice()}</span>
            <span className="text-[11px] font-sans font-normal text-forest-500 uppercase tracking-wider">
              (incl. VAT)
            </span>
          </div>

          {/* Product Description */}
          {product.description ? (
            <div className="text-forest-700/90 leading-relaxed mb-3.5 text-xs sm:text-[13px] font-sans text-pretty">
              <p>{product.description}</p>
            </div>
          ) : (
            <p className="text-forest-400 text-xs italic mb-3.5">No description provided for this product.</p>
          )}

          {/* Variant Selector */}
          <VariantSelector
            options={options}
            variants={variants}
            selectedOptions={selectedOptions}
            onChange={handleOptionChange}
          />

          {/* Qty Picker & Add to Bag & Buy Now & Wishlist */}
          <div ref={mainActionsRef} className="mt-3 flex flex-col gap-3">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <AddToCartButton
                  key={selectedVariant?.id ?? 'no-variant'}
                  variantId={selectedVariant?.id}
                  stockQty={isSelectionComplete ? selectedVariant?.stock_qty ?? 0 : undefined}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              </div>
              <div className="pb-0.5">
                <WishlistButton
                  productId={product.id}
                  productName={product.name}
                  isLoggedIn={isLoggedIn}
                  initialIsWishlisted={initialIsWishlisted}
                  variant="detail"
                />
              </div>
            </div>
          </div>

          {/* Minimal Shop Guarantees */}
          <div className="mt-4 pt-3.5 border-t border-forest-200/60 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-sans text-forest-600/90">
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-forest-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Cash on delivery nationwide
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-forest-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              24–48h delivery in Dhaka
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-forest-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              7-day exchange guarantee
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Floating Frosted Glass Purchase Bar */}
      <div
        style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        className={`md:hidden fixed inset-x-3 z-40 bg-forest-950/92 backdrop-blur-md border border-forest-800/80 rounded-2xl p-2.5 sm:p-3 shadow-sm transition-all duration-300 max-w-md mx-auto ${
          showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-gold-400 uppercase tracking-wider font-semibold truncate font-mono">
              {variantName}
            </p>
            <p className="text-sm font-semibold text-cream-100 font-price">
              {renderPrice()}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isSelectionComplete && selectedVariant?.stock_qty === 0}
              onClick={() => handleAddToCart(1)}
              className="btn-dark h-9 px-3 rounded-xl text-[11px] font-sans font-medium tracking-wider uppercase flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              </svg>
              <span>Add</span>
            </button>

            <button
              type="button"
              disabled={isSelectionComplete && selectedVariant?.stock_qty === 0}
              onClick={() => handleBuyNow(1)}
              className="btn-accent h-9 px-3.5 rounded-xl text-[11px] font-sans font-bold tracking-wider uppercase flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 text-btn-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
