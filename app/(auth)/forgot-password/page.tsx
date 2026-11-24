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
    <div className="w-full max-w-md bg-forest-900/95 text-cream-50 border border-forest-800/90 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-md selection:bg-gold-500/25 selection:text-gold-200">
      {/* Back Link */}
      <div className="mb-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-forest-300 hover:text-gold-300 font-medium py-1 group transition-colors"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">&larr;</span>
          <span>Back to Sign In</span>
        </Link>
      </div>

      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gold-400 font-bold mb-1">
          Account Recovery
        </p>
        <h1 className="text-xl sm:text-2xl text-cream-50 font-medium tracking-tight font-display">
          Forgot Password
        </h1>
        <p className="mt-1 text-xs text-forest-200/90 font-light leading-relaxed">
          Enter your email address and we will send you a secure link to reset your password.
        </p>
      </div>

      {state.success ? (
        <div className="space-y-5 text-center py-2 animate-in fade-in duration-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-950 text-gold-400 border border-forest-800 shadow-inner">
            <svg className="h-7 w-7 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-cream-50 tracking-tight font-display">
            Check Your Email
          </h2>
          <p className="text-xs text-forest-200/90 max-w-xs mx-auto leading-relaxed font-light">
            If a matching account exists, a password reset link has been sent to your email. Please check your inbox and spam folders.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="btn-accent inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-xs font-bold uppercase tracking-wider"
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
              className="flex items-start gap-2.5 rounded-xl bg-terracotta-950/70 border border-terracotta-500/40 px-3.5 py-2.5 text-xs font-medium text-terracotta-200 animate-in fade-in duration-200"
            >
              <svg className="h-4 w-4 shrink-0 mt-0.5 text-terracotta-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{state.error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-gold-300">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isPending}
              className="block w-full h-12 rounded-xl border border-forest-700 bg-forest-950/80 px-4 text-base sm:text-sm text-cream-50 placeholder-forest-400 focus:border-gold-400 focus:bg-forest-950 focus:outline-hidden focus:ring-2 focus:ring-gold-500/25 transition-colors font-sans"
              placeholder="you@example.com"
            />
            {state.fieldErrors?.email && (
              <p className="text-[11px] font-medium text-terracotta-300 mt-0.5">{state.fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="btn-accent flex w-full h-12 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold uppercase tracking-wider disabled:opacity-60 shadow-xs active:scale-[0.99]"
            >
              {isPending ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </div>

          <div className="text-center pt-3 border-t border-forest-800/90">
            <p className="text-xs text-forest-300">
              Remembered your password?{' '}
              <Link
                href="/login"
                className="font-bold text-gold-400 hover:text-gold-300 underline underline-offset-4 decoration-gold-400/40 hover:decoration-gold-300 inline-block py-1 transition-colors"
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
