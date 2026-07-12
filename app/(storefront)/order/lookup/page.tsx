import { OrderLookupForm } from '@/components/storefront/order-lookup-form'
import React from 'react'

export const metadata = {
  title: 'Track Order | Bashtoli',
  description: 'Enter your order details to check real-time status and delivery progress.',
}

export default function OrderLookupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm dark:bg-zinc-950 dark:border-zinc-800 space-y-6">
        {/* Page title */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500 mb-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Track Your Order
          </h1>
          <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto leading-normal">
            Enter your order identifier and phone number to review status, subtotal, and delivery items.
          </p>
        </div>

        {/* Tracking Form */}
        <OrderLookupForm />
      </div>
    </div>
  )
}
