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
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-cream-200/70 text-forest-500 mb-1 border border-forest-200/60">
          <MapPin className="h-5 w-5 stroke-[1.75]" />
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
            className={`relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all shadow-2xs ${
              address.is_default
                ? 'border-gold-500/70 bg-cream-100/85 ring-1 ring-gold-500/20'
                : 'border-forest-200/80 bg-cream-100/60 hover:bg-cream-100 hover:border-forest-300'
            }`}
          >
            {/* Address Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-forest-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-forest-950 font-sans">
                    {address.label || 'Saved Address'}
                  </span>
                </div>
                {address.is_default && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/20 text-gold-700 border border-gold-400/50 px-2.5 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider">
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

              <p className="text-xs sm:text-[13px] text-forest-600 leading-relaxed whitespace-pre-line font-sans pt-0.5">
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
                    className="inline-flex items-center text-xs font-sans font-semibold uppercase tracking-wider text-gold-600 hover:text-gold-500 disabled:opacity-50 transition-colors cursor-pointer py-1"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-[11px] text-forest-400 font-sans font-medium italic">
                    Primary shipping address
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAddressId(address.id)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-forest-700 hover:text-forest-950 disabled:opacity-50 transition-colors cursor-pointer py-1 px-1.5 rounded-lg hover:bg-cream-200/60"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(address.id)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-terracotta-600 hover:text-terracotta-700 disabled:opacity-50 transition-colors cursor-pointer py-1 px-1.5 rounded-lg hover:bg-terracotta-100/60"
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
