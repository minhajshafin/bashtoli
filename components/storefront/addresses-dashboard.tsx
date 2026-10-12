'use client'

import React, { useState } from 'react'
import { AddressList } from './address-list'
import { AddressForm } from './address-form'

interface SavedAddress {
  id: string
  label: string | null
  full_address: string
  phone: string | null
  is_default: boolean
}

interface AddressesDashboardProps {
  initialAddresses: SavedAddress[]
}

export function AddressesDashboard({ initialAddresses }: AddressesDashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header card with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-200/80 pb-5">
        <div>
          <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90 mb-1">
            Shipping Book
          </p>
          <h1 className="text-2xl sm:text-3xl font-medium text-forest-950 tracking-tight font-display">
            Saved Addresses
          </h1>
          <p className="text-xs sm:text-[13px] text-forest-600 mt-1 font-sans leading-relaxed">
            Manage your default and backup shipping options for faster checkout.
          </p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 text-xs sm:text-sm font-sans font-semibold text-cream-50 shadow-2xs hover:bg-gold-500 hover:text-forest-950 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Address
          </button>
        )}
      </div>

      {/* Add Form Container */}
      {showAddForm && (
        <div className="border border-forest-200/80 rounded-2xl p-1 bg-cream-100/60 shadow-2xs">
          <AddressForm onClose={() => setShowAddForm(false)} />
        </div>
      )}

      {/* Addresses List Grid */}
      <AddressList addresses={initialAddresses} />
    </div>
  )
}
