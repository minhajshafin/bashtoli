'use client'

import React from 'react'
import { DELIVERY_FEES } from '@/lib/config/delivery'
import { formatPrice } from '@/lib/utils/format-price'

interface DeliveryZoneSelectProps {
  fulfillmentType: 'delivery' | 'pickup'
  deliveryZone: 'inside_dhaka' | 'outside_dhaka' | null
  onChange: (fulfillment: 'delivery' | 'pickup', zone: 'inside_dhaka' | 'outside_dhaka' | null) => void
  error?: string[]
}

/**
 * DeliveryZoneSelect
 * Touch-optimized fulfillment method and regional delivery selector.
 * Features 48px+ tactile cards, clear delivery timeframes, and authentic stationery styling.
 */
export function DeliveryZoneSelect({
  fulfillmentType,
  deliveryZone,
  onChange,
  error,
}: DeliveryZoneSelectProps) {
  return (
    <div className="space-y-4">
      {/* 1. Fulfillment Method Selector */}
      <div>
        <label className="text-xs font-semibold text-forest-950 block mb-2 tracking-wide">
          Fulfillment Method
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Home Delivery */}
          <button
            type="button"
            onClick={() => onChange('delivery', deliveryZone || 'inside_dhaka')}
            className={`flex items-center justify-between rounded-md p-3 sm:p-3.5 border text-left cursor-pointer touch-manipulation active:scale-[0.98] transition-transform duration-fast min-h-[52px] ${
              fulfillmentType === 'delivery'
                ? 'bg-forest-950 text-cream-50 border-forest-900 shadow-elevation-1'
                : 'bg-white border-forest-900/15 text-forest-900 hover:bg-cream-100 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors duration-fast ${
                  fulfillmentType === 'delivery'
                    ? 'border-gold-400 bg-gold-400'
                    : 'border-forest-300 bg-white'
                }`}
              >
                {fulfillmentType === 'delivery' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-forest-950" />
                )}
              </span>
              <div className="min-w-0">
                <span className="text-xs sm:text-[13px] font-sans font-semibold block leading-tight">
                  Home Courier
                </span>
                <span className={`text-[10px] block leading-tight mt-0.5 ${
                  fulfillmentType === 'delivery' ? 'text-cream-200/70' : 'text-forest-600'
                }`}>
                  Doorstep delivery
                </span>
              </div>
            </div>
          </button>

          {/* Studio Pickup */}
          <button
            type="button"
            onClick={() => onChange('pickup', null)}
            className={`flex items-center justify-between rounded-md p-3 sm:p-3.5 border text-left cursor-pointer touch-manipulation active:scale-[0.98] transition-transform duration-fast min-h-[52px] ${
              fulfillmentType === 'pickup'
                ? 'bg-forest-950 text-cream-50 border-forest-900 shadow-elevation-1'
                : 'bg-white border-forest-900/15 text-forest-900 hover:bg-cream-100 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors duration-fast ${
                  fulfillmentType === 'pickup'
                    ? 'border-gold-400 bg-gold-400'
                    : 'border-forest-300 bg-white'
                }`}
              >
                {fulfillmentType === 'pickup' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-forest-950" />
                )}
              </span>
              <div className="min-w-0">
                <span className="text-xs sm:text-[13px] font-sans font-semibold block leading-tight">
                  Studio Pickup
                </span>
                <span className={`text-[10px] block leading-tight mt-0.5 ${
                  fulfillmentType === 'pickup' ? 'text-cream-200/70' : 'text-forest-600'
                }`}>
                  Dhaka Outlet
                </span>
              </div>
            </div>
            <span
              className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-sm ${
                fulfillmentType === 'pickup' ? 'text-gold-300 bg-forest-900' : 'text-forest-700 bg-cream-200/80'
              }`}
            >
              Free
            </span>
          </button>
        </div>
      </div>

      {/* 2. Destination Region Selector (When delivery is chosen) */}
      {fulfillmentType === 'delivery' && (
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-forest-950 block tracking-wide">
            Delivery Region &amp; Fee
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Inside Dhaka */}
            <button
              type="button"
              onClick={() => onChange('delivery', 'inside_dhaka')}
              className={`flex items-center justify-between rounded-md p-3.5 sm:p-4 border text-left cursor-pointer touch-manipulation active:scale-[0.98] transition-transform duration-fast min-h-[56px] ${
                deliveryZone === 'inside_dhaka'
                  ? 'bg-cream-100 border-gold-600 text-forest-950 ring-1 ring-gold-600/30 shadow-elevation-1'
                  : 'bg-white border-forest-900/15 text-forest-800 hover:bg-cream-50 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors duration-fast ${
                    deliveryZone === 'inside_dhaka'
                      ? 'border-forest-950 bg-forest-950'
                      : 'border-forest-300 bg-white'
                  }`}
                >
                  {deliveryZone === 'inside_dhaka' && (
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                  )}
                </span>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-sans font-semibold block text-forest-950">
                    Inside Dhaka
                  </span>
                  <span className="text-[10px] text-forest-600 block mt-0.5">
                    24–48 hours · Metro delivery
                  </span>
                </div>
              </div>
              <span className="text-xs font-price font-bold text-forest-950 px-2 py-1 rounded-sm bg-cream-50 border border-forest-900/15 shrink-0">
                {formatPrice(DELIVERY_FEES.inside_dhaka)}
              </span>
            </button>

            {/* Outside Dhaka */}
            <button
              type="button"
              onClick={() => onChange('delivery', 'outside_dhaka')}
              className={`flex items-center justify-between rounded-md p-3.5 sm:p-4 border text-left cursor-pointer touch-manipulation active:scale-[0.98] transition-transform duration-fast min-h-[56px] ${
                deliveryZone === 'outside_dhaka'
                  ? 'bg-cream-100 border-gold-600 text-forest-950 ring-1 ring-gold-600/30 shadow-elevation-1'
                  : 'bg-white border-forest-900/15 text-forest-800 hover:bg-cream-50 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors duration-fast ${
                    deliveryZone === 'outside_dhaka'
                      ? 'border-forest-950 bg-forest-950'
                      : 'border-forest-300 bg-white'
                  }`}
                >
                  {deliveryZone === 'outside_dhaka' && (
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                  )}
                </span>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-sans font-semibold block text-forest-950">
                    Outside Dhaka
                  </span>
                  <span className="text-[10px] text-forest-600 block mt-0.5">
                    3–5 business days · All districts
                  </span>
                </div>
              </div>
              <span className="text-xs font-price font-bold text-forest-950 px-2 py-1 rounded-sm bg-cream-50 border border-forest-900/15 shrink-0">
                {formatPrice(DELIVERY_FEES.outside_dhaka)}
              </span>
            </button>
          </div>
          {/* Reserved slot for inline validation error to prevent layout shifts */}
          <div className="min-h-[1.25rem] text-xs">
            {error && (
              <p className="text-terracotta-600 font-medium flex items-center gap-1.5 animate-fade-in">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z" />
                </svg>
                <span>{error[0]}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. Studio Pickup Address Notice */}
      {fulfillmentType === 'pickup' && (
        <div className="rounded-md border border-gold-400/30 bg-gold-400/10 p-3.5 text-xs text-forest-900 flex items-start gap-2.5">
          <svg className="h-4 w-4 shrink-0 text-gold-700 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold text-forest-950">Bashtoli Stationery Shop</p>
            <p className="text-[11px] text-forest-700 mt-0.5">Gulshan-1, Dhaka · Studio Pickup Hours: Saturday – Thursday, 10 AM – 8 PM</p>
          </div>
        </div>
      )}
    </div>
  )
}
