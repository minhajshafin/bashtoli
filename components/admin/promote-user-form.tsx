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
    <div className="bg-adm-surface border border-adm-border rounded-2xl p-5 sm:p-6 shadow-subtle space-y-4">
      <h2 className="text-sm font-semibold text-adm-fg">Add Staff Member</h2>

      <form ref={formRef} action={formAction} className="space-y-4">
        {state.error && (
          <div
            role="alert"
            className="rounded-xl bg-adm-danger-bg border border-adm-danger-border p-3 text-xs font-semibold text-adm-danger animate-shake"
          >
            {state.error}
          </div>
        )}

        {state.success && (
          <div
            role="status"
            className="rounded-xl bg-adm-success-bg border border-adm-success-border p-3 text-xs font-semibold text-adm-success"
          >
            User promoted to staff.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-adm-fg-2"
            >
              Account Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
              autoComplete="email"
              placeholder="name@example.com"
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-adm-input-border bg-adm-surface text-sm text-adm-fg placeholder:text-adm-muted focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1 disabled:opacity-60"
            />
            {state.fieldErrors?.email && (
              <p className="text-xs text-adm-danger font-medium">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="min-h-[44px] px-5 rounded-xl bg-adm-accent text-adm-accent-fg text-xs font-semibold hover:bg-adm-accent-hover transition-colors disabled:opacity-65 cursor-pointer shrink-0"
          >
            {isPending ? 'Adding...' : 'Add Staff'}
          </button>
        </div>
      </form>
    </div>
  )
}
