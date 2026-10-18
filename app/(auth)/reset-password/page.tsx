'use client'

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import { resetPasswordAction, type ResetPasswordState } from '@/lib/actions/auth'

const initialState: ResetPasswordState = {
  error: null,
}

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, isPending] = useActionState(
    async (prevState: ResetPasswordState, formData: FormData) => {
      const res = await resetPasswordAction(prevState, formData)
      return res as ResetPasswordState
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
          Password Reset
        </p>
        <h1 className="text-xl sm:text-2xl text-forest-950 font-medium tracking-tight font-display">
          New Password
        </h1>
        <p className="mt-1 text-xs text-forest-600 font-light leading-relaxed">
          Please choose a strong new password for your account.
        </p>
      </div>

      {state.success ? (
        <div className="space-y-5 text-center py-2 animate-in fade-in duration-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-900/5 text-forest-800 border border-forest-200/80">
            <svg className="h-7 w-7 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-forest-950 tracking-tight font-display">
            Password Reset Complete
          </h2>
          <p className="text-xs text-forest-600 max-w-xs mx-auto leading-relaxed font-light">
            Your password has been successfully reset! You can now sign in with your new credentials.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="btn-primary inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-xs font-bold uppercase tracking-wider"
            >
              Go to Sign In
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
            <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-forest-700">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                disabled={isPending}
                className="block w-full h-12 rounded-xl border border-input-border bg-input-bg pl-4 pr-12 text-base sm:text-sm text-input-text placeholder-forest-400 focus:border-input-border-focus focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-input-focus-ring transition-all"
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-forest-400 hover:text-forest-700 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-4.5 w-4.5 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {state.fieldErrors?.password && (
              <p className="text-[11px] font-bold text-terracotta-600 mt-0.5">{state.fieldErrors.password[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-[11px] font-bold uppercase tracking-wider text-forest-700">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                disabled={isPending}
                className="block w-full h-12 rounded-xl border border-input-border bg-input-bg pl-4 pr-12 text-base sm:text-sm text-input-text placeholder-forest-400 focus:border-input-border-focus focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-input-focus-ring transition-all"
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-forest-400 hover:text-forest-700 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-4.5 w-4.5 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {state.fieldErrors?.confirmPassword && (
              <p className="text-[11px] font-bold text-terracotta-600 mt-0.5">{state.fieldErrors.confirmPassword[0]}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex w-full h-12 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold uppercase tracking-wider disabled:opacity-60"
            >
              {isPending ? 'Updating Password...' : 'Reset Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
