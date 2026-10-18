'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { lookupOrder, type OrderLookupActionState } from '@/lib/actions/order-lookup'
import { Search, Phone, FileText, AlertCircle } from 'lucide-react'

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
      const result = await lookupOrder({ order_number: orderNumber.trim(), phone: phone.trim() })

      if (result.error) {
        setTopError(result.error)
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
      } else if (result.success) {
        router.push(`/order/${encodeURIComponent(orderNumber.trim())}?phone=${encodeURIComponent(phone.trim())}`)
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
        <div
          role="alert"
          className="rounded-xl bg-terracotta-100/90 border border-terracotta-500/40 p-3.5 text-xs font-semibold text-terracotta-900 animate-fade-in font-sans flex items-start gap-2.5"
        >
          <AlertCircle className="h-4 w-4 text-terracotta-700 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{topError}</span>
        </div>
      )}

      {/* Order Number */}
      <div>
        <label
          htmlFor="order_number"
          className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90 block mb-1.5"
        >
          <FileText className="h-3.5 w-3.5 text-forest-500" />
          <span>Order Reference</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="order_number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. ORD-20260909-0002"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="w-full h-12 rounded-xl border border-input-border bg-input-bg px-4 text-sm text-input-text placeholder:text-forest-400 focus:border-input-border-focus focus:outline-hidden focus:ring-2 focus:ring-input-focus-ring transition-all font-mono tracking-wide"
            required
          />
        </div>
        {fieldErrors.order_number && (
          <p className="text-terracotta-700 text-xs mt-1.5 font-semibold pl-1 font-sans flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta-600" />
            {fieldErrors.order_number[0]}
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label
          htmlFor="phone"
          className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90 block mb-1.5"
        >
          <Phone className="h-3.5 w-3.5 text-forest-500" />
          <span>Phone Number</span>
        </label>
        <div className="relative">
          <input
            type="tel"
            id="phone"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 017XXXXXXXX"
            className="w-full h-12 rounded-xl border border-input-border bg-input-bg px-4 text-sm text-input-text placeholder:text-forest-400 focus:border-input-border-focus focus:outline-hidden focus:ring-2 focus:ring-input-focus-ring transition-all font-mono tracking-wide"
            required
          />
        </div>
        {fieldErrors.phone && (
          <p className="text-terracotta-700 text-xs mt-1.5 font-semibold pl-1 font-sans flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta-600" />
            {fieldErrors.phone[0]}
          </p>
        )}
        <p className="text-[11px] text-forest-500 font-sans mt-1 pl-1">
          Enter the 11-digit phone number provided at checkout.
        </p>
      </div>

      {/* Submit Action */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full flex h-12 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-sans font-semibold uppercase tracking-wider disabled:opacity-50 mt-3 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-100 border-t-gold-400" />
            Tracking Order...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Track Order
          </span>
        )}
      </button>
    </form>
  )
}
