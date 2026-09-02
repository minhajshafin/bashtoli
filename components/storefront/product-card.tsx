'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ProductWithDetails } from '@/lib/queries/products'
import { WishlistButton } from '@/components/storefront/wishlist-button'

interface ProductCardProps {
  product: ProductWithDetails
}

export function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const activeVariants = product.product_variants.filter((v) => v.active)

  const lowestPrice =
    activeVariants.length > 0
      ? Math.min(...activeVariants.map((v) => v.price))
      : product.base_price

  const isSoldOut =
    activeVariants.length > 0 && activeVariants.every((v) => v.stock_qty === 0)

  const primaryImage = product.product_images?.[0]
  const imageUrl = primaryImage?.url || null
  const altText = primaryImage?.alt_text || product.name

  return (
    <Link
      href={`/products/${product.slug}`}
      className="block cursor-pointer overflow-hidden rounded-2xl sm:rounded-[20px] bg-cream-200 transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered ? '0 16px 48px rgba(13,31,21,0.15)' : '0 2px 10px rgba(13,31,21,0.05)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={altText}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            className="object-cover"
            style={{
              transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cream-100 text-forest-400">
            <svg className="h-8 w-8 sm:h-10 sm:w-10 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-forest-900/60 flex items-center justify-center">
            <span className="rounded-full bg-rose-600 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[10px] sm:text-xs font-bold tracking-wide text-white uppercase shadow-md">
              Sold Out
            </span>
          </div>
        )}

        {/* Category tag (desktop only) */}
        {product.categories && (
          <span
            className="hidden sm:inline-block absolute top-3 left-3 px-3 py-1 text-xs font-semibold z-10"
            style={{
              backgroundColor: '#c9a96e',
              color: '#1a3326',
              borderRadius: '100px',
              letterSpacing: '0.04em',
            }}
          >
            {product.categories.name}
          </span>
        )}

        {/* Wishlist toggle heart button */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
          <WishlistButton
            productId={product.id}
            variant="card"
          />
        </div>

        {/* Add to bag bar (desktop hover only) */}
        <div
          className="hidden sm:block absolute inset-x-0 bottom-0 py-3.5 text-center"
          style={{
            backgroundColor: '#1a3326',
            color: '#f5ede0',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontSize: '0.68rem',
            fontWeight: 600,
            transition: 'transform 0.3s ease',
            transform: hovered ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          Add to Bag
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3 sm:p-4">
        <h3
          className="text-xs sm:text-base font-medium text-forest-950 line-clamp-1 sm:line-clamp-2 mb-1"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {product.name}
        </h3>
        <p
          className="text-xs sm:text-base font-semibold text-forest-900"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          ৳{lowestPrice.toLocaleString()}
          {activeVariants.length > 1 && (
            <span className="text-[10px] font-normal text-forest-500 ml-1">onwards</span>
          )}
        </p>
      </div>
    </Link>
  )
}
