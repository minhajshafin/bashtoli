'use client'

import React, { useState, useTransition } from 'react'
import { deleteAddressAction, setDefaultAddressAction } from '@/lib/actions/addresses'
import { AddressForm } from './address-form'

interface SavedAddress {
  id: string
  label: string | null
  full_address: string
  phone: string | null
  is_default: boolean
}

interface AddressListProps {
  addresses: SavedAddress[]
}

export function AddressList({ addresses }: AddressListProps) {
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Handle address deletion
  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    startTransition(async () => {
      const res = await deleteAddressAction(id)
      if (res.error) {
        alert(res.error)
      }
    })
  }

  // Handle setting default address
  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      const res = await setDefaultAddressAction(id)
      if (res.error) {
        alert(res.error)
      }
    })
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-3xl dark:border-zinc-800">
        <p className="text-sm font-semibold text-zinc-400">No saved addresses yet.</p>
        <p className="text-xs text-zinc-405 mt-1">Add an address to speed up checkout.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((address) => {
        const isEditing = editingAddressId === address.id

        if (isEditing) {
          return (
            <div key={address.id} className="col-span-1 md:col-span-2">
              <AddressForm
                address={address}
                onClose={() => setEditingAddressId(null)}
              />
            </div>
          )
        }

        return (
          <div
            key={address.id}
            className={`relative flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition-all dark:bg-zinc-950 ${
              address.is_default
                ? 'border-amber-500/50 bg-amber-50/5 dark:border-amber-500/30'
                : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
            }`}
          >
            {/* Address Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  {address.label || 'Saved Address'}
                </span>
                {address.is_default && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-500">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{address.phone || 'No phone number'}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                {address.full_address}
              </p>
            </div>

            {/* Actions list buttons footer */}
            <div className="mt-5 flex items-center justify-between pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80">
              <div>
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    disabled={isPending}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 disabled:opacity-50 transition-colors"
                  >
                    Set Default
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setEditingAddressId(address.id)}
                  disabled={isPending}
                  className="text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 disabled:opacity-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={isPending}
                  className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
