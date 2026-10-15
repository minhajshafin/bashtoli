'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart/cart-context'
import { DeliveryZoneSelect } from './delivery-zone-select'
import { submitCheckout, type CheckoutActionState } from '@/lib/actions/checkout'
import { checkCartItemsAvailability } from '@/lib/actions/cart'
import { DELIVERY_FEES } from '@/lib/config/delivery'
import { ProductImageSkeleton } from '@/components/storefront/product-image-skeleton'

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
 * Harmonized checkout form that seamlessly shares the exact aesthetic, cards,
 * typography, and color palette of /bag and the rest of the Bashtoli storefront.
 */
export function CheckoutForm({
  savedAddresses = [],
  userEmail = null,
  userFullName = null,
  userPhone = null,
  userAddress = null,
}: CheckoutFormProps) {
  const router = useRouter()
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
  const [topError, setTopError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<NonNullable<CheckoutActionState['fieldErrors']>>({})
  const [hasUnavailable, setHasUnavailable] = useState(false)
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false)

  // Verify availability on mount/cart loads
  useEffect(() => {
    if (!isLoaded || cart.length === 0) return

    async function checkCart() {
      const ids = cart.map((i) => i.variant_id)
      const results = await checkCartItemsAvailability(ids)
      const unavailable = results.some((res) => !res.active)
      setHasUnavailable(unavailable)
    }

    checkCart()
  }, [isLoaded, cart])

  if (!isLoaded) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-gold-500 border-t-transparent" />
      </div>
    )
  }

  // Calculate dynamic fees
  const deliveryFee =
    fulfillmentType === 'pickup'
      ? 0
      : deliveryZone
      ? DELIVERY_FEES[deliveryZone]
      : 0
  const grandTotal = subtotal + deliveryFee
  const totalItemCount = cart.reduce((acc, item) => acc + item.qty, 0)

  const handleFulfillmentChange = (
    fulfillment: 'delivery' | 'pickup',
    zone: 'inside_dhaka' | 'outside_dhaka' | null
  ) => {
    setFulfillmentType(fulfillment)
    setDeliveryZone(zone)
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setTopError(null)
    setFieldErrors({})

    if (cart.length === 0) {
      setTopError('Your shopping bag is empty. Please add items before checking out.')
      return
    }

    if (hasUnavailable) {
      setTopError('Your shopping bag contains unavailable items. Please return to your bag to adjust.')
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
    }

    try {
      const result = await submitCheckout(payload, cart)

      if (result.error) {
        setTopError(result.error)
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
      } else if (result.orderNumber) {
        clearCart()
        router.refresh()
        router.push(`/order/${result.orderNumber}?phone=${encodeURIComponent(phone)}`)
      }
    } catch (err) {
      console.error('Checkout submission error:', err)
      setTopError('An unexpected connection error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      {/* Mobile Top Collapsible Order Summary (<lg) */}
      <div className="lg:hidden mb-4 rounded-2xl border border-forest-200/80 bg-cream-100/60 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-sans cursor-pointer text-forest-950"
        >
          <div className="flex items-center gap-2">
            <span className="text-forest-600">🛍</span>
            <span className="font-semibold text-forest-950">
              {isMobileSummaryOpen ? 'Hide order summary' : `Show order summary (${totalItemCount} items)`}
            </span>
            <span className="text-[10px] text-forest-500">
              {isMobileSummaryOpen ? '▲' : '▼'}
            </span>
          </div>
          <span className="font-price font-bold text-sm text-forest-950">
            ৳{grandTotal.toLocaleString()}
          </span>
        </button>

        {isMobileSummaryOpen && (
          <div className="px-4 pb-4 pt-2 border-t border-forest-200/80 space-y-3 bg-cream-50/80">
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.variant_id} className="flex items-center gap-3 text-xs">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-forest-200/80 bg-white">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill sizes="44px" className="object-cover" />
                    ) : (
                      <ProductImageSkeleton size="sm" showText={false} />
                    )}
                    <span className="absolute -bottom-1 -right-1 bg-forest-900 text-cream-100 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-forest-700">
                      ×{item.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-forest-950 truncate font-semibold text-xs">{item.name}</p>
                    <p className="text-[11px] text-forest-600 truncate">{item.variant_name}</p>
                  </div>
                  <div className="text-forest-950 font-semibold font-price text-xs shrink-0">
                    ৳{(item.price * item.qty).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-forest-200/80 space-y-1 text-xs text-forest-700">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-price font-medium text-forest-950">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-price font-medium text-forest-950">
                  {deliveryFee === 0 ? 'Free (Pickup)' : `৳${deliveryFee}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left 2 Columns: Information & Delivery Cards (Matches /bag items list) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Top Error Alert */}
          {topError && (
            <div className="rounded-2xl border border-terracotta-400/40 bg-terracotta-100 p-4 text-xs font-sans font-medium text-terracotta-700">
              {topError}
            </div>
          )}

          {/* Card 1: Recipient Details */}
          <div className="rounded-2xl border border-forest-200/80 bg-cream-50/90 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-forest-200/80">
              <h2 className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-forest-600/90">
                01 · Recipient Details
              </h2>
              <span className="text-[10px] font-mono text-forest-500">Contact for courier</span>
            </div>

            {/* Saved Address Selector */}
            {savedAddresses.length > 0 && (
              <div className="space-y-1.5 pb-2 border-b border-forest-200/80">
                <label className="text-xs font-semibold text-forest-950 block">Saved Addresses</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  {savedAddresses.map((addr) => {
                    const isSelected = address === addr.full_address && phone === addr.phone
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => {
                          setPhone(addr.phone || '')
                          setAddress(addr.full_address)
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs truncate shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? 'btn-primary font-medium shadow-xs'
                            : 'btn-secondary text-forest-800'
                        }`}
                      >
                        {addr.label || 'Saved'} ({addr.phone || 'No phone'})
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Full Name & Phone in 2-Col Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="customer_name" className="text-xs font-semibold text-forest-950 block mb-1.5 tracking-wide">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="customer_name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Shafi Rahman"
                  className="w-full rounded-xl border border-forest-200/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-forest-950 placeholder:text-forest-400/70 focus:border-forest-900 focus:outline-none focus:ring-1 focus:ring-forest-900 transition-all shadow-2xs font-sans"
                  required
                />
                {fieldErrors.customer_name && (
                  <p className="text-terracotta-600 text-xs mt-1 font-medium">{fieldErrors.customer_name[0]}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="phone" className="text-xs font-semibold text-forest-950 tracking-wide">
                    Phone Number *
                  </label>
                  <span className="text-[10px] font-mono text-forest-500">11 digits</span>
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01712345678"
                  className="w-full rounded-xl border border-forest-200/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-forest-950 placeholder:text-forest-400/70 focus:border-forest-900 focus:outline-none focus:ring-1 focus:ring-forest-900 transition-all shadow-2xs font-mono"
                  required
                />
                {fieldErrors.phone && (
                  <p className="text-terracotta-600 text-xs mt-1 font-medium">{fieldErrors.phone[0]}</p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label htmlFor="address" className="text-xs font-semibold text-forest-950 block mb-1.5 tracking-wide">
                {fulfillmentType === 'delivery' ? 'Street Address *' : 'Billing Address *'}
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House #, Road #, Sector/Area, City (e.g. House 14, Road 5, Banani, Dhaka)"
                className="w-full rounded-xl border border-forest-200/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-forest-950 placeholder:text-forest-400/70 focus:border-forest-900 focus:outline-none focus:ring-1 focus:ring-forest-900 transition-all shadow-2xs font-sans"
                required
              />
              {fieldErrors.address && (
                <p className="text-terracotta-600 text-xs mt-1 font-medium">{fieldErrors.address[0]}</p>
              )}
            </div>
          </div>

          {/* Card 2: Fulfillment & Instructions */}
          <div className="rounded-2xl border border-forest-200/80 bg-cream-50/90 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-forest-200/80">
              <h2 className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-forest-600/90">
                02 · Fulfillment &amp; Dispatch
              </h2>
              <span className="text-[10px] font-mono text-gold-600">Cash on Delivery</span>
            </div>

            {/* Delivery Zone / Fulfillment Select */}
            <DeliveryZoneSelect
              fulfillmentType={fulfillmentType}
              deliveryZone={deliveryZone}
              onChange={handleFulfillmentChange}
              error={fieldErrors.delivery_zone}
            />

            {/* Email & Delivery Notes in 2-Col Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="guest_email" className="text-xs font-semibold text-forest-950 tracking-wide">
                    Email Address
                  </label>
                  <span className="text-[10px] font-sans text-forest-500">Optional</span>
                </div>
                <input
                  type="email"
                  id="guest_email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-forest-200/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-forest-950 placeholder:text-forest-400/70 focus:border-forest-900 focus:outline-none focus:ring-1 focus:ring-forest-900 transition-all shadow-2xs font-sans"
                />
                {fieldErrors.guest_email && (
                  <p className="text-terracotta-600 text-xs mt-1 font-medium">{fieldErrors.guest_email[0]}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="notes" className="text-xs font-semibold text-forest-950 tracking-wide">
                    Delivery Notes
                  </label>
                  <span className="text-[10px] font-sans text-forest-500">Optional</span>
                </div>
                <input
                  type="text"
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call before arrival"
                  className="w-full rounded-xl border border-forest-200/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-forest-950 placeholder:text-forest-400/70 focus:border-forest-900 focus:outline-none focus:ring-1 focus:ring-forest-900 transition-all shadow-2xs font-sans"
                />
                {fieldErrors.notes && (
                  <p className="text-terracotta-600 text-xs mt-1 font-medium">{fieldErrors.notes[0]}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Order Summary Card (Exact match of /bag CartSummary) */}
        <div className="lg:col-span-1 rounded-2xl border border-forest-200/80 bg-cream-100/60 p-5 sm:p-6 shadow-2xs space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between pb-3 border-b border-forest-200/80">
            <h2 className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-forest-600/90">
              Order Summary ({totalItemCount})
            </h2>
            <span className="text-[10px] font-mono text-gold-600">Dhaka Shop</span>
          </div>

          {/* Inspection Reassurance Banner */}
          <div className="flex items-start gap-2.5 rounded-xl border border-gold-400/30 bg-gold-400/10 p-3 text-xs text-forest-900">
            <svg className="h-4 w-4 shrink-0 text-gold-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <p className="text-[11px] font-sans text-forest-800 leading-snug">
              Inspect parcel upon arrival. <strong>Pay in cash</strong> only after you are satisfied.
            </p>
          </div>

          {/* Itemized Cart Items Preview */}
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.variant_id} className="flex items-center gap-3 text-xs">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-forest-200/80 bg-white">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill sizes="44px" className="object-cover" />
                  ) : (
                    <ProductImageSkeleton size="sm" showText={false} />
                  )}
                  <span className="absolute -bottom-1 -right-1 bg-forest-900 text-cream-100 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-forest-700">
                    ×{item.qty}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-forest-950 truncate font-semibold text-xs">{item.name}</p>
                  <p className="text-[11px] text-forest-600 truncate">{item.variant_name}</p>
                </div>
                <div className="text-forest-950 font-semibold font-price text-xs shrink-0">
                  ৳{(item.price * item.qty).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <hr className="border-forest-200/80 my-1" />

          {/* Item totals */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs sm:text-[13px] font-sans">
              <span className="text-forest-600">Subtotal</span>
              <span className="font-semibold text-forest-950 font-price">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-[13px] font-sans">
              <span className="text-forest-600">Delivery Fee</span>
              <span className="font-semibold text-forest-950 font-price">
                {deliveryFee === 0 ? 'Free (Pickup)' : `৳${deliveryFee.toLocaleString()}`}
              </span>
            </div>

            <hr className="border-forest-200/80 my-1" />

            {/* Grand Total */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-sm font-semibold text-forest-950 font-sans block">Total Payable</span>
                <span className="text-[10px] text-forest-500 font-sans">Pay upon arrival</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-forest-950 font-price">
                ৳{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Checkout Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0 || hasUnavailable}
              className={`btn-accent rounded-xl w-full flex h-12 items-center justify-center text-xs font-sans font-bold uppercase tracking-[0.14em] cursor-pointer ${
                isSubmitting || cart.length === 0 || hasUnavailable
                  ? 'opacity-60 cursor-not-allowed'
                  : ''
              }`}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order · Cash on Delivery →'}
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
    </div>
  )
}
