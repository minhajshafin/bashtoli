'use client'

import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart/cart-context'
import { DeliveryZoneSelect } from './delivery-zone-select'
import { submitCheckout, type CheckoutActionState } from '@/lib/actions/checkout'
import { checkCartItemsAvailability } from '@/lib/actions/cart'
import { DELIVERY_FEES } from '@/lib/config/delivery'

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
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

  const handleFulfillmentChange = (
    fulfillment: 'delivery' | 'pickup',
    zone: 'inside_dhaka' | 'outside_dhaka' | null
  ) => {
    setFulfillmentType(fulfillment)
    setDeliveryZone(zone)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTopError(null)
    setFieldErrors({})

    if (cart.length === 0) {
      setTopError('Your cart is empty. Please add items before checking out.')
      return
    }

    if (hasUnavailable) {
      setTopError('Your cart contains unavailable items. Please return to the cart to adjust.')
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
        // Clear guest cart in state/localStorage
        clearCart()
        // Redirect to confirmation page with phone verification parameter
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left side: Information Form */}
      <div className="lg:col-span-2 space-y-6 bg-cream-50 border border-forest-200 rounded-3xl p-6 md:p-8">
        <h2 className="text-xl font-bold tracking-tight text-forest-900 border-b border-forest-200 pb-4">
          Delivery Details
        </h2>

        {/* Top-level alert banner */}
        {topError && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm font-semibold text-rose-700 animate-pulse">
            {topError}
          </div>
        )}

        <div className="space-y-4">
          {/* Saved Address Selector */}
          {savedAddresses.length > 0 && (
            <div className="space-y-2 pb-2 border-b border-forest-200">
              <p className="text-xs font-bold uppercase tracking-wider text-gold-500">
                Use Saved Address
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className={`text-left p-3.5 rounded-2xl border transition-all text-xs space-y-1 ${
                        isSelected
                          ? 'border-gold-500 bg-gold-300/20 text-forest-900 font-semibold'
                          : 'border-forest-200 bg-white hover:border-gold-500 text-forest-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold uppercase text-[10px] tracking-wider text-forest-800">
                          {addr.label || 'Saved Address'}
                        </span>
                        {addr.is_default && (
                          <span className="bg-gold-500 text-forest-800 px-1.5 py-0.5 rounded text-[8px] font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-forest-900">{addr.phone || 'No phone number'}</p>
                      <p className="truncate text-forest-600 max-w-full">{addr.full_address}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label htmlFor="customer_name" className="text-xs font-bold uppercase tracking-wider text-gold-500 block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="customer_name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Shafi Rahman"
              className="w-full rounded-xl border border-forest-200 bg-white py-3 px-4 text-sm text-forest-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              required
            />
            {fieldErrors.customer_name && (
              <p className="text-rose-600 text-xs mt-1 font-medium">{fieldErrors.customer_name[0]}</p>
            )}
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-gold-500 block mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 01712345678"
                className="w-full rounded-xl border border-forest-200 bg-white py-3 px-4 text-sm text-forest-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                required
              />
              {fieldErrors.phone && (
                <p className="text-rose-600 text-xs mt-1 font-medium">{fieldErrors.phone[0]}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="guest_email" className="text-xs font-bold uppercase tracking-wider text-gold-500 block mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                id="guest_email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="e.g. customer@example.com"
                className="w-full rounded-xl border border-forest-200 bg-white py-3 px-4 text-sm text-forest-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
              {fieldErrors.guest_email && (
                <p className="text-rose-600 text-xs mt-1 font-medium">{fieldErrors.guest_email[0]}</p>
              )}
            </div>
          </div>

          {/* Delivery Zone / Fulfillment Select */}
          <DeliveryZoneSelect
            fulfillmentType={fulfillmentType}
            deliveryZone={deliveryZone}
            onChange={handleFulfillmentChange}
            error={fieldErrors.delivery_zone}
          />

          {/* Delivery Address */}
          <div>
            <label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-gold-500 block mb-1">
              {fulfillmentType === 'delivery' ? 'Shipping Address *' : 'Billing Address *'}
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={
                fulfillmentType === 'delivery'
                  ? 'House #, Road #, Sector, Area Name, City'
                  : 'Your Billing Address'
              }
              rows={3}
              className="w-full rounded-xl border border-forest-200 bg-white py-3 px-4 text-sm text-forest-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              required
            />
            {fieldErrors.address && (
              <p className="text-rose-600 text-xs mt-1 font-medium">{fieldErrors.address[0]}</p>
            )}
          </div>

          {/* Order Notes */}
          <div>
            <label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-gold-500 block mb-1">
              Order Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Deliver after 5:00 PM, drop at front desk."
              rows={2}
              className="w-full rounded-xl border border-forest-200 bg-white py-3 px-4 text-sm text-forest-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
            {fieldErrors.notes && (
              <p className="text-rose-600 text-xs mt-1 font-medium">{fieldErrors.notes[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Sidebar Order Summary Card */}
      <div className="lg:col-span-1 space-y-6 bg-cream-100 border border-forest-200 rounded-3xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gold-500 border-b border-forest-200 pb-3">
          Your Order
        </h2>

        {/* Itemized List Summary */}
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {cart.map((item) => (
            <div key={item.variant_id} className="flex justify-between text-xs font-medium">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-forest-900 truncate font-semibold">{item.name}</p>
                <p className="text-[10px] text-forest-600 truncate">{item.variant_name} x {item.qty}</p>
              </div>
              <div className="text-forest-900 font-bold shrink-0">
                ৳{(item.price * item.qty).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <hr className="border-forest-200" />

        {/* Totals computation */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-forest-600">Subtotal</span>
            <span className="font-semibold text-forest-900">
              ৳{subtotal.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-forest-600">Shipping Fee</span>
            <span className="font-semibold text-forest-900">
              {deliveryFee === 0 ? 'Free' : `৳${deliveryFee.toLocaleString()}`}
            </span>
          </div>

          <hr className="border-forest-200" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-forest-900">Total</span>
            <span className="text-lg font-black text-forest-900">
              ৳{grandTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Submit action */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0 || hasUnavailable}
            className={`w-full flex h-12 items-center justify-center rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
              isSubmitting || cart.length === 0 || hasUnavailable
                ? 'bg-forest-100 border border-forest-200 text-forest-400 cursor-not-allowed'
                : 'bg-gold-500 text-forest-800 shadow-md shadow-gold-500/20 hover:bg-gold-400 hover:shadow-lg'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest-800 border-t-transparent" />
                Placing Order...
              </span>
            ) : (
              'Place Order (COD)'
            )}
          </button>
        </div>

        {/* Small Payment details note */}
        <p className="text-[10px] text-forest-400 leading-normal text-center">
          Payment is completed via Cash on Delivery. Please verify your phone number and keep the amount ready upon delivery.
        </p>
      </div>
    </form>
  )
}

