'use client'

import Link from 'next/link'
import React from 'react'

interface CartSummaryProps {
  subtotal: number
  hasUnavailableItems: boolean
  isCartEmpty: boolean
}

export function CartSummary({ subtotal, hasUnavailableItems, isCartEmpty }: CartSummaryProps) {
  const isCheckoutDisabled = isCartEmpty || hasUnavailableItems

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
        Order Summary
      </h2>

      {/* Item totals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            ৳{subtotal.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Shipping</span>
          <span className="italic">Calculated at checkout</span>
        </div>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        {/* Grand subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Total</span>
          <span className="text-lg font-black text-zinc-900 dark:text-zinc-50">
            ৳{subtotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Warnings block */}
      {hasUnavailableItems && (
        <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
          <p className="font-semibold">Checkout Unavailable</p>
          <p className="mt-0.5">Please remove any unavailable items from your cart before proceeding.</p>
        </div>
      )}

      {/* Checkout CTA */}
      <div className="mt-6">
        {isCheckoutDisabled ? (
          <button
            disabled
            className="w-full flex h-12 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-sm font-bold uppercase tracking-wider text-zinc-400 cursor-not-allowed dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-600"
          >
            Proceed to Checkout
          </button>
        ) : (
          <Link
            href="/checkout"
            className="w-full flex h-12 items-center justify-center rounded-xl bg-amber-600 text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-amber-600/10 hover:bg-amber-700 hover:shadow-lg transition-all duration-300"
          >
            Proceed to Checkout
          </Link>
        )}
      </div>

      {/* Secure checkout info */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Bashtoli Secure Checkout</span>
      </div>
    </div>
  )
}
