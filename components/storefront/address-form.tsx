'use client'

import React, { useActionState, useTransition } from 'react'
import { addAddressAction, editAddressAction } from '@/lib/actions/addresses'

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
    <div className="bg-cream-100/90 border border-forest-200/80 rounded-2xl p-6 sm:p-7 shadow-2xs animate-fade-in">
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-forest-200/60">
        <h3 className="text-sm sm:text-base font-medium text-forest-950 font-display">
          {isEditing ? 'Edit Saved Address' : 'Add New Address'}
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-forest-400 hover:text-forest-700 transition-colors cursor-pointer"
            aria-label="Close form"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {state.error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-semibold text-rose-700 font-sans"
          >
            <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{state.error}</span>
          </div>
        )}

        {/* Address Label */}
        <div className="space-y-1.5">
          <label htmlFor="label" className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
            Address Label
          </label>
          <input
            id="label"
            name="label"
            type="text"
            required
            defaultValue={address?.label || ''}
            disabled={isPending}
            className="block w-full rounded-xl border border-forest-200/80 bg-cream-50 px-4 py-2.5 text-sm sm:text-base text-forest-950 placeholder-forest-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all font-sans"
            placeholder="e.g. Home, Office, Studio"
          />
          {state.fieldErrors?.label && (
            <p className="text-xs font-semibold text-rose-600 mt-1 font-sans">{state.fieldErrors.label[0]}</p>
          )}
        </div>

        {/* Contact Phone Number */}
        <div className="space-y-1.5">
          <label htmlFor="phone" className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
            Contact Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            defaultValue={address?.phone || ''}
            disabled={isPending}
            className="block w-full rounded-xl border border-forest-200/80 bg-cream-50 px-4 py-2.5 text-sm sm:text-base text-forest-950 placeholder-forest-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all font-mono"
            placeholder="e.g. 01712345678"
          />
          {state.fieldErrors?.phone && (
            <p className="text-xs font-semibold text-rose-600 mt-1 font-sans">{state.fieldErrors.phone[0]}</p>
          )}
        </div>

        {/* Full Address details */}
        <div className="space-y-1.5">
          <label htmlFor="full_address" className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
            Full Shipping Address
          </label>
          <textarea
            id="full_address"
            name="full_address"
            rows={3}
            required
            defaultValue={address?.full_address || ''}
            disabled={isPending}
            className="block w-full rounded-xl border border-forest-200/80 bg-cream-50 px-4 py-2.5 text-sm sm:text-base text-forest-950 placeholder-forest-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all font-sans leading-relaxed"
            placeholder="House, Flat, Road, Area name, City / District"
          />
          {state.fieldErrors?.full_address && (
            <p className="text-xs font-semibold text-rose-600 mt-1 font-sans">{state.fieldErrors.full_address[0]}</p>
          )}
        </div>

        {/* Set as Default option */}
        <div className="flex items-center gap-2 pt-1.5">
          <input
            id="is_default"
            name="is_default"
            type="checkbox"
            value="true"
            defaultChecked={address?.is_default || false}
            disabled={isPending}
            className="h-4 w-4 rounded border-forest-300 text-gold-500 focus:ring-gold-500 accent-forest-800"
          />
          <label htmlFor="is_default" className="text-xs sm:text-sm font-medium text-forest-700 select-none font-sans">
            Set as default shipping address
          </label>
        </div>

        {/* Buttons footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-forest-200/60">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-forest-200/80 bg-cream-50 px-5 text-xs sm:text-sm font-sans font-semibold text-forest-700 hover:bg-cream-200/60 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-forest-900 px-6 text-xs sm:text-sm font-sans font-semibold text-cream-50 shadow-2xs hover:bg-gold-500 hover:text-forest-950 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-cream-100 border-t-gold-400" />
                <span>Saving...</span>
              </div>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Save Address'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
