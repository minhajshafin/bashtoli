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

  // On form submit, we run inside a transition to await callbacks cleanly
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
    <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 dark:bg-zinc-900/50 dark:border-zinc-800 animate-fade-in">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
          {isEditing ? 'Edit Saved Address' : 'Add New Address'}
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
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
            className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
          >
            <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{state.error}</span>
          </div>
        )}

        {/* Address Label */}
        <div className="space-y-1.5">
          <label htmlFor="label" className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            Address Label
          </label>
          <input
            id="label"
            name="label"
            type="text"
            required
            defaultValue={address?.label || ''}
            disabled={isPending}
            className="block w-full rounded-xl border border-zinc-250 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-650"
            placeholder="e.g. Home, Office, Work"
          />
          {state.fieldErrors?.label && (
            <p className="text-[11px] font-bold text-red-500 mt-1">{state.fieldErrors.label[0]}</p>
          )}
        </div>

        {/* Contact Phone Number */}
        <div className="space-y-1.5">
          <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            Contact Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            required
            defaultValue={address?.phone || ''}
            disabled={isPending}
            className="block w-full rounded-xl border border-zinc-250 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-650"
            placeholder="e.g. 01712345678"
          />
          {state.fieldErrors?.phone && (
            <p className="text-[11px] font-bold text-red-500 mt-1">{state.fieldErrors.phone[0]}</p>
          )}
        </div>

        {/* Full Address details */}
        <div className="space-y-1.5">
          <label htmlFor="full_address" className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            Full Shipping Address
          </label>
          <textarea
            id="full_address"
            name="full_address"
            rows={3}
            required
            defaultValue={address?.full_address || ''}
            disabled={isPending}
            className="block w-full rounded-xl border border-zinc-250 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-650"
            placeholder="House, Flat, Road, Area name, District"
          />
          {state.fieldErrors?.full_address && (
            <p className="text-[11px] font-bold text-red-500 mt-1">{state.fieldErrors.full_address[0]}</p>
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
            className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-900"
          />
          <label htmlFor="is_default" className="text-xs font-bold text-zinc-650 dark:text-zinc-400 select-none">
            Set as default shipping address
          </label>
        </div>

        {/* Buttons footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-5 text-xs font-bold text-white shadow-md hover:bg-zinc-850 transition-all disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-50 border-t-zinc-400 dark:border-zinc-900 dark:border-t-zinc-500" />
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Add Address'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
