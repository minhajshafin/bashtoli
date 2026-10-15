'use client'

import Image from 'next/image'
import React from 'react'
import { ProductImageSkeleton } from '@/components/storefront/product-image-skeleton'
import type { CartItem } from '@/lib/cart/guest-cart'
import type { ValidatedCartItem } from '@/lib/queries/cart'

interface CartItemProps {
  item: CartItem
  dbStatus?: ValidatedCartItem
  onQtyChange: (qty: number) => void
  onRemove: () => void
}

export function CartItemRow({ item, dbStatus, onQtyChange, onRemove }: CartItemProps) {
  // Determine if item is active and has stock
  const isOutOfStock = dbStatus ? dbStatus.stock_qty <= 0 : false
  const isAvailable = dbStatus ? dbStatus.active === true && dbStatus.stock_qty > 0 : true
  const maxStock = dbStatus ? dbStatus.stock_qty : 999
  const currentPrice = dbStatus ? dbStatus.price : item.price

  // Warning check: if price in database differs from snapshot
  const hasPriceChanged = dbStatus && dbStatus.price !== item.price
  // Warning check: if quantity is more than stock in database
  const isOverstocked = dbStatus && dbStatus.stock_qty > 0 && item.qty > dbStatus.stock_qty

  const lineTotal = currentPrice * item.qty

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-forest-200/80 bg-cream-50/90 shadow-2xs transition-all">
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Thumbnail image */}
        <div className="relative h-18 w-18 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border border-forest-200/80 bg-cream-100/70">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <ProductImageSkeleton size="sm" showText={false} />
          )}
        </div>

        {/* Product Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-sm font-semibold text-forest-950 truncate font-sans">
              {item.name}
            </h3>
            {!isAvailable && (
              <span className="rounded-full bg-terracotta-100 border border-terracotta-400/40 px-2 py-0.5 text-[10px] font-sans font-medium tracking-wide text-terracotta-700 uppercase">
                {isOutOfStock ? 'Sold Out' : 'Unavailable'}
              </span>
            )}
          </div>

          <p className="text-xs font-mono text-forest-600/90 mt-0.5">
            {item.variant_name}
          </p>

          <div className="flex flex-col gap-1 mt-1">
            {/* Price display */}
            <div className="text-xs text-forest-950 font-semibold font-price">
              ৳{currentPrice.toLocaleString()}
              {hasPriceChanged && (
                <span className="text-[10px] font-sans font-medium text-gold-600 ml-1.5 animate-pulse">
                  (Price updated from ৳{item.price})
                </span>
              )}
            </div>
            {isOutOfStock && (
              <p className="text-[10px] text-terracotta-600 font-medium">
                This item is currently sold out. Please remove it from your bag to checkout.
              </p>
            )}
            {isOverstocked && (
              <p className="text-[10px] text-gold-600 font-medium">
                Only {dbStatus?.stock_qty} left in stock. Quantity adjusted.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quantity & Actions split */}
      <div className="flex items-center justify-between sm:justify-end gap-5 border-t border-forest-100/80 pt-3 sm:border-0 sm:pt-0">
        {/* Quantity control */}
        <div className="flex items-center h-9 sm:h-10 rounded-xl border border-forest-200/80 bg-cream-100/60 px-1 shadow-2xs">
          <button
            type="button"
            onClick={() => onQtyChange(item.qty - 1)}
            disabled={!isAvailable || item.qty <= 1}
            className="flex w-8 sm:w-9 h-full items-center justify-center text-forest-600 hover:text-forest-950 hover:bg-cream-200/80 disabled:opacity-25 transition-colors cursor-pointer active:scale-95"
            aria-label="Decrease quantity"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>

          <span className="w-8 sm:w-9 text-center text-xs font-semibold text-forest-950 select-none font-price">
            {item.qty}
          </span>

          <button
            type="button"
            onClick={() => onQtyChange(item.qty + 1)}
            disabled={!isAvailable || item.qty >= maxStock}
            className="flex w-8 sm:w-9 h-full items-center justify-center text-forest-600 hover:text-forest-950 hover:bg-cream-200/80 disabled:opacity-25 transition-colors cursor-pointer active:scale-95"
            aria-label="Increase quantity"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Line total & remove action */}
        <div className="flex items-center gap-3 shrink-0 text-right min-w-[90px]">
          <div className="text-sm font-semibold text-forest-950 flex-1 font-price">
            ৳{lineTotal.toLocaleString()}
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="text-forest-400 hover:text-btn-danger-bg hover:bg-terracotta-100 transition-colors p-1.5 rounded-lg cursor-pointer active:scale-90"
            aria-label="Remove item"
            title="Remove item"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

