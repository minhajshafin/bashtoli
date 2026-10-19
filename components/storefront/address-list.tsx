'use client'

import React, { useState, useTransition } from 'react'
import { deleteAddressAction, setDefaultAddressAction } from '@/lib/actions/addresses'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { AddressForm } from './address-form'
import { MapPin, Phone, Edit2, Trash2, CheckCircle2 } from 'lucide-react'

interface SavedAddress {
  id: string
  label: string | null
  full_address: string
  phone: string | null
  is_default: boolean
}

interface AddressListProps {
  addresses: SavedAddress[]
  onAddNew?: () => void
}

export function AddressList({ addresses, onAddNew }: AddressListProps) {
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
      <div className="text-center py-12 sm:py-16 border border-forest-200/90 bg-cream-50 rounded-2xl sm:rounded-3xl space-y-2 shadow-md text-forest-950">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-forest-950 text-gold-400 mb-2 border border-forest-800 shadow-2xs">
          <MapPin className="h-5 w-5 stroke-[1.75]" />
        </div>
        <p className="text-sm font-semibold text-forest-950 font-display">No saved addresses yet.</p>
        <p className="text-xs text-forest-600 font-sans max-w-sm mx-auto">Add an address to speed up checkout on your future stationery orders.</p>
        {onAddNew && (
          <div className="pt-3">
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider text-forest-900 hover:text-forest-950 transition-colors cursor-pointer"
            >
              <span>Add your first address</span>
              <span>→</span>
            </button>
          </div>
        )}
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
            className={`relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all shadow-md bg-cream-50 text-forest-950 ${
              address.is_default
                ? 'border-gold-500/80 ring-1 ring-gold-400/40'
                : 'border-forest-200/90 hover:border-forest-300'
            }`}
          >
            {/* Address Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-forest-700 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-forest-950 font-sans">
                    {address.label || 'Saved Address'}
                  </span>
                </div>
                {address.is_default && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 text-gold-800 border border-gold-300/80 px-2.5 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3 text-gold-600" />
                    <span>Default</span>
                  </span>
                )}
              </div>

              {address.phone && (
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-forest-800">
                  <Phone className="h-3 w-3 text-forest-500" />
                  <span>{address.phone}</span>
                </div>
              )}

              <p className="text-xs sm:text-[13px] text-forest-700 leading-relaxed whitespace-pre-line font-sans pt-0.5">
                {address.full_address}
              </p>
            </div>

            {/* Actions list buttons footer */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-forest-200/60">
              <div>
                {!address.is_default ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address.id)}
                    disabled={isPending}
                    className="inline-flex items-center text-xs font-sans font-semibold uppercase tracking-wider text-gold-600 hover:text-gold-700 disabled:opacity-50 transition-colors cursor-pointer py-1"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-[11px] text-forest-500 font-sans font-medium italic">
                    Primary shipping address
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAddressId(address.id)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-forest-700 hover:text-forest-950 disabled:opacity-50 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-forest-100/60"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(address.id)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-terracotta-600 hover:text-terracotta-700 disabled:opacity-50 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-terracotta-100/60"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
