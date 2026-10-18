'use client'

import React from 'react'
import { DELIVERY_FEES } from '@/lib/config/delivery'

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
            className={`flex items-center justify-between rounded-2xl p-3 sm:p-3.5 border text-left transition-all cursor-pointer touch-manipulation active:scale-[0.98] min-h-[52px] ${
              fulfillmentType === 'delivery'
                ? 'bg-forest-950 text-cream-50 border-forest-900 shadow-xs'
                : 'bg-white border-forest-200/90 text-forest-900 hover:bg-cream-100/60 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
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
                  fulfillmentType === 'delivery' ? 'text-cream-200/70' : 'text-forest-500'
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
            className={`flex items-center justify-between rounded-2xl p-3 sm:p-3.5 border text-left transition-all cursor-pointer touch-manipulation active:scale-[0.98] min-h-[52px] ${
              fulfillmentType === 'pickup'
                ? 'bg-forest-950 text-cream-50 border-forest-900 shadow-xs'
                : 'bg-white border-forest-200/90 text-forest-900 hover:bg-cream-100/60 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
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
                  fulfillmentType === 'pickup' ? 'text-cream-200/70' : 'text-forest-500'
                }`}>
                  Gulshan-1, Dhaka
                </span>
              </div>
            </div>
            <span
              className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
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
              className={`flex items-center justify-between rounded-2xl p-3.5 sm:p-4 border text-left transition-all cursor-pointer touch-manipulation active:scale-[0.98] min-h-[56px] ${
                deliveryZone === 'inside_dhaka'
                  ? 'bg-cream-200/90 border-gold-500 text-forest-950 ring-1 ring-gold-400/40 shadow-xs'
                  : 'bg-white border-forest-200/80 text-forest-800 hover:bg-cream-100/60 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
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
              <span className="text-xs font-price font-bold text-forest-950 px-2 py-1 rounded-lg bg-cream-100 border border-forest-200/90 shrink-0">
                ৳{DELIVERY_FEES.inside_dhaka}
              </span>
            </button>

            {/* Outside Dhaka */}
            <button
              type="button"
              onClick={() => onChange('delivery', 'outside_dhaka')}
              className={`flex items-center justify-between rounded-2xl p-3.5 sm:p-4 border text-left transition-all cursor-pointer touch-manipulation active:scale-[0.98] min-h-[56px] ${
                deliveryZone === 'outside_dhaka'
                  ? 'bg-cream-200/90 border-gold-500 text-forest-950 ring-1 ring-gold-400/40 shadow-xs'
                  : 'bg-white border-forest-200/80 text-forest-800 hover:bg-cream-100/60 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
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
              <span className="text-xs font-price font-bold text-forest-950 px-2 py-1 rounded-lg bg-cream-100 border border-forest-200/90 shrink-0">
                ৳{DELIVERY_FEES.outside_dhaka}
              </span>
            </button>
          </div>
          {error && <p className="text-terracotta-600 text-xs mt-1 font-medium">{error[0]}</p>}
        </div>
      )}

      {/* 3. Studio Pickup Address Notice */}
      {fulfillmentType === 'pickup' && (
        <div className="rounded-2xl border border-gold-400/30 bg-gold-400/10 p-3.5 text-xs text-forest-900 flex items-start gap-2.5">
          <svg className="h-4 w-4 shrink-0 text-gold-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold text-forest-950">Bashtoli Atelier Studio</p>
            <p className="text-[11px] text-forest-700 mt-0.5">Gulshan-1, Dhaka · Open Saturday – Thursday, 10 AM – 8 PM</p>
          </div>
        </div>
      )}
    </div>
  )
}
