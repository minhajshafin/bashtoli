'use client'

import React, { useActionState, useTransition } from 'react'
import { addAddressAction, editAddressAction } from '@/lib/actions/addresses'
import { AlertCircle, X, Check } from 'lucide-react'

interface AddressFormProps {
  address?: {
    id: string
    label: string | null
    full_address: string
    phone: string | null
    is_default: boolean
  }
  onClose?: () => void
}

export function AddressForm({ address, onClose }: AddressFormProps) {
  const isEditing = !!address
  const [isPendingTransition, startTransition] = useTransition()

  // Select action function based on whether we are editing or creating
  const actionFn = isEditing
    ? editAddressAction.bind(null, address.id)
    : addAddressAction

  const [state, formAction, isPendingAction] = useActionState(actionFn, { error: null })
  const isPending = isPendingAction || isPendingTransition

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      formAction(formData)
    })
  }

  // Detect successful operations and close form
  React.useEffect(() => {
    if (state.success && onClose) {
      onClose()
    }
  }, [state.success, onClose])

  return (
    <div className="bg-forest-900/95 border border-forest-800 rounded-2xl p-5 sm:p-7 shadow-2xl animate-fade-in text-cream-50">
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-forest-800">
        <h3 className="text-sm sm:text-base font-medium text-cream-50 font-display">
          {isEditing ? 'Edit Saved Address' : 'Add New Address'}
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-forest-400 hover:text-cream-50 hover:bg-forest-800 transition-colors cursor-pointer"
            aria-label="Close form"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {state.error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl bg-terracotta-950/60 border border-terracotta-500/40 px-4 py-3 text-xs font-semibold text-terracotta-200 font-sans"
          >
            <AlertCircle className="h-4 w-4 text-terracotta-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{state.error}</span>
          </div>
        )}

        {/* Address Label */}
        <div className="space-y-1.5">
          <label htmlFor="label" className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-300">
            Address Label
          </label>
          <input
            id="label"
            name="label"
            type="text"
            required
            defaultValue={address?.label || ''}
            disabled={isPending}
            className="block w-full h-12 rounded-xl border border-forest-700 bg-forest-950/80 px-4 text-sm sm:text-base text-cream-50 placeholder-forest-400 focus:border-gold-400 focus:outline-hidden focus:ring-1 focus:ring-gold-400 transition-all font-sans"
            placeholder="e.g. Home, Office, Studio"
          />
          {state.fieldErrors?.label && (
            <p className="text-xs font-semibold text-terracotta-400 mt-1 font-sans">{state.fieldErrors.label[0]}</p>
          )}
        </div>

        {/* Contact Phone Number */}
        <div className="space-y-1.5">
          <label htmlFor="phone" className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-300">
            Contact Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
            defaultValue={address?.phone || ''}
            disabled={isPending}
            className="block w-full h-12 rounded-xl border border-forest-700 bg-forest-950/80 px-4 text-sm sm:text-base text-cream-50 placeholder-forest-400 focus:border-gold-400 focus:outline-hidden focus:ring-1 focus:ring-gold-400 transition-all font-mono tracking-wide"
            placeholder="e.g. 01712345678"
          />
          {state.fieldErrors?.phone && (
            <p className="text-xs font-semibold text-terracotta-400 mt-1 font-sans">{state.fieldErrors.phone[0]}</p>
          )}
        </div>

        {/* Full Address details */}
        <div className="space-y-1.5">
          <label htmlFor="full_address" className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-300">
            Full Shipping Address
          </label>
          <textarea
            id="full_address"
            name="full_address"
            rows={3}
            required
            defaultValue={address?.full_address || ''}
            disabled={isPending}
            className="block w-full rounded-xl border border-forest-700 bg-forest-950/80 p-4 text-sm sm:text-base text-cream-50 placeholder-forest-400 focus:border-gold-400 focus:outline-hidden focus:ring-1 focus:ring-gold-400 transition-all font-sans leading-relaxed"
            placeholder="House, Flat, Road, Area name, City / District"
          />
          {state.fieldErrors?.full_address && (
            <p className="text-xs font-semibold text-terracotta-400 mt-1 font-sans">{state.fieldErrors.full_address[0]}</p>
          )}
        </div>

        {/* Set as Default option */}
        <div className="flex items-center gap-2.5 pt-1">
          <input
            id="is_default"
            name="is_default"
            type="checkbox"
            value="true"
            defaultChecked={address?.is_default || false}
            disabled={isPending}
            className="h-4.5 w-4.5 rounded border-forest-700 bg-forest-950 text-gold-500 focus:ring-gold-500 accent-gold-500 cursor-pointer"
          />
          <label htmlFor="is_default" className="text-xs sm:text-sm font-medium text-cream-100 select-none font-sans cursor-pointer">
            Set as default shipping address
          </label>
        </div>

        {/* Buttons footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-3 border-t border-forest-800">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="inline-flex h-12 sm:h-11 items-center justify-center rounded-xl px-5 text-xs sm:text-sm font-sans font-semibold disabled:opacity-50 active:scale-95 transition-all cursor-pointer bg-forest-800 hover:bg-forest-750 text-cream-100 border border-forest-700"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="btn-accent inline-flex h-12 sm:h-11 items-center justify-center gap-2 rounded-xl px-6 text-xs sm:text-sm font-sans font-bold disabled:opacity-60 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-forest-950 border-t-gold-500" />
                <span>Saving...</span>
              </div>
            ) : isEditing ? (
              <>
                <Check className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Save Address</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
