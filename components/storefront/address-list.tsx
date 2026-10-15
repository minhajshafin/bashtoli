'use client'

import React, { useState, useTransition } from 'react'
import { deleteAddressAction, setDefaultAddressAction } from '@/lib/actions/addresses'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
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
  const confirm = useConfirm()
  const { toast } = useToast()
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Handle address deletion
  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete Address?',
      description: 'Are you sure you want to remove this saved delivery address?',
      confirmText: 'Delete Address',
      cancelText: 'Cancel',
      variant: 'danger',
    })
    if (!ok) return

    startTransition(async () => {
      const res = await deleteAddressAction(id)
      if (res.error) {
        toast(res.error, 'error')
      } else {
        toast('Address removed.', 'success')
      }
    })
  }

  // Handle setting default address
  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      const res = await setDefaultAddressAction(id)
      if (res.error) {
        toast(res.error, 'error')
      } else {
        toast('Default address updated.', 'success')
      }
    })
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 border border-dashed border-forest-200/80 bg-cream-100/40 rounded-2xl sm:rounded-3xl space-y-2">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-cream-200/70 text-forest-500 mb-1 border border-forest-200/60">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-forest-950">No saved addresses yet.</p>
        <p className="text-xs text-forest-600">Add an address above to speed up your checkout.</p>
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
            className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-2xs ${
              address.is_default
                ? 'border-gold-500/70 bg-cream-100/80'
                : 'border-forest-200/80 bg-cream-100/60 hover:bg-cream-100 hover:border-forest-300'
            }`}
          >
            {/* Address Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-forest-950 font-sans">
                  {address.label || 'Saved Address'}
                </span>
                {address.is_default && (
                  <span className="inline-flex items-center rounded-full bg-btn-accent-bg text-btn-accent-text border border-gold-400/40 px-2.5 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-bold text-forest-950 font-mono">{address.phone || 'No phone number'}</p>
              <p className="text-xs sm:text-[13px] text-forest-600 leading-relaxed whitespace-pre-line font-sans">
                {address.full_address}
              </p>
            </div>

            {/* Actions list buttons footer */}
            <div className="mt-5 flex items-center justify-between pt-3.5 border-t border-forest-200/60">
              <div>
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    disabled={isPending}
                    className="text-xs font-sans font-semibold uppercase tracking-wider text-text-accent hover:text-text-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Set as Default
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setEditingAddressId(address.id)}
                  disabled={isPending}
                  className="text-xs font-sans font-semibold text-forest-700 hover:text-text-primary disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={isPending}
                  className="text-xs font-sans font-semibold text-terracotta-600 hover:text-terracotta-500 disabled:opacity-50 transition-colors cursor-pointer"
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
