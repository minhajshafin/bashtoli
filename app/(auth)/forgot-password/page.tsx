'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { forgotPasswordAction, type ForgotPasswordState } from '@/lib/actions/auth'

const initialState: ForgotPasswordState = {
  error: null,
}

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: ForgotPasswordState, formData: FormData) => {
      const res = await forgotPasswordAction(prevState, formData)
      return res as ForgotPasswordState
    },
    initialState
  )

  return (
    <div className="w-full max-w-md bg-cream-100/95 text-forest-950 border border-forest-200/90 rounded-3xl p-6 sm:p-8 shadow-sm selection:bg-gold-500/20 selection:text-forest-900">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-forest-500 font-bold mb-1">
          Account Recovery
        </p>
        <h1 className="text-xl sm:text-2xl text-forest-950 font-medium tracking-tight font-display">
          Forgot Password
        </h1>
        <p className="mt-1.5 text-xs text-forest-600 font-light leading-relaxed">
          Enter your email address and we will send you a secure link to reset your password.
        </p>
      </div>

      {state.success ? (
        <div className="space-y-5 text-center">
          <div className="rounded-xl bg-forest-900/5 border border-forest-200 p-4 text-xs font-medium text-forest-800 leading-relaxed">
            If a matching account exists, a password reset link has been sent to your email. Please check your inbox and spam folders.
          </div>
          <Link
            href="/login"
            className="btn-primary inline-flex h-11 items-center justify-center rounded-xl px-6 text-xs font-bold uppercase tracking-wider"
          >
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl bg-terracotta-100 border border-terracotta-500/30 px-3.5 py-2.5 text-xs font-medium text-terracotta-800"
            >
              <svg className="h-4 w-4 shrink-0 mt-0.5 text-terracotta-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{state.error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-forest-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
              className="block w-full rounded-xl border border-input-border bg-input-bg px-3.5 py-2.5 text-xs sm:text-[13px] text-input-text placeholder-forest-400 focus:border-input-border-focus focus:outline-hidden focus:ring-2 focus:ring-input-focus-ring transition-all"
              placeholder="you@example.com"
            />
            {state.fieldErrors?.email && (
              <p className="text-[11px] font-bold text-terracotta-600 mt-0.5">{state.fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-60"
            >
              {isPending ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </div>

          <div className="text-center pt-3 border-t border-forest-200/80">
            <p className="text-xs text-forest-600">
              Remembered your password?{' '}
              <Link
                href="/login"
                className="font-bold link-editorial"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      )}
    </div>
  )
}
