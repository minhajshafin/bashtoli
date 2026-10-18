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
    <div className="rounded-2xl border border-forest-200/80 bg-cream-100/60 p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-forest-200/80">
        <h2 className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-forest-600/90">
          Order Summary
        </h2>
        <span className="text-[10px] font-mono text-gold-600">Dhaka Shop</span>
      </div>

      {/* Complimentary Packaging Note */}
      <div className="flex items-start gap-2.5 rounded-xl border border-gold-400/30 bg-gold-400/10 p-3 text-xs text-forest-900">
        <svg className="h-4 w-4 shrink-0 text-gold-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
        <p className="text-[11px] font-sans text-forest-800 leading-snug">
          All orders receive <strong>complimentary gift wrap</strong> with laid-paper ribbon.
        </p>
      </div>

      {/* Item totals */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs sm:text-[13px] font-sans">
          <span className="text-forest-600">Subtotal</span>
          <span className="font-semibold text-forest-950 font-price">
            ৳{subtotal.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-sans text-forest-600">
          <span>Shipping Fee</span>
          <span className="text-[11px] text-forest-500 font-mono">Calculated at checkout</span>
        </div>

        <hr className="border-forest-200/80 my-2" />

        {/* Grand subtotal */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-forest-950 font-sans">Estimated Total</span>
          <span className="text-lg font-bold text-forest-950 font-price">
            ৳{subtotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Warnings block */}
      {hasUnavailableItems && (
        <div className="rounded-xl bg-terracotta-100 border border-terracotta-400/40 p-3 text-xs text-terracotta-700">
          <p className="font-semibold">Checkout Unavailable</p>
          <p className="mt-0.5 text-[11px]">Please remove any unavailable items from your shopping bag before proceeding.</p>
        </div>
      )}

      {/* Checkout CTA */}
      <div className="pt-2">
        {isCheckoutDisabled ? (
          <button
            disabled
            className="w-full flex h-11 sm:h-12 items-center justify-center rounded-xl bg-cream-200/60 border border-forest-200/60 text-xs font-sans font-medium uppercase tracking-[0.14em] text-forest-400 cursor-not-allowed"
          >
            Proceed to Checkout &rarr;
          </button>
        ) : (
          <Link
            href="/checkout"
            className="btn-accent rounded-xl w-full flex h-11 sm:h-12 items-center justify-center text-xs font-sans font-bold uppercase tracking-[0.14em] cursor-pointer active:scale-95 shadow-xs transition-transform"
          >
            Proceed to Checkout &rarr;
          </Link>
        )}
      </div>

      {/* Secure checkout info */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-forest-500 font-sans">
        <svg className="h-3.5 w-3.5 text-forest-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Verified Cash on Delivery &bull; Safe Checkout</span>
      </div>
    </div>
  )
}

