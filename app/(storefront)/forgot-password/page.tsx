'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { forgotPasswordAction, type ForgotPasswordState } from '@/lib/actions/auth'

const initialState: ForgotPasswordState = {
  error: null,
}

/**
 * Forgot Password view page.
 * Renders form requesting reset links, showing security obfuscated success banners.
 */
export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: ForgotPasswordState, formData: FormData) => {
      const res = await forgotPasswordAction(prevState, formData)
      return res as ForgotPasswordState;
    },
    initialState
  )

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm dark:bg-zinc-950 dark:border-zinc-800 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Forgot Password
          </h1>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-normal max-w-xs mx-auto">
            Enter your email address and we will send you a link to reset your account password.
          </p>
        </div>

        {state.success ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900">
            If a matching account exists, a password reset link has been sent to your email address. Please check your inbox and spam folders.
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {state.error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-250 p-4 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900">
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-amber-500"
                placeholder="you@example.com"
              />
              {state.fieldErrors?.email && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-450 font-medium">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-md hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 transition-all dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isPending ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="text-center border-t border-zinc-100 pt-4 dark:border-zinc-900">
          <p className="text-xs text-zinc-550 dark:text-zinc-450">
            Remembered your password?{' '}
            <Link
              href="/login"
              className="font-bold text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
