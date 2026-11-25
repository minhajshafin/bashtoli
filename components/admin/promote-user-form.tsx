'use client'

import React, { useActionState, useEffect, useRef } from 'react'
import { promoteUserAction, type PromoteState } from '@/lib/actions/staff'

const initialState: PromoteState = {
  error: null,
}

export function PromoteUserForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(promoteUserAction, initialState)

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset()
    }
  }, [state.success])

  return (
    <div className="bg-paper-50 border border-paper-300 rounded-2xl p-5 sm:p-6 shadow-subtle space-y-4">
      <div>
        <p className="admin-kicker text-ink-500 mb-0.5">Grant Access</p>
        <h2 className="text-base font-bold text-ink-950">Add New Staff Member</h2>
        <p className="text-xs text-ink-600 mt-0.5">
          Promote an existing customer account to staff by entering their email address.
        </p>
      </div>

      <form ref={formRef} action={formAction} className="space-y-4">
        {state.error && (
          <div
            role="alert"
            className="rounded-xl bg-signal-danger-bg border border-signal-danger-border p-3 text-xs font-semibold text-signal-danger animate-shake"
          >
            {state.error}
          </div>
        )}

        {state.success && (
          <div
            role="status"
            className="rounded-xl bg-ink-950 border border-ink-800 p-3 text-xs font-semibold text-paper-50"
          >
            User has been promoted to staff successfully!
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label
              htmlFor="email"
              className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700"
            >
              Customer Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
              autoComplete="email"
              placeholder="customer@example.com"
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-ink-400/80 bg-paper-50 text-sm text-ink-950 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1 disabled:opacity-60"
            />
            {state.fieldErrors?.email && (
              <p className="text-xs text-signal-danger font-medium">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="min-h-[44px] px-5 rounded-xl bg-ink-950 text-paper-50 text-xs font-bold hover:bg-ink-800 transition-colors disabled:opacity-65 cursor-pointer shrink-0"
          >
            {isPending ? 'Promoting...' : 'Add Staff'}
          </button>
        </div>
      </form>
    </div>
  )
}
