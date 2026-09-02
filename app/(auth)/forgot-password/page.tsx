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
    <div className="w-full max-w-md bg-forest-900/90 border border-forest-700/80 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-md">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gold-400 font-bold mb-1.5">
          Account Recovery
        </p>
        <h1
          className="text-2xl sm:text-3xl text-cream-100 font-normal tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', lineHeight: 1.15 }}
        >
          Forgot Password
        </h1>
        <p className="mt-1.5 text-xs text-forest-400 font-light leading-relaxed">
          Enter your email address and we will send you a secure link to reset your password.
        </p>
      </div>

      {state.success ? (
        <div className="space-y-5 text-center">
          <div className="rounded-2xl bg-emerald-950/40 border border-emerald-800/80 p-4 text-xs font-semibold text-emerald-300 leading-relaxed">
            If a matching account exists, a password reset link has been sent to your email. Please check your inbox and spam folders.
          </div>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-full bg-gold-500 px-6 text-xs font-bold uppercase tracking-wider text-forest-950 shadow-md shadow-gold-500/20 hover:bg-gold-400 transition-all"
          >
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-2xl bg-rose-950/50 border border-rose-800/80 px-4 py-3 text-xs font-semibold text-rose-300 animate-shake"
            >
              <svg className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{state.error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-gold-400">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
              className="block w-full rounded-xl border border-forest-700 bg-forest-950/70 px-4 py-3 text-sm text-cream-100 placeholder-forest-500 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all"
              placeholder="you@example.com"
            />
            {state.fieldErrors?.email && (
              <p className="text-[11px] font-bold text-rose-400 mt-1">{state.fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-forest-950 shadow-lg shadow-gold-500/20 hover:bg-gold-400 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {isPending ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </div>

          <div className="text-center pt-3 border-t border-forest-800/80">
            <p className="text-xs text-forest-400">
              Remembered your password?{' '}
              <Link
                href="/login"
                className="font-bold text-gold-400 hover:text-gold-300 hover:underline transition-colors"
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
