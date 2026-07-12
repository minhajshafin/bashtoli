'use client'

import React from 'react'
import { DELIVERY_FEES } from '@/lib/config/delivery'

interface DeliveryZoneSelectProps {
  fulfillmentType: 'delivery' | 'pickup'
  deliveryZone: 'inside_dhaka' | 'outside_dhaka' | null
  onChange: (fulfillment: 'delivery' | 'pickup', zone: 'inside_dhaka' | 'outside_dhaka' | null) => void
  error?: string[]
}

export function DeliveryZoneSelect({
  fulfillmentType,
  deliveryZone,
  onChange,
  error,
}: DeliveryZoneSelectProps) {
  return (
    <div className="space-y-4">
      {/* Fulfillment Type Selector */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-2">
          Fulfillment Method
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange('delivery', 'inside_dhaka')}
            className={`flex flex-col items-center justify-center rounded-2xl py-4 border text-center transition-all ${
              fulfillmentType === 'delivery'
                ? 'bg-amber-50 border-amber-600 text-amber-700 ring-2 ring-amber-600/20 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-500'
                : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700'
            }`}
          >
            <svg className="h-5 w-5 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-bold">Home Delivery</span>
          </button>
          
          <button
            type="button"
            onClick={() => onChange('pickup', null)}
            className={`flex flex-col items-center justify-center rounded-2xl py-4 border text-center transition-all ${
              fulfillmentType === 'pickup'
                ? 'bg-amber-50 border-amber-600 text-amber-700 ring-2 ring-amber-600/20 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-500'
                : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700'
            }`}
          >
            <svg className="h-5 w-5 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-sm font-bold">Store Pickup</span>
          </button>
        </div>
      </div>

      {/* Conditional Delivery Zone Selector */}
      {fulfillmentType === 'delivery' && (
        <div className="animate-fade-in">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2 dark:text-zinc-500">
            Delivery Zone
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChange('delivery', 'inside_dhaka')}
              className={`flex flex-col items-center justify-center rounded-2xl py-3.5 border text-center transition-all ${
                deliveryZone === 'inside_dhaka'
                  ? 'bg-zinc-900 border-zinc-900 text-white shadow-md dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-900'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <span className="text-sm font-bold">Inside Dhaka</span>
              <span className="text-[10px] opacity-75 mt-0.5">৳{DELIVERY_FEES.inside_dhaka} Fee</span>
            </button>

            <button
              type="button"
              onClick={() => onChange('delivery', 'outside_dhaka')}
              className={`flex flex-col items-center justify-center rounded-2xl py-3.5 border text-center transition-all ${
                deliveryZone === 'outside_dhaka'
                  ? 'bg-zinc-900 border-zinc-900 text-white shadow-md dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-900'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <span className="text-sm font-bold">Outside Dhaka</span>
              <span className="text-[10px] opacity-75 mt-0.5">৳{DELIVERY_FEES.outside_dhaka} Fee</span>
            </button>
          </div>
          {error && <p className="text-rose-600 text-xs mt-1 font-medium">{error[0]}</p>}
        </div>
      )}

      {/* Pickup Address notice */}
      {fulfillmentType === 'pickup' && (
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 text-xs text-zinc-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400">
          <p className="font-bold text-zinc-800 dark:text-zinc-200 mb-1">Store Pickup Location</p>
          <p>Bashtoli Showroom, Road 12, Banani, Dhaka</p>
          <p className="mt-1">Pickup hours: Everyday 10:00 AM - 8:00 PM</p>
        </div>
      )}
    </div>
  )
}
