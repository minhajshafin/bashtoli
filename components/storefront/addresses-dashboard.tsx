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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Saved Addresses
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your default and backup shipping options for faster checkout.
          </p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 text-xs font-bold text-white shadow-md shadow-amber-600/10 hover:bg-amber-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Address
          </button>
        )}
      </div>

      {/* Add Form Container */}
      {showAddForm && (
        <div className="border border-zinc-200 rounded-3xl p-1 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/20">
          <AddressForm onClose={() => setShowAddForm(false)} />
        </div>
      )}

      {/* Addresses List Grid */}
      <AddressList addresses={initialAddresses} />
    </div>
  )
}
