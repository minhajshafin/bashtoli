'use client'

import React, { useActionState, useEffect, useRef } from 'react'
import { promoteUserAction, type PromoteState } from '@/lib/actions/staff'

const initialState: PromoteState = {
  error: null,
}

export function PromoteUserForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(promoteUserAction, initialState)

  // Reset email form input on successful promotion
  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset()
    }
  }, [state.success])

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-800">Add New Staff Member</h2>
        <p className="text-[11px] text-slate-505 mt-0.5">
          Promote an existing customer account to staff by entering their email address.
        </p>
      </div>

      <form ref={formRef} action={formAction} className="space-y-4">
        {state.error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 animate-shake">
            {state.error}
          </div>
        )}

        {state.success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
            User has been promoted to staff successfully!
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
              placeholder="customer@example.com"
              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none disabled:opacity-60"
            />
            {state.fieldErrors?.email && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="h-10 px-5 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-65 active:scale-[0.98]"
          >
            {isPending ? 'Promoting...' : 'Add Staff'}
          </button>
        </div>
      </form>
    </div>
  )
}
