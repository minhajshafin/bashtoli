'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { lookupOrder, type OrderLookupActionState } from '@/lib/actions/order-lookup'

interface OrderLookupFormProps {
  initialOrderNumber?: string
}

export function OrderLookupForm({ initialOrderNumber = '' }: OrderLookupFormProps) {
  const router = useRouter()
  
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber)
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [topError, setTopError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<NonNullable<OrderLookupActionState['fieldErrors']>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTopError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      const result = await lookupOrder({ order_number: orderNumber, phone })

      if (result.error) {
        setTopError(result.error)
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
      } else if (result.success) {
        // Redirect to order details with verification phone query parameter
        router.push(`/order/${orderNumber}?phone=${encodeURIComponent(phone)}`)
      }
    } catch (err) {
      console.error('Order tracking form submission error:', err)
      setTopError('An unexpected connection error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Top error banner */}
      {topError && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900 animate-fade-in">
          {topError}
        </div>
      )}

      {/* Order Number */}
      <div>
        <label htmlFor="order_number" className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
          Order Number
        </label>
        <input
          type="text"
          id="order_number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="e.g. ORD-20260703-0042"
          className="w-full rounded-xl border border-zinc-200 bg-white py-3 px-4 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          required
        />
        {fieldErrors.order_number && (
          <p className="text-rose-600 text-xs mt-1 font-medium">{fieldErrors.order_number[0]}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 017XXXXXXXX"
          className="w-full rounded-xl border border-zinc-200 bg-white py-3 px-4 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          required
        />
        {fieldErrors.phone && (
          <p className="text-rose-600 text-xs mt-1 font-medium">{fieldErrors.phone[0]}</p>
        )}
      </div>

      {/* Submit Action */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex h-11 items-center justify-center rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
          isSubmitting
            ? 'bg-zinc-150 border border-zinc-200 text-zinc-400 cursor-not-allowed dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-650'
            : 'bg-zinc-900 text-white shadow-md hover:bg-zinc-850 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
            Tracking...
          </span>
        ) : (
          'Track Order'
        )}
      </button>
    </form>
  )
}
