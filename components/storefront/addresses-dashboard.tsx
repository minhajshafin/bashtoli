'use client'

import React, { useState } from 'react'
import { AddressList } from './address-list'
import { AddressForm } from './address-form'
import Link from 'next/link'
import { Plus, ArrowLeft } from 'lucide-react'

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
      {/* Top Utility Navigation */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-forest-800/80">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-gold-400 hover:text-gold-300 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Account Overview</span>
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-forest-400">
          SHIPPING BOOK
        </span>
      </div>

      {/* Header card with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-800/80 pb-5">
        <div>
          <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-400/90 mb-1">
            — ADDRESS DIRECTORY · BASHTOLI STATIONERY
          </p>
          <h1 className="text-2xl sm:text-3xl font-medium text-cream-50 tracking-tight font-display">
            Saved Addresses
          </h1>
          <p className="text-xs sm:text-[13px] text-forest-300 mt-1 font-sans leading-relaxed">
            Manage your default and backup shipping options for faster checkout.
          </p>
        </div>

        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto inline-flex h-11 sm:h-10 items-center justify-center gap-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-forest-950 px-5 text-xs sm:text-sm font-sans font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.2]" />
            <span>Add New Address</span>
          </button>
        )}
      </div>

      {/* Add Form Container */}
      {showAddForm && (
        <div className="animate-fade-in">
          <AddressForm onClose={() => setShowAddForm(false)} />
        </div>
      )}

      {/* Addresses List Grid */}
      <AddressList
        addresses={initialAddresses}
        onAddNew={() => setShowAddForm(true)}
      />
    </div>
  )
}
