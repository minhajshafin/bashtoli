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
 * Fulfillment method and region selector designed to match the warm stationery aesthetic of Bashtoli.
 */
export function DeliveryZoneSelect({
  fulfillmentType,
  deliveryZone,
  onChange,
  error,
}: DeliveryZoneSelectProps) {
  return (
    <div className="space-y-3">
      {/* 1. Fulfillment Method Selector */}
      <div>
        <label className="text-xs font-semibold text-forest-950 block mb-1.5 tracking-wide">
          Fulfillment Method
        </label>
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {/* Home Delivery */}
          <button
            type="button"
            onClick={() => onChange('delivery', deliveryZone || 'inside_dhaka')}
            className={`flex items-center justify-between rounded-xl px-2.5 sm:px-4 py-2.5 border text-left transition-all cursor-pointer ${
              fulfillmentType === 'delivery'
                ? 'bg-forest-950 text-cream-50 border-forest-950 ring-1 ring-forest-950/20 shadow-xs'
                : 'bg-white border-forest-200/80 text-forest-800 hover:border-forest-400 hover:bg-cream-50/50 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <span
                className={`h-3.5 w-3.5 rounded-full border shrink-0 flex items-center justify-center transition-colors ${
                  fulfillmentType === 'delivery'
                    ? 'border-gold-400 bg-gold-400'
                    : 'border-forest-300 bg-white'
                }`}
              >
                {fulfillmentType === 'delivery' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-forest-950" />
                )}
              </span>
              <span className="text-[11px] sm:text-xs font-sans font-medium whitespace-nowrap">
                Home Courier
              </span>
            </div>
          </button>

          {/* Studio Pickup */}
          <button
            type="button"
            onClick={() => onChange('pickup', null)}
            className={`flex items-center justify-between rounded-xl px-2.5 sm:px-4 py-2.5 border text-left transition-all cursor-pointer ${
              fulfillmentType === 'pickup'
                ? 'bg-forest-950 text-cream-50 border-forest-950 ring-1 ring-forest-950/20 shadow-xs'
                : 'bg-white border-forest-200/80 text-forest-800 hover:border-forest-400 hover:bg-cream-50/50 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <span
                className={`h-3.5 w-3.5 rounded-full border shrink-0 flex items-center justify-center transition-colors ${
                  fulfillmentType === 'pickup'
                    ? 'border-gold-400 bg-gold-400'
                    : 'border-forest-300 bg-white'
                }`}
              >
                {fulfillmentType === 'pickup' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-forest-950" />
                )}
              </span>
              <span className="text-[11px] sm:text-xs font-sans font-medium whitespace-nowrap">
                Studio Pickup
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-medium ${
                fulfillmentType === 'pickup' ? 'text-gold-300' : 'text-forest-600'
              }`}
            >
              Free
            </span>
          </button>
        </div>
      </div>

      {/* 2. Destination Region Selector (When delivery is chosen) */}
      {fulfillmentType === 'delivery' && (
        <div className="space-y-1.5 pt-0.5">
          <label className="text-xs font-semibold text-forest-950 block tracking-wide">
            Delivery Region &amp; Fee
          </label>
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {/* Inside Dhaka */}
            <button
              type="button"
              onClick={() => onChange('delivery', 'inside_dhaka')}
              className={`flex items-center justify-between rounded-xl px-2.5 sm:px-4 py-2.5 border text-left transition-all cursor-pointer gap-1.5 ${
                deliveryZone === 'inside_dhaka'
                  ? 'bg-cream-100 border-forest-800 text-forest-950 font-medium ring-1 ring-forest-800/20 shadow-2xs'
                  : 'bg-white border-forest-200/80 text-forest-800 hover:border-forest-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`h-3 w-3 rounded-full border shrink-0 flex items-center justify-center ${
                    deliveryZone === 'inside_dhaka'
                      ? 'border-forest-900 bg-forest-900'
                      : 'border-forest-300 bg-white'
                  }`}
                />
                <span className="text-[11px] sm:text-xs font-sans whitespace-nowrap">Inside Dhaka</span>
              </div>
              <span className="text-[11px] font-price font-bold text-forest-950 px-1.5 sm:px-2 py-0.5 rounded bg-forest-100/60 border border-forest-200/80 shrink-0">
                ৳{DELIVERY_FEES.inside_dhaka}
              </span>
            </button>

            {/* Outside Dhaka */}
            <button
              type="button"
              onClick={() => onChange('delivery', 'outside_dhaka')}
              className={`flex items-center justify-between rounded-xl px-2.5 sm:px-4 py-2.5 border text-left transition-all cursor-pointer gap-1.5 ${
                deliveryZone === 'outside_dhaka'
                  ? 'bg-cream-100 border-forest-800 text-forest-950 font-medium ring-1 ring-forest-800/20 shadow-2xs'
                  : 'bg-white border-forest-200/80 text-forest-800 hover:border-forest-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`h-3 w-3 rounded-full border shrink-0 flex items-center justify-center ${
                    deliveryZone === 'outside_dhaka'
                      ? 'border-forest-900 bg-forest-900'
                      : 'border-forest-300 bg-white'
                  }`}
                />
                <span className="text-[11px] sm:text-xs font-sans whitespace-nowrap">Outside Dhaka</span>
              </div>
              <span className="text-[11px] font-price font-bold text-forest-950 px-1.5 sm:px-2 py-0.5 rounded bg-forest-100/60 border border-forest-200/80 shrink-0">
                ৳{DELIVERY_FEES.outside_dhaka}
              </span>
            </button>
          </div>
          {error && <p className="text-rose-600 text-xs mt-1 font-medium">{error[0]}</p>}
        </div>
      )}

      {/* 3. Studio Pickup Address Notice */}
      {fulfillmentType === 'pickup' && (
        <div className="rounded-xl border border-gold-400/30 bg-gold-400/10 p-3 text-xs text-forest-900 flex items-center justify-between">
          <span>Bashtoli Studio Pickup · Gulshan-1, Dhaka · 10 AM – 8 PM</span>
          <span className="font-mono text-gold-700 font-semibold text-[11px]">Free</span>
        </div>
      )}
    </div>
  )
}
