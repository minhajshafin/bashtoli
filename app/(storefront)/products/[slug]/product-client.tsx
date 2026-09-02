'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
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
  }

  // Handle Buy Now -> adds item and directs straight to checkout
  const handleBuyNow = (qty: number) => {
    if (!selectedVariant) return
    handleAddToCart(qty)
    router.push('/checkout')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 mt-6">
      {/* Left - Image Gallery */}
      <div>
        <ImageGallery images={images} fallbackName={product.name} />
      </div>

      {/* Right - Product details & purchasing options */}
      <div className="flex flex-col">
        {/* Category & Featured tag */}
        <div className="flex items-center gap-2 mb-3">
          {product.categories && (
            <span
              className="text-[11px] uppercase tracking-widest font-semibold"
              style={{ color: '#6a9e7c', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
            >
              {product.categories.name}
            </span>
          )}
          {product.featured && (
            <span
              className="rounded-full px-3 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: '#c9a96e', color: '#1a3326' }}
            >
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-2xl md:text-3xl lg:text-4xl font-normal text-forest-800 tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', lineHeight: 1.1 }}
        >
          {product.name}
        </h1>

        {/* Price Display */}
        <div
          className="text-2xl md:text-3xl font-semibold my-4 pb-4 border-b border-cream-200"
          style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#1a3326' }}
        >
          {renderPrice()}
        </div>

        {/* Product Description */}
        {product.description ? (
          <div className="text-forest-600 leading-relaxed mb-6 text-sm">
            <p>{product.description}</p>
          </div>
        ) : (
          <p className="text-forest-400 text-xs italic mb-6">No description provided for this product.</p>
        )}

        {/* Variant Selector */}
        <VariantSelector
          options={options}
          variants={variants}
          selectedOptions={selectedOptions}
          onChange={handleOptionChange}
        />

        {/* Qty Picker & Add to Bag & Buy Now & Wishlist */}
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <AddToCartButton
                variantId={selectedVariant?.id}
                stockQty={isSelectionComplete ? selectedVariant?.stock_qty ?? 0 : undefined}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            </div>
            <div className="pb-0.5">
              <WishlistButton
                productId={product.id}
                isLoggedIn={isLoggedIn}
                initialIsWishlisted={initialIsWishlisted}
                variant="detail"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Trust Info Badges */}
        <div className="mt-8 pt-6 flex flex-col gap-3 border-t border-cream-200">
          {[
            {
              path: 'M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 1-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
              text: 'Home delivery all across Bangladesh',
            },
            {
              path: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
              text: 'Free returns within 7 days for defective goods',
            },
            {
              path: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
              text: 'Hand-tested and inspected by the Bashtoli team',
            },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  flexShrink: 0,
                  borderRadius: '10px',
                  backgroundColor: '#ede3cf',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" fill="none" stroke="#3d6e54" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.path} />
                </svg>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#3d6e54', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


