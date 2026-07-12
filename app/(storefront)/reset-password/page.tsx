'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { resetPasswordAction, type ResetPasswordState } from '@/lib/actions/auth'

const initialState: ResetPasswordState = {
  error: null,
}

/**
 * Reset Password confirmation page.
 * Renders forms allowing authenticated users to change and confirm their credentials.
 */
export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: ResetPasswordState, formData: FormData) => {
      const res = await resetPasswordAction(prevState, formData)
      return res as ResetPasswordState;
    },
    initialState
  )

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm dark:bg-zinc-950 dark:border-zinc-800 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Reset Password
          </h1>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-normal max-w-xs mx-auto">
            Please enter your new password below.
          </p>
        </div>

        {state.success ? (
          <div className="space-y-4 text-center">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900">
              Your password has been successfully reset! You can now log in with your new credentials.
            </div>
            <Link
              href="/login"
              className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-md hover:bg-zinc-800 transition-colors dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {state.error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-250 p-4 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900">
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-amber-500"
                placeholder="Minimum 8 characters"
              />
              {state.fieldErrors?.password && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-450 font-medium">
                  {state.fieldErrors.password[0]}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-amber-500"
                placeholder="Re-enter new password"
              />
              {state.fieldErrors?.confirmPassword && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-450 font-medium">
                  {state.fieldErrors.confirmPassword[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-md hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 transition-all dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isPending ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
