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
    <div className="rounded-2xl border border-forest-200 bg-cream-100 p-6 shadow-sm">
      <h2 className="text-xs font-bold uppercase tracking-wider text-gold-500 mb-4">
        Order Summary
      </h2>

      {/* Item totals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-forest-600">Subtotal</span>
          <span className="font-bold text-forest-900">
            ৳{subtotal.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-forest-600">
          <span>Shipping</span>
          <span className="italic">Calculated at checkout</span>
        </div>

        <hr className="border-forest-200" />

        {/* Grand subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-forest-900">Total</span>
          <span className="text-lg font-black text-forest-900">
            ৳{subtotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Warnings block */}
      {hasUnavailableItems && (
        <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
          <p className="font-semibold">Checkout Unavailable</p>
          <p className="mt-0.5">Please remove any unavailable items from your shopping bag before proceeding.</p>
        </div>
      )}

      {/* Checkout CTA */}
      <div className="mt-6">
        {isCheckoutDisabled ? (
          <button
            disabled
            className="w-full flex h-12 items-center justify-center rounded-xl bg-forest-100 border border-forest-200 text-sm font-bold uppercase tracking-wider text-forest-400 cursor-not-allowed"
          >
            Proceed to Checkout
          </button>
        ) : (
          <Link
            href="/checkout"
            className="w-full flex h-12 items-center justify-center rounded-full bg-gold-500 text-sm font-bold uppercase tracking-wider text-forest-800 shadow-md shadow-gold-500/20 hover:bg-gold-400 transition-all duration-300"
          >
            Proceed to Checkout
          </Link>
        )}
      </div>

      {/* Secure checkout info */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-forest-400 font-medium">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Bashtoli Secure Checkout</span>
      </div>
    </div>
  )
}

