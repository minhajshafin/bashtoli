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
      <div className="text-center py-14 border-2 border-dashed border-forest-200 bg-cream-100/50 rounded-3xl">
        <p className="text-sm font-semibold text-forest-900">No saved addresses yet.</p>
        <p className="text-xs sm:text-sm text-forest-500 mt-1">Add an address above to speed up checkout.</p>
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
            className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
              address.is_default
                ? 'border-gold-500/60 bg-cream-100 shadow-sm'
                : 'border-forest-200 bg-cream-100/70 hover:bg-cream-100 hover:border-forest-300'
            }`}
          >
            {/* Address Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-forest-900">
                  {address.label || 'Saved Address'}
                </span>
                {address.is_default && (
                  <span className="inline-flex items-center rounded-full bg-gold-500 px-2.5 py-0.5 text-[10px] font-bold text-forest-900">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-bold text-forest-900">{address.phone || 'No phone number'}</p>
              <p className="text-xs sm:text-sm text-forest-600 font-light leading-relaxed whitespace-pre-line">
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
                    className="text-xs sm:text-sm font-bold text-gold-600 hover:text-gold-500 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Set as Default
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setEditingAddressId(address.id)}
                  disabled={isPending}
                  className="text-xs sm:text-sm font-semibold text-forest-700 hover:text-forest-900 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={isPending}
                  className="text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50 transition-colors cursor-pointer"
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
