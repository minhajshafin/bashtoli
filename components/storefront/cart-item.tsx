'use client'

import Image from 'next/image'
import React from 'react'
import { ProductImageSkeleton } from '@/components/storefront/product-image-skeleton'
import type { CartItem } from '@/lib/cart/guest-cart'
import type { ValidatedCartItem } from '@/lib/queries/cart'
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
    <>
      {/* 1. Mobile-Optimized Compact Item Card (< sm) */}
      <div className="sm:hidden p-3.5 rounded-2xl border border-forest-200/80 bg-cream-50/95 shadow-2xs">
        <div className="flex items-start gap-3">
          {/* Thumbnail image */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-forest-200/80 bg-cream-100/70">
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

          {/* Details & Controls */}
          <div className="min-w-0 flex-1 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-semibold text-forest-950 truncate font-sans">
                  {item.name}
                </h3>
                <p className="text-[11px] font-mono text-forest-600 mt-0.5 truncate">
                  {item.variant_name}
                </p>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 -mr-1 -mt-1 text-forest-400 hover:text-btn-danger-bg hover:bg-terracotta-100/60 rounded-lg active:scale-90 transition-all cursor-pointer"
                aria-label={`Remove ${item.name}`}
                title="Remove item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Warnings/Status badges */}
            {!isAvailable && (
              <span className="mt-1 inline-block self-start rounded-full bg-terracotta-100 border border-terracotta-400/40 px-2 py-0.5 text-[9px] font-sans font-medium text-terracotta-700 uppercase">
                {isOutOfStock ? 'Sold Out' : 'Unavailable'}
              </span>
            )}
            {hasPriceChanged && (
              <span className="text-[10px] font-sans font-medium text-gold-600 animate-pulse">
                Price updated from ৳{item.price}
              </span>
            )}
            {isOverstocked && (
              <span className="text-[10px] text-gold-600 font-medium">
                Only {dbStatus?.stock_qty} left. Adjusted.
              </span>
            )}

            {/* Bottom Stepper & Line Price */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-forest-100/80">
              {/* Stepper with 44px tap targets */}
              <div className="flex items-center h-8 rounded-lg border border-forest-200/90 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => onQtyChange(item.qty - 1)}
                  disabled={!isAvailable || item.qty <= 1}
                  className="flex w-8 h-full items-center justify-center text-forest-600 hover:text-forest-950 disabled:opacity-25 active:scale-90 transition-transform"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-7 text-center text-xs font-bold text-forest-950 select-none font-price">
                  {item.qty}
                </span>
                <button
                  type="button"
                  onClick={() => onQtyChange(item.qty + 1)}
                  disabled={!isAvailable || item.qty >= maxStock}
                  className="flex w-8 h-full items-center justify-center text-forest-600 hover:text-forest-950 disabled:opacity-25 active:scale-90 transition-transform"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-xs font-bold text-forest-950 font-price">
                  ৳{lineTotal.toLocaleString()}
                </div>
                {item.qty > 1 && (
                  <div className="text-[10px] text-forest-500 font-price">
                    ৳{currentPrice.toLocaleString()} each
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Desktop Standard Row (sm:flex) */}
      <div className="hidden sm:flex sm:items-center justify-between gap-4 p-5 rounded-2xl border border-forest-200/80 bg-cream-50/90 shadow-2xs transition-all">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-forest-200/80 bg-cream-100/70">
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

        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center h-10 rounded-xl border border-forest-200/90 bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => onQtyChange(item.qty - 1)}
              disabled={!isAvailable || item.qty <= 1}
              className="flex w-9 h-full items-center justify-center text-forest-500 hover:text-forest-950 hover:bg-cream-200/80 disabled:opacity-25 transition-colors cursor-pointer active:scale-90 touch-manipulation"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <span className="w-9 text-center text-xs font-bold text-forest-950 select-none font-price">
              {item.qty}
            </span>

            <button
              type="button"
              onClick={() => onQtyChange(item.qty + 1)}
              disabled={!isAvailable || item.qty >= maxStock}
              className="flex w-9 h-full items-center justify-center text-forest-500 hover:text-forest-950 hover:bg-cream-200/80 disabled:opacity-25 transition-colors cursor-pointer active:scale-90 touch-manipulation"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-right min-w-[95px]">
            <div className="text-sm font-bold text-forest-950 flex-1 font-price">
              ৳{lineTotal.toLocaleString()}
            </div>

            <button
              type="button"
              onClick={onRemove}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-forest-400 hover:text-btn-danger-bg hover:bg-terracotta-100/60 transition-colors cursor-pointer active:scale-90 touch-manipulation"
              aria-label={`Remove ${item.name}`}
              title="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

