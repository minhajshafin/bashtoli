'use client'

import Image from 'next/image'
import React from 'react'
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
  const isAvailable = dbStatus ? dbStatus.active === true : true
  const maxStock = dbStatus ? dbStatus.stock_qty : 999
  const currentPrice = dbStatus ? dbStatus.price : item.price

  // Warning check: if price in database differs from snapshot
  const hasPriceChanged = dbStatus && dbStatus.price !== item.price
  // Warning check: if quantity is more than stock in database
  const isOverstocked = dbStatus && item.qty > dbStatus.stock_qty

  const lineTotal = currentPrice * item.qty

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 transition-all">
      <div className="flex items-center gap-4">
        {/* Thumbnail image */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-sm font-bold text-zinc-900 truncate dark:text-zinc-50">
              {item.name}
            </h3>
            {!isAvailable && (
              <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-rose-700 uppercase dark:bg-rose-950/30 dark:text-rose-400">
                Unavailable
              </span>
            )}
          </div>

          <p className="text-xs font-semibold text-zinc-500 mt-0.5 dark:text-zinc-400">
            {item.variant_name}
          </p>

          <div className="flex flex-col gap-1 mt-1">
            {/* Price warnings */}
            <div className="text-xs text-zinc-900 font-bold dark:text-zinc-100">
              ৳{currentPrice.toLocaleString()}
              {hasPriceChanged && (
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-500 ml-1.5 animate-pulse">
                  (Price updated from ৳{item.price})
                </span>
              )}
            </div>
            {isOverstocked && (
              <p className="text-[10px] text-amber-600 font-bold dark:text-amber-500">
                Only {dbStatus?.stock_qty} left in stock. Quantity adjusted.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quantity & Actions split */}
      <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-zinc-100 pt-4 sm:border-0 sm:pt-0">
        {/* Quantity control */}
        <div className="flex items-center h-10 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <button
            type="button"
            onClick={() => onQtyChange(item.qty - 1)}
            disabled={!isAvailable || item.qty <= 1}
            className="flex w-9 h-full items-center justify-center text-zinc-400 hover:text-zinc-700 disabled:opacity-30 dark:hover:text-zinc-200"
            aria-label="Decrease quantity"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>
          
          <span className="w-10 text-center text-xs font-bold text-zinc-900 select-none dark:text-zinc-50">
            {item.qty}
          </span>

          <button
            type="button"
            onClick={() => onQtyChange(item.qty + 1)}
            disabled={!isAvailable || item.qty >= maxStock}
            className="flex w-9 h-full items-center justify-center text-zinc-400 hover:text-zinc-700 disabled:opacity-30 dark:hover:text-zinc-200"
            aria-label="Increase quantity"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Line total & remove action */}
        <div className="flex items-center gap-4 shrink-0 text-right min-w-[100px]">
          <div className="text-sm font-extrabold text-zinc-900 flex-1 dark:text-zinc-50">
            ৳{lineTotal.toLocaleString()}
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="text-zinc-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
            aria-label="Remove item"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
