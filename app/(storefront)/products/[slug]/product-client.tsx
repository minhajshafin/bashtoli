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
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const mainActionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = mainActionsRef.current
    if (!target) return

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          // Display sticky thumb-zone bar only when inline actions have scrolled past the top
          setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0)
        },
        { threshold: 0.1 }
      )
      observer.observe(target)
      return () => observer.disconnect()
    } else {
      const handleScroll = () => {
        if (mainActionsRef.current) {
          const rect = mainActionsRef.current.getBoundingClientRect()
          setShowStickyBar(rect.bottom < 0)
        }
      }
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
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
          <ImageGallery
            images={images}
            fallbackName={product.name}
            productId={product.id}
            productName={product.name}
            isLoggedIn={isLoggedIn}
            initialIsWishlisted={initialIsWishlisted}
          />
        </div>

        {/* Right - Product details & purchasing options */}
        <div className="flex flex-col max-w-xl">
          {/* Category & Featured tag */}
          <div className="flex items-center gap-2 mb-1.5 mt-2 sm:mt-0">
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

          {/* Price & Stock Row */}
          <div className="my-2 pb-2.5 border-b border-forest-200/70 flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-forest-950 font-price">{renderPrice()}</span>
              <span className="text-[11px] font-sans font-normal text-forest-500 uppercase tracking-wider">
                (incl. VAT)
              </span>
            </div>

            {/* In Stock / Sold Out Badge */}
            {isSelectionComplete && (
              <div className="shrink-0">
                {selectedVariant?.stock_qty === 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium bg-btn-danger-bg/10 text-btn-danger-bg border border-btn-danger-border/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-btn-danger-bg" />
                    Sold Out
                  </span>
                ) : selectedVariant?.stock_qty !== undefined && selectedVariant.stock_qty <= 3 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium bg-btn-warning-bg/10 text-btn-warning-border border border-btn-warning-border/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-btn-warning-border animate-pulse" />
                    Only {selectedVariant.stock_qty} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium bg-forest-600/10 text-forest-800 border border-forest-600/25">
                    <span className="h-1.5 w-1.5 rounded-full bg-forest-600" />
                    In Stock
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Product Description */}
          {product.description ? (
            <div className="text-forest-700/90 leading-relaxed mb-3 text-xs sm:text-[13px] font-sans text-pretty">
              <p>{product.description}</p>
            </div>
          ) : (
            <p className="text-forest-400 text-xs italic mb-3">No description provided for this product.</p>
          )}

          {/* Variant Selector */}
          <VariantSelector
            options={options}
            variants={variants}
            selectedOptions={selectedOptions}
            onChange={handleOptionChange}
          />

          {/* Qty Picker & Add to Bag & Buy Now & Wishlist */}
          <div ref={mainActionsRef} className="mt-2.5 flex flex-col gap-3">
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
              {/* Desktop Wishlist Button (On mobile, placed floating over hero media) */}
              <div className="hidden sm:block pb-0.5">
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

          {/* Collapsible Stationery Details & Guarantees Accordion */}
          <div className="mt-5 border-t border-forest-200/60 divide-y divide-forest-200/50">
            {/* Accordion 1: Shipping & Delivery */}
            <div className="py-2.5">
              <button
                type="button"
                onClick={() => setOpenAccordion((prev) => (prev === 'shipping' ? null : 'shipping'))}
                className="w-full flex items-center justify-between py-1 text-left text-xs font-sans font-medium text-forest-800 hover:text-forest-950 cursor-pointer select-none"
                aria-expanded={openAccordion === 'shipping'}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gold-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.875A1.125 1.125 0 0 0 13.125 3.75H4.125A1.125 1.125 0 0 0 3 4.875v9.375" />
                  </svg>
                  <span>Shipping & Nationwide Delivery</span>
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-forest-500 transition-transform duration-200 shrink-0 ${
                    openAccordion === 'shipping' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {openAccordion === 'shipping' && (
                <div className="pt-2 pb-1 text-[11px] font-sans text-forest-650 leading-relaxed space-y-1.5 animate-fade-in">
                  <p>• <strong>Dhaka City:</strong> 24–48 hours delivery (৳70 flat rate).</p>
                  <p>• <strong>Outside Dhaka:</strong> 3–5 business days nationwide (৳120 flat rate).</p>
                  <p>• <strong>Cash on Delivery:</strong> Available across all 64 districts in Bangladesh.</p>
                </div>
              )}
            </div>

            {/* Accordion 2: Bashtoli Guarantee & Exchange */}
            <div className="py-2.5">
              <button
                type="button"
                onClick={() => setOpenAccordion((prev) => (prev === 'guarantee' ? null : 'guarantee'))}
                className="w-full flex items-center justify-between py-1 text-left text-xs font-sans font-medium text-forest-800 hover:text-forest-950 cursor-pointer select-none"
                aria-expanded={openAccordion === 'guarantee'}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gold-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  <span>7-Day Hassle-Free Exchange</span>
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-forest-500 transition-transform duration-200 shrink-0 ${
                    openAccordion === 'guarantee' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {openAccordion === 'guarantee' && (
                <div className="pt-2 pb-1 text-[11px] font-sans text-forest-650 leading-relaxed space-y-1.5 animate-fade-in">
                  <p>• We offer a 7-day hassle-free exchange on unused stationery pieces in their original wrapping.</p>
                  <p>• Every order is carefully hand-inspected and cushioned in protective archival packaging.</p>
                </div>
              )}
            </div>

            {/* Accordion 3: Archival Craft & Care */}
            <div className="py-2.5">
              <button
                type="button"
                onClick={() => setOpenAccordion((prev) => (prev === 'care' ? null : 'care'))}
                className="w-full flex items-center justify-between py-1 text-left text-xs font-sans font-medium text-forest-800 hover:text-forest-950 cursor-pointer select-none"
                aria-expanded={openAccordion === 'care'}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gold-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                  <span>Materials & Archival Quality</span>
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-forest-500 transition-transform duration-200 shrink-0 ${
                    openAccordion === 'care' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {openAccordion === 'care' && (
                <div className="pt-2 pb-1 text-[11px] font-sans text-forest-650 leading-relaxed space-y-1.5 animate-fade-in">
                  <p>• Handcrafted from sustainable bamboo fibers and archival laid paper.</p>
                  <p>• Tested for fountain pen bleed resistance and smooth rollerball ink flow.</p>
                  <p>• Store away from direct sunlight and excessive humidity.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Mobile Thumb-Zone Purchase Bar */}
      <div
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 bg-forest-950/95 backdrop-blur-xl border-t border-forest-800/80 px-4 pt-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-[0_-8px_30px_rgba(10,22,15,0.4)] transition-all duration-300 ${
          showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          {/* Price & Current Selection / Prompt */}
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-gold-300 font-price tracking-tight">
              {renderPrice()}
            </p>
            {!isSelectionComplete && options.length > 0 ? (
              <p className="text-[10px] text-gold-400/90 font-sans font-medium truncate flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                Select options above
              </p>
            ) : (
              <p className="text-[10px] text-cream-200/75 uppercase tracking-wider font-sans truncate font-medium">
                {variantName}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="shrink-0 flex items-center gap-2">
            {!isSelectionComplete && options.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  document.getElementById('variant-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
                className="btn-accent h-10 px-4 rounded-xl text-xs font-sans font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Choose Options</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                </svg>
              </button>
            ) : selectedVariant?.stock_qty === 0 ? (
              <button
                type="button"
                disabled
                className="h-10 px-4 rounded-xl text-xs font-sans font-semibold tracking-wider uppercase bg-forest-900/60 text-cream-200/40 border border-white/5 cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(1)}
                  className="btn-dark h-10 px-3.5 rounded-xl text-[11px] font-sans font-semibold tracking-wider uppercase flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  aria-label="Add to Bag"
                >
                  <svg className="w-3.5 h-3.5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                  </svg>
                  <span>Add</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBuyNow(1)}
                  className="btn-accent h-10 px-4 rounded-xl text-[11px] font-sans font-bold tracking-wider uppercase flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  aria-label="Buy Now"
                >
                  <svg className="w-3.5 h-3.5 text-btn-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Buy Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
