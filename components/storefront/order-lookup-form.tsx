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

  const handleSubmit = async (e: React.SyntheticEvent) => {
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
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* Top error banner */}
      {topError && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 animate-fade-in">
          {topError}
        </div>
      )}

      {/* Order Number */}
      <div>
        <label htmlFor="order_number" className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest-700 block mb-1.5">
          Order Number
        </label>
        <input
          type="text"
          id="order_number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="e.g. ORD-20260703-0042"
          className="w-full rounded-full border border-forest-200 bg-cream-50 py-3 px-5 text-sm text-forest-900 placeholder:text-forest-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all font-mono"
          required
        />
        {fieldErrors.order_number && (
          <p className="text-rose-600 text-xs mt-1 font-medium pl-3">{fieldErrors.order_number[0]}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest-700 block mb-1.5">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 017XXXXXXXX"
          className="w-full rounded-full border border-forest-200 bg-cream-50 py-3 px-5 text-sm text-forest-900 placeholder:text-forest-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all font-mono"
          required
        />
        {fieldErrors.phone && (
          <p className="text-rose-600 text-xs mt-1 font-medium pl-3">{fieldErrors.phone[0]}</p>
        )}
      </div>

      {/* Submit Action */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex h-12 items-center justify-center rounded-full text-sm font-bold bg-gold-500 text-forest-900 shadow-sm hover:bg-gold-400 disabled:opacity-50 transition-all active:scale-[0.98] cursor-pointer mt-2"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest-900 border-t-transparent" />
            Tracking...
          </span>
        ) : (
          'Track Order'
        )}
      </button>
    </form>
  )
}
