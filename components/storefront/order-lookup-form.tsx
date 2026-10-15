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
        <div className="rounded-xl bg-terracotta-100 border border-terracotta-500/30 p-4 text-xs font-semibold text-terracotta-800 animate-fade-in font-sans">
          {topError}
        </div>
      )}

      {/* Order Number */}
      <div>
        <label htmlFor="order_number" className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90 block mb-1.5">
          Order Reference
        </label>
        <input
          type="text"
          id="order_number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="e.g. ORD-20260703-0042"
          className="w-full rounded-xl border border-input-border bg-input-bg py-3 px-4 text-sm text-input-text placeholder:text-forest-400 focus:border-input-border-focus focus:outline-hidden focus:ring-2 focus:ring-input-focus-ring transition-all font-mono"
          required
        />
        {fieldErrors.order_number && (
          <p className="text-terracotta-600 text-xs mt-1 font-semibold pl-1 font-sans">{fieldErrors.order_number[0]}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90 block mb-1.5">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 017XXXXXXXX"
          className="w-full rounded-xl border border-input-border bg-input-bg py-3 px-4 text-sm text-input-text placeholder:text-forest-400 focus:border-input-border-focus focus:outline-hidden focus:ring-2 focus:ring-input-focus-ring transition-all font-mono"
          required
        />
        {fieldErrors.phone && (
          <p className="text-terracotta-600 text-xs mt-1 font-semibold pl-1 font-sans">{fieldErrors.phone[0]}</p>
        )}
      </div>

      {/* Submit Action */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full flex h-11 items-center justify-center rounded-xl text-xs sm:text-sm font-sans font-semibold uppercase tracking-wider disabled:opacity-50 mt-2"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-100 border-t-gold-400" />
            Tracking...
          </span>
        ) : (
          'Track Order'
        )}
      </button>
    </form>
  )
}
