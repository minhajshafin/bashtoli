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
    <div className="w-full max-w-md bg-cream-100/95 text-forest-950 border border-forest-200/90 rounded-3xl p-5 sm:p-8 shadow-sm selection:bg-gold-500/20 selection:text-forest-900">
      {/* Back Link */}
      <div className="mb-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-forest-600 hover:text-forest-900 font-medium py-1 group"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">&larr;</span>
          <span>Back to Sign In</span>
        </Link>
      </div>

      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-[0.25em] text-forest-500 font-bold mb-1">
          Account Recovery
        </p>
        <h1 className="text-xl sm:text-2xl text-forest-950 font-medium tracking-tight font-display">
          Forgot Password
        </h1>
        <p className="mt-1 text-xs text-forest-600 font-light leading-relaxed">
          Enter your email address and we will send you a secure link to reset your password.
        </p>
      </div>

      {state.success ? (
        <div className="space-y-5 text-center py-2 animate-in fade-in duration-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-900/5 text-forest-800 border border-forest-200/80">
            <svg className="h-7 w-7 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-forest-950 tracking-tight font-display">
            Check Your Email
          </h2>
          <p className="text-xs text-forest-600 max-w-xs mx-auto leading-relaxed font-light">
            If a matching account exists, a password reset link has been sent to your email. Please check your inbox and spam folders.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="btn-primary inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-xs font-bold uppercase tracking-wider"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl bg-terracotta-100 border border-terracotta-500/30 px-3.5 py-2.5 text-xs font-medium text-terracotta-800 animate-in fade-in duration-200"
            >
              <svg className="h-4 w-4 shrink-0 mt-0.5 text-terracotta-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{state.error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-forest-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isPending}
              className="block w-full h-12 rounded-xl border border-input-border bg-input-bg px-4 text-base sm:text-sm text-input-text placeholder-forest-400 focus:border-input-border-focus focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-input-focus-ring transition-all"
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
              className="btn-primary flex w-full h-12 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold uppercase tracking-wider disabled:opacity-60"
            >
              {isPending ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </div>

          <div className="text-center pt-3 border-t border-forest-200/80">
            <p className="text-xs text-forest-600">
              Remembered your password?{' '}
              <Link
                href="/login"
                className="font-bold link-editorial inline-block py-1"
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
