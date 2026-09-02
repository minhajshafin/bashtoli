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
      className="block cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        backgroundColor: '#ede3cf',
        boxShadow: hovered ? '0 16px 48px rgba(13,31,21,0.15)' : '0 2px 12px rgba(13,31,21,0.06)',
        transition: 'box-shadow 0.35s ease, transform 0.35s ease',
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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            className="object-cover"
            style={{
              transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
              transform: hovered ? 'scale(1.07)' : 'scale(1)',
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cream-100 text-forest-400">
            <svg className="h-10 w-10 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-forest-900/60 flex items-center justify-center">
            <span className="rounded-full bg-rose-600 px-3.5 py-1 text-xs font-bold tracking-wide text-white uppercase shadow-md">
              Sold Out
            </span>
          </div>
        )}

        {/* Category tag */}
        {product.categories && (
          <span
            className="absolute top-3 left-3 px-3.5 py-1 text-xs font-semibold z-10"
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
        <div className="absolute top-3 right-3 z-20">
          <WishlistButton
            productId={product.id}
            variant="card"
          />
        </div>

        {/* Add to bag bar */}
        <div
          className="absolute inset-x-0 bottom-0 py-3.5 text-center"
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

      {/* Info */}
      <div className="px-4 py-4">
        <h3
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '1.05rem',
            color: '#1a3326',
            fontWeight: 500,
            marginBottom: '3px',
          }}
        >
          {product.name}
        </h3>
        {product.description && (
          <p
            className="line-clamp-1"
            style={{ fontSize: '0.78rem', color: '#6a9e7c', marginBottom: '8px' }}
          >
            {product.description}
          </p>
        )}
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1rem', color: '#2d5240', fontWeight: 600 }}>
          ৳{lowestPrice.toLocaleString()}
          {activeVariants.length > 1 && (
            <span className="text-[10px] font-normal text-forest-400 ml-1">onwards</span>
          )}
        </p>
      </div>
    </Link>
  )
}
