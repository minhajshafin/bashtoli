'use client'

import React, { useState } from 'react'
import { ImageGallery } from '@/components/storefront/image-gallery'
import { VariantSelector } from '@/components/storefront/variant-selector'
import { AddToCartButton } from '@/components/storefront/add-to-cart-button'
import { WishlistButton } from '@/components/storefront/wishlist-button'
import type { ProductDetailData } from '@/lib/queries/product-detail'
import { useCart } from '@/lib/cart/cart-context'

interface ProductDetailClientProps {
  detailData: ProductDetailData
  isLoggedIn: boolean
  initialIsWishlisted: boolean
}

export function ProductDetailClient({
  detailData,
  isLoggedIn,
  initialIsWishlisted,
}: ProductDetailClientProps) {
  const { product, images, variants, options } = detailData
  const { addItem } = useCart()

  // State to hold user selected options
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

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

  // Handle Add to Cart via CartContext
  const handleAddToCart = (qty: number) => {
    if (!selectedVariant) return

    const primaryImage = images?.[0]
    const imageUrl = primaryImage?.url || null

    const variantName = Object.keys(selectedOptions).length > 0
      ? Object.values(selectedOptions).join(' / ')
      : 'Default'

    addItem({
      variant_id: selectedVariant.id,
      product_id: product.id,
      name: product.name,
      variant_name: variantName,
      price: selectedVariant.price,
      image_url: imageUrl,
    }, qty)

    alert(`Added ${qty} x "${product.name} (${variantName})" to cart!`)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-6">
      {/* Left - Image Gallery */}
      <div>
        <ImageGallery images={images} fallbackName={product.name} />
      </div>

      {/* Right - Product details & purchasing options */}
      <div className="flex flex-col">
        {/* Category & Featured tag */}
        <div className="flex items-center gap-2 mb-2">
          {product.categories && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              {product.categories.name}
            </span>
          )}
          {product.featured && (
            <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-50 dark:bg-zinc-800">
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight dark:text-zinc-50">
          {product.name}
        </h1>

        {/* Price Display */}
        <div className="text-xl md:text-2xl font-black text-zinc-900 my-4 dark:text-zinc-50">
          {renderPrice()}
        </div>

        {/* Divider */}
        <hr className="border-zinc-200 my-4 dark:border-zinc-800" />

        {/* Product Description */}
        {product.description ? (
          <div className="prose prose-sm dark:prose-invert text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
            <p>{product.description}</p>
          </div>
        ) : (
          <p className="text-zinc-400 text-xs italic mb-6">No description provided for this product.</p>
        )}

        {/* Variant Selector */}
        <VariantSelector
          options={options}
          variants={variants}
          selectedOptions={selectedOptions}
          onChange={handleOptionChange}
        />

        {/* Divider before cart action */}
        {options.length > 0 && <hr className="border-zinc-200 my-6 dark:border-zinc-800" />}

        {/* Qty Picker & Add to Cart & Wishlist */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <AddToCartButton
              variantId={selectedVariant?.id}
              stockQty={isSelectionComplete ? selectedVariant?.stock_qty ?? 0 : undefined}
              onAddToCart={handleAddToCart}
            />
          </div>
          <WishlistButton
            productId={product.id}
            isLoggedIn={isLoggedIn}
            initialIsWishlisted={initialIsWishlisted}
          />
        </div>
      </div>
    </div>
  )
}
