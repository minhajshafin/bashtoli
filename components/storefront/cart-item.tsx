'use client'

import Image from 'next/image'
import React from 'react'
import { ProductImageSkeleton } from '@/components/storefront/product-image-skeleton'
import type { CartItem } from '@/lib/cart/guest-cart'
import type { ValidatedCartItem } from '@/lib/queries/cart'
import { formatPrice } from '@/lib/utils/format-price'
import { Trash2, Minus, Plus } from 'lucide-react'

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
    <div className="p-4 sm:p-5 rounded-md border border-forest-900/10 bg-white shadow-elevation-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      {/* Product Image & Info */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-forest-900/10 bg-cream-100/70">
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

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h3 className="text-xs sm:text-sm font-semibold text-forest-950 truncate font-sans">
              {item.name}
            </h3>
            {!isAvailable && (
              <span className="rounded-pill bg-terracotta-100 border border-terracotta-400/40 px-2 py-0.5 text-[9px] sm:text-[10px] font-sans font-medium tracking-wide text-terracotta-700 uppercase">
                {isOutOfStock ? 'Sold Out' : 'Unavailable'}
              </span>
            )}
          </div>

          <p className="text-[11px] sm:text-xs font-mono text-forest-600 mt-0.5">
            {item.variant_name}
          </p>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            <span className="text-xs text-forest-950 font-semibold font-price">
              {formatPrice(currentPrice)}
            </span>
            {hasPriceChanged && (
              <span className="text-[10px] font-sans font-medium text-gold-700 animate-pulse">
                (Price updated from {formatPrice(item.price)})
              </span>
            )}
          </div>

          {isOutOfStock && (
            <p className="text-[10px] text-terracotta-600 font-medium mt-1">
              This item is sold out. Please remove it from your bag to checkout.
            </p>
          )}
          {isOverstocked && (
            <p className="text-[10px] text-gold-700 font-medium mt-1">
              Only {dbStatus?.stock_qty} left in stock. Quantity adjusted.
            </p>
          )}
        </div>
      </div>

      {/* Stepper & Line Total & Remove Action */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-forest-900/10">
        {/* Stepper with 44px tap targets */}
        <div className="flex items-center h-10 rounded-md border border-forest-900/15 bg-cream-50 shadow-2xs">
          <button
            type="button"
            onClick={() => onQtyChange(item.qty - 1)}
            disabled={!isAvailable || item.qty <= 1}
            className="flex min-w-[44px] h-full items-center justify-center text-forest-700 hover:text-forest-950 disabled:opacity-25 active:scale-95 transition-transform duration-fast"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-7 sm:w-8 text-center text-xs font-bold text-forest-950 select-none font-price">
            {item.qty}
          </span>
          <button
            type="button"
            onClick={() => onQtyChange(item.qty + 1)}
            disabled={!isAvailable || item.qty >= maxStock}
            className="flex min-w-[44px] h-full items-center justify-center text-forest-700 hover:text-forest-950 disabled:opacity-25 active:scale-95 transition-transform duration-fast"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Line Price & Remove Button */}
        <div className="flex items-center gap-2 sm:gap-3 text-right">
          <div className="min-w-[70px] sm:min-w-[90px]">
            <div className="text-xs sm:text-sm font-bold text-forest-950 font-price">
              {formatPrice(lineTotal)}
            </div>
            {item.qty > 1 && (
              <div className="text-[10px] text-forest-600 font-price sm:hidden">
                {formatPrice(currentPrice)} each
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-forest-500 hover:text-btn-danger-bg hover:bg-terracotta-100/60 rounded-md transition-colors duration-fast cursor-pointer active:scale-95"
            aria-label={`Remove ${item.name}`}
            title="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
