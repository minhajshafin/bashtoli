'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useCart } from '@/lib/cart/cart-context'
import { DeliveryZoneSelect } from './delivery-zone-select'
import { submitCheckout, type CheckoutActionState } from '@/lib/actions/checkout'
import { checkCartItemsAvailability } from '@/lib/queries/cart'
import { DELIVERY_FEES } from '@/lib/config/delivery'
import { ProductImageSkeleton } from '@/components/storefront/product-image-skeleton'
import { formatPrice } from '@/lib/utils/format-price'
import { runWhenIdle } from '@/lib/utils/run-when-idle'

interface SavedAddress {
  id: string
  label: string | null
  full_address: string
  phone: string | null
  is_default: boolean
}

interface CheckoutFormProps {
  savedAddresses?: SavedAddress[]
  userEmail?: string | null
  userFullName?: string | null
  userPhone?: string | null
  userAddress?: string | null
}

/**
 * CheckoutForm
 * Guided checkout form featuring 48px touch inputs, tactile delivery cards,
 * zero layout shift (SSR form structure), and an isolated sticky confirmation bar on mobile.
 */
export function CheckoutForm({
  savedAddresses = [],
  userEmail = null,
  userFullName = null,
  userPhone = null,
  userAddress = null,
}: CheckoutFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const { cart, isLoaded, subtotal, clearCart } = useCart()

  // Form Fields State
  const [customerName, setCustomerName] = useState(userFullName || '')
  const [phone, setPhone] = useState(() => {
    const defaultAddr = savedAddresses.find((a) => a.is_default) || savedAddresses[0]
    return defaultAddr?.phone || userPhone || ''
  })
  const [guestEmail, setGuestEmail] = useState(userEmail || '')
  const [address, setAddress] = useState(() => {
    const defaultAddr = savedAddresses.find((a) => a.is_default) || savedAddresses[0]
    return defaultAddr?.full_address || userAddress || ''
  })
  const [notes, setNotes] = useState('')
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery')
  const [deliveryZone, setDeliveryZone] = useState<'inside_dhaka' | 'outside_dhaka' | null>('inside_dhaka')

  // Validation & Processing States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID())
  const [topError, setTopError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<NonNullable<CheckoutActionState['fieldErrors']>>({})
  const [hasUnavailable, setHasUnavailable] = useState(false)
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false)

  // Verify cart availability deferred to idle to avoid blocking first paint or hydration
  useEffect(() => {
    if (!isLoaded || cart.length === 0) return

    let cancelled = false
    async function checkCart() {
      const ids = cart.map((i) => i.variant_id)
      const results = await checkCartItemsAvailability(ids)
      if (!cancelled) {
        const unavailable = results.some((res) => !res.active)
        setHasUnavailable(unavailable)
      }
    }

    const cancelIdle = runWhenIdle(checkCart, 2500)
    return () => {
      cancelled = true
      cancelIdle()
    }
  }, [isLoaded, cart])

  // Calculate dynamic fees
  const deliveryFee = useMemo(() => {
    return fulfillmentType === 'pickup'
      ? 0
      : deliveryZone
      ? DELIVERY_FEES[deliveryZone]
      : 0
  }, [fulfillmentType, deliveryZone])

  const grandTotal = subtotal + deliveryFee
  const totalItemCount = cart.reduce((acc, item) => acc + item.qty, 0)

  const handleFulfillmentChange = useCallback((
    fulfillment: 'delivery' | 'pickup',
    zone: 'inside_dhaka' | 'outside_dhaka' | null
  ) => {
    setFulfillmentType(fulfillment)
    setDeliveryZone(zone)
  }, [])

  // Normalizer for phone input: keep digits and +
  const handlePhoneChange = useCallback((val: string) => {
    const cleaned = val.replace(/[^\d+]/g, '')
    setPhone(cleaned)
  }, [])

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    // Re-entrancy guard: drop concurrent or double submissions
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true

    setTopError(null)
    setFieldErrors({})

    if (!isLoaded) {
      isSubmittingRef.current = false
      return
    }

    if (cart.length === 0) {
      setTopError('Your shopping bag is empty. Please add items before checking out.')
      isSubmittingRef.current = false
      return
    }

    if (hasUnavailable) {
      setTopError('Your shopping bag contains unavailable items. Please return to your bag to adjust.')
      isSubmittingRef.current = false
      return
    }

    setIsSubmitting(true)

    const payload = {
      customer_name: customerName,
      phone,
      guest_email: guestEmail,
      address,
      fulfillment_type: fulfillmentType,
      delivery_zone: deliveryZone,
      notes,
      idempotency_key: idempotencyKey,
    }

    try {
      const result = await submitCheckout(payload, cart)

      if (result.error) {
        setTopError(result.error)
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
      } else if (result.orderNumber) {
        setIdempotencyKey(crypto.randomUUID())
        clearCart()
        router.refresh()
        const tokenQuery = result.accessToken ? `?token=${encodeURIComponent(result.accessToken)}` : ''
        router.push(`/order/${result.orderNumber}${tokenQuery}`)
      }
    } catch (err) {
      console.error('Checkout submission error:', err)
      setTopError('An unexpected connection error occurred. Please try again.')
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  // Validate single field on blur using shared Zod schema loaded on demand
  const validateFieldOnBlur = async (
    field: 'customer_name' | 'phone' | 'address' | 'guest_email',
    val: string
  ) => {
    try {
      const { checkoutSchema } = await import('@/lib/validations/checkout')
      const schema = checkoutSchema.shape[field]
      const result = schema.safeParse(val)
      if (!result.success) {
        const msg = result.error.issues[0]?.message || 'Invalid value'
        setFieldErrors((prev) => ({ ...prev, [field]: [msg] }))
      }
    } catch {
      // Fallback if import fails
    }
  }

  return (
    <div className="w-full">
      {/* Mobile Top Collapsible Order Summary (<lg) */}
      <div className="lg:hidden mb-5 rounded-md border border-forest-900/10 bg-white overflow-hidden shadow-elevation-1 text-forest-950">
        <button
          type="button"
          onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-sans cursor-pointer text-forest-950 touch-manipulation transition-colors duration-fast"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream-100 text-forest-800 text-[11px]">
              <svg className="w-3.5 h-3.5 text-forest-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              </svg>
            </span>
            <span className="font-semibold text-forest-950">
              {isMobileSummaryOpen ? 'Hide order summary' : `View order summary (${isLoaded ? totalItemCount : '...'} items)`}
            </span>
            <svg
              className={`h-3.5 w-3.5 text-forest-500 transition-transform duration-200 ${
                isMobileSummaryOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          <span className="font-price font-bold text-sm text-forest-950">
            {isLoaded ? formatPrice(grandTotal) : '...'}
          </span>
        </button>

        {isMobileSummaryOpen && (
          <div className="px-4 pb-4 pt-2 border-t border-forest-900/10 space-y-3 bg-cream-50 animate-fade-in">
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {!isLoaded ? (
                <div className="py-4 text-center text-xs text-forest-500">Loading bag items...</div>
              ) : cart.length === 0 ? (
                <div className="py-4 text-center text-xs text-forest-500">Your bag is currently empty.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.variant_id} className="flex items-center gap-3 text-xs">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm border border-forest-900/10 bg-white">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill sizes="48px" className="object-cover" />
                      ) : (
                        <ProductImageSkeleton size="sm" showText={false} />
                      )}
                      <span className="absolute -bottom-1 -right-1 bg-forest-900 text-cream-100 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-forest-700">
                        x{item.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-forest-950 truncate font-semibold text-xs">{item.name}</p>
                      <p className="text-[11px] text-forest-600 truncate">{item.variant_name}</p>
                    </div>
                    <div className="text-forest-950 font-semibold font-price text-xs shrink-0">
                      {formatPrice(item.price * item.qty)}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="pt-2.5 border-t border-forest-900/10 space-y-1.5 text-xs text-forest-700">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-price font-medium text-forest-950">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-price font-medium text-forest-950">
                  {deliveryFee === 0 ? 'Free (Pickup)' : formatPrice(deliveryFee)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left 2 Columns: Information & Delivery Cards */}
        <div className="lg:col-span-2 space-y-5">
          {/* Top Error Alert */}
          {topError && (
            <div className="rounded-md border border-terracotta-400/40 bg-terracotta-100 p-4 text-xs font-sans font-medium text-terracotta-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <svg className="h-4 w-4 shrink-0 mt-0.5 text-terracotta-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span>{topError}</span>
              </div>
              <button
                type="button"
                onClick={() => formRef.current?.requestSubmit()}
                className="shrink-0 px-3.5 py-1.5 rounded-md bg-terracotta-600 hover:bg-terracotta-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer self-start sm:self-center"
              >
                Retry Order
              </button>
            </div>
          )}

          {/* Card 1: Recipient Details */}
          <div className="rounded-md border border-forest-900/10 bg-white p-5 sm:p-6 shadow-elevation-1 space-y-4 text-forest-950">
            <div className="flex items-center justify-between pb-3 border-b border-forest-900/10">
              <h2 className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-forest-700">
                01 · Recipient Details
              </h2>
              <span className="text-[10px] font-mono text-gold-700 font-semibold">Contact &amp; Delivery</span>
            </div>

            {/* Saved Address Shortcuts for Logged-In Customers */}
            {savedAddresses.length > 0 && (
              <div className="pb-3 border-b border-forest-900/10">
                <span className="text-[11px] font-semibold text-forest-800 block mb-2">
                  Use Saved Delivery Address
                </span>
                <div className="flex flex-wrap gap-2">
                  {savedAddresses.map((addr) => {
                    const isSelected = address === addr.full_address && phone === addr.phone
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => {
                          setAddress(addr.full_address)
                          setPhone(addr.phone || '')
                          if (fieldErrors.address || fieldErrors.phone) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              address: undefined,
                              phone: undefined,
                            }))
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-sm border cursor-pointer touch-manipulation active:scale-95 transition-colors duration-fast text-left ${
                          isSelected
                            ? 'bg-forest-950 text-cream-50 border-forest-950 font-medium'
                            : 'bg-cream-50 text-forest-800 border-forest-900/15 hover:bg-cream-100'
                        }`}
                      >
                        <span className="font-semibold">{addr.label || 'Saved Address'}</span>
                        <span className="opacity-70 font-mono text-[11px]"> ({addr.phone || 'No phone'})</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recipient Full Name */}
            <div>
              <label htmlFor="customer_name" className="text-xs font-semibold text-forest-950 block mb-1.5 tracking-wide">
                Full Name <span className="text-gold-700">*</span>
              </label>
              <input
                id="customer_name"
                name="customer_name"
                type="text"
                required
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value)
                  if (fieldErrors.customer_name) {
                    setFieldErrors((prev) => ({ ...prev, customer_name: undefined }))
                  }
                }}
                onBlur={() => validateFieldOnBlur('customer_name', customerName)}
                placeholder="e.g. Arif Rahman"
                autoComplete="name"
                disabled={isSubmitting}
                className={`w-full rounded-md border bg-white px-3.5 py-3 text-xs sm:text-sm text-forest-950 placeholder:text-forest-400/80 focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-600/30 transition-colors duration-fast ${
                  fieldErrors.customer_name
                    ? 'border-terracotta-500 bg-terracotta-50/20'
                    : 'border-forest-900/15'
                }`}
              />
              <div className="min-h-[1.25rem] text-xs">
                {fieldErrors.customer_name && (
                  <p className="text-terracotta-600 font-medium flex items-center gap-1.5 animate-fade-in mt-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z" />
                    </svg>
                    <span>{fieldErrors.customer_name[0]}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Mobile Phone Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="phone" className="text-xs font-semibold text-forest-950 tracking-wide">
                  Mobile Phone Number <span className="text-gold-700">*</span>
                </label>
                <span className="text-[10px] text-forest-500 font-sans">
                  Courier will call before delivery
                </span>
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  handlePhoneChange(e.target.value)
                  if (fieldErrors.phone) {
                    setFieldErrors((prev) => ({ ...prev, phone: undefined }))
                  }
                }}
                onBlur={() => validateFieldOnBlur('phone', phone)}
                placeholder="e.g. 01712-345678"
                autoComplete="tel"
                disabled={isSubmitting}
                className={`w-full rounded-md border bg-white px-3.5 py-3 text-xs sm:text-sm font-mono text-forest-950 placeholder:text-forest-400/80 focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-600/30 transition-colors duration-fast ${
                  fieldErrors.phone
                    ? 'border-terracotta-500 bg-terracotta-50/20'
                    : 'border-forest-900/15'
                }`}
              />
              <div className="min-h-[1.25rem] text-xs">
                {fieldErrors.phone && (
                  <p className="text-terracotta-600 font-medium flex items-center gap-1.5 animate-fade-in mt-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z" />
                    </svg>
                    <span>{fieldErrors.phone[0]}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Full Street Address */}
            <div>
              <label htmlFor="address" className="text-xs font-semibold text-forest-950 block mb-1.5 tracking-wide">
                Delivery Address <span className="text-gold-700">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  if (fieldErrors.address) {
                    setFieldErrors((prev) => ({ ...prev, address: undefined }))
                  }
                }}
                onBlur={() => validateFieldOnBlur('address', address)}
                placeholder="House / Apartment number, Road name, Block / Sector, Area, City"
                autoComplete="street-address"
                disabled={isSubmitting}
                className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-forest-950 placeholder:text-forest-400/80 focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-600/30 transition-colors duration-fast resize-none ${
                  fieldErrors.address
                    ? 'border-terracotta-500 bg-terracotta-50/20'
                    : 'border-forest-900/15'
                }`}
              />
              <div className="min-h-[1.25rem] text-xs">
                {fieldErrors.address && (
                  <p className="text-terracotta-600 font-medium flex items-center gap-1.5 animate-fade-in mt-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z" />
                    </svg>
                    <span>{fieldErrors.address[0]}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Fulfillment & Zone Selection */}
          <div className="rounded-md border border-forest-900/10 bg-white p-5 sm:p-6 shadow-elevation-1 space-y-4 text-forest-950">
            <div className="flex items-center justify-between pb-3 border-b border-forest-900/10">
              <h2 className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-forest-700">
                02 · Fulfillment &amp; Dispatch
              </h2>
              <span className="text-[10px] font-mono text-gold-700 font-semibold">Courier Flat Rates</span>
            </div>

            <DeliveryZoneSelect
              fulfillmentType={fulfillmentType}
              deliveryZone={deliveryZone}
              onChange={handleFulfillmentChange}
              error={fieldErrors.delivery_zone}
            />
          </div>

          {/* Card 3: Optional Notes & Email */}
          <div className="rounded-md border border-forest-900/10 bg-white p-5 sm:p-6 shadow-elevation-1 space-y-4 text-forest-950">
            <div className="flex items-center justify-between pb-3 border-b border-forest-900/10">
              <h2 className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-forest-700">
                03 · Tracking &amp; Special Instructions
              </h2>
              <span className="text-[10px] font-mono text-gold-700 font-semibold">Optional</span>
            </div>

            {/* Email for digital invoice / parcel tracking */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="guest_email" className="text-xs font-semibold text-forest-950 tracking-wide">
                  Email Address
                </label>
                <span className="text-[10px] text-forest-500 font-sans">
                  Receive invoice &amp; dispatch tracking
                </span>
              </div>
              <input
                id="guest_email"
                name="guest_email"
                type="email"
                value={guestEmail}
                onChange={(e) => {
                  setGuestEmail(e.target.value)
                  if (fieldErrors.guest_email) {
                    setFieldErrors((prev) => ({ ...prev, guest_email: undefined }))
                  }
                }}
                onBlur={() => validateFieldOnBlur('guest_email', guestEmail)}
                placeholder="your.email@example.com (optional)"
                autoComplete="email"
                disabled={isSubmitting}
                className={`w-full rounded-md border bg-white px-3.5 py-3 text-xs sm:text-sm text-forest-950 placeholder:text-forest-400/80 focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-600/30 transition-colors duration-fast ${
                  fieldErrors.guest_email
                    ? 'border-terracotta-500 bg-terracotta-50/20'
                    : 'border-forest-900/15'
                }`}
              />
              <div className="min-h-[1.25rem] text-xs">
                {fieldErrors.guest_email && (
                  <p className="text-terracotta-600 font-medium flex items-center gap-1.5 animate-fade-in mt-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z" />
                    </svg>
                    <span>{fieldErrors.guest_email[0]}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Instructions */}
            <div>
              <label htmlFor="notes" className="text-xs font-semibold text-forest-950 block mb-1.5 tracking-wide">
                Special Delivery Notes
              </label>
              <input
                id="notes"
                name="notes"
                type="text"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value)
                  if (fieldErrors.notes) {
                    setFieldErrors((prev) => ({ ...prev, notes: undefined }))
                  }
                }}
                placeholder="e.g. Leave with building security guard, or call after 5 PM"
                disabled={isSubmitting}
                className="w-full rounded-md border border-forest-900/15 bg-white px-3.5 py-3 text-xs sm:text-sm text-forest-950 placeholder:text-forest-400/80 focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-600/30 transition-colors duration-fast"
              />
              <div className="min-h-[1.25rem] text-xs">
                {fieldErrors.notes && (
                  <p className="text-terracotta-600 font-medium flex items-center gap-1.5 animate-fade-in mt-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z" />
                    </svg>
                    <span>{fieldErrors.notes[0]}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Sticky Desktop Order Summary */}
        <div className="lg:col-span-1 rounded-md border border-forest-900/10 bg-white p-5 sm:p-6 shadow-elevation-1 space-y-4 lg:sticky lg:top-24 text-forest-950">
          <div className="flex items-center justify-between pb-3 border-b border-forest-900/10">
            <h2 className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-forest-700">
              Order Summary ({isLoaded ? totalItemCount : '...'})
            </h2>
            <span className="text-[10px] font-mono text-gold-700 font-semibold">Dhaka Shop</span>
          </div>

          {/* Inspection Reassurance Banner */}
          <div className="flex items-start gap-2.5 rounded-md border border-gold-400/30 bg-gold-400/10 p-3 text-xs text-forest-950">
            <svg className="h-4 w-4 shrink-0 text-gold-700 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <p className="text-[11px] font-sans text-forest-800 leading-snug">
              Inspect parcel upon arrival. <strong>Pay in cash</strong> only after you are satisfied.
            </p>
          </div>

          {/* Itemized Cart Items Preview */}
          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {!isLoaded ? (
              <div className="space-y-2.5 py-2">
                <div className="h-12 rounded bg-forest-900/5 animate-pulse" />
                <div className="h-12 rounded bg-forest-900/5 animate-pulse" />
              </div>
            ) : cart.length === 0 ? (
              <div className="py-4 text-center text-xs text-forest-500">
                Your shopping bag is empty.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.variant_id} className="flex items-center gap-3 text-xs">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm border border-forest-900/10 bg-cream-50">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill sizes="48px" className="object-cover" />
                    ) : (
                      <ProductImageSkeleton size="sm" showText={false} />
                    )}
                    <span className="absolute -bottom-1 -right-1 bg-forest-900 text-cream-100 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-forest-700">
                      x{item.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-forest-950 truncate font-semibold text-xs">{item.name}</p>
                    <p className="text-[11px] text-forest-600 truncate">{item.variant_name}</p>
                  </div>
                  <div className="text-forest-950 font-semibold font-price text-xs shrink-0">
                    {formatPrice(item.price * item.qty)}
                  </div>
                </div>
              ))
            )}
          </div>

          <hr className="border-forest-900/10 my-1" />

          {/* Item totals */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs sm:text-[13px] font-sans">
              <span className="text-forest-600">Subtotal</span>
              <span className="font-semibold text-forest-950 font-price">
                {isLoaded ? formatPrice(subtotal) : '...'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-[13px] font-sans">
              <span className="text-forest-600">Delivery Fee</span>
              <span className="font-semibold text-forest-950 font-price">
                {deliveryFee === 0 ? 'Free (Pickup)' : formatPrice(deliveryFee)}
              </span>
            </div>

            <hr className="border-forest-900/10 my-1" />

            {/* Grand Total */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-sm font-semibold text-forest-950 font-sans block">Total Payable</span>
                <span className="text-[10px] text-forest-500 font-sans">Pay upon arrival (COD)</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-forest-950 font-price">
                {isLoaded ? formatPrice(grandTotal) : '...'}
              </span>
            </div>
          </div>

          {/* Desktop Checkout Submit CTA */}
          <div className="pt-2 hidden lg:block">
            <button
              type="submit"
              disabled={isSubmitting || !isLoaded || cart.length === 0 || hasUnavailable}
              className={`btn-accent rounded-md w-full flex min-h-[48px] items-center justify-center text-xs font-sans font-bold uppercase tracking-[0.14em] cursor-pointer touch-manipulation active:scale-[0.98] shadow-elevation-1 transition-transform duration-fast ${
                isSubmitting || !isLoaded || cart.length === 0 || hasUnavailable
                  ? 'opacity-60 cursor-not-allowed'
                  : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest-950 border-t-transparent" />
                  <span>Placing Order...</span>
                </span>
              ) : (
                'Place Order · Cash on Delivery &rarr;'
              )}
            </button>
          </div>

          {/* Safe Checkout Micro-reassurance */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-forest-600 font-sans pt-1">
            <svg className="h-3.5 w-3.5 text-forest-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <span>Verified Cash on Delivery · Safe Checkout</span>
          </div>
        </div>
      </form>

      {/* Sticky Mobile Thumb-Zone Place Order Bar (<lg) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-forest-900/15 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] lg:hidden flex items-center justify-between gap-3 shadow-elevation-3">
        <div className="min-w-0 flex flex-col">
          <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-forest-600">
            Total Payable
          </span>
          <span className="font-price text-lg font-bold text-forest-950 leading-tight">
            {isLoaded ? formatPrice(grandTotal) : '...'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (formRef.current) {
              if (typeof formRef.current.requestSubmit === 'function') {
                formRef.current.requestSubmit()
              } else {
                formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
              }
            }
          }}
          disabled={isSubmitting || !isLoaded || cart.length === 0 || hasUnavailable}
          className={`btn-accent rounded-md flex min-h-[48px] items-center justify-center px-6 text-xs font-sans font-bold uppercase tracking-[0.14em] cursor-pointer touch-manipulation active:scale-[0.98] shadow-elevation-1 transition-transform duration-fast ${
            isSubmitting || !isLoaded || cart.length === 0 || hasUnavailable
              ? 'opacity-60 cursor-not-allowed'
              : ''
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest-950 border-t-transparent" />
              <span>Placing...</span>
            </span>
          ) : (
            'Place Order &rarr;'
          )}
        </button>
      </div>
    </div>
  )
}
