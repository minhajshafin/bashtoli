'use client'

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginAction, signupAction } from '@/lib/actions/auth'

interface AuthFormProps {
  type: 'login' | 'signup'
}

interface AuthState {
  error: string | null
  success?: boolean
  fieldErrors?: {
    fullName?: string[]
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
  }
}

export function AuthForm({ type }: AuthFormProps) {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || ''

  // Set up password visibility toggling
  const [showPassword, setShowPassword] = useState(false)

  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, { error: null })
  const [signupState, signupFormAction, isSignupPending] = useActionState(signupAction, { error: null })

  const state = (type === 'login' ? loginState : signupState) as AuthState
  const formAction = type === 'login' ? loginFormAction : signupFormAction
  const isPending = type === 'login' ? isLoginPending : isSignupPending

  // If user signed up successfully and needs email confirmation
  if (type === 'signup' && 'success' in state && state.success) {
    return (
      <div className="text-center space-y-5 py-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500 animate-pulse">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Verify Your Email</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
          We sent a verification link to your email address. Please click the link to confirm your account and log in.
        </p>
        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-bold text-white shadow-md hover:bg-zinc-800 transition-colors dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-zinc-150/20 dark:bg-zinc-950 dark:border-zinc-800 dark:shadow-none">
      <form action={formAction} className="space-y-5">
        {/* Hidden inputs to preserve redirection search parameters */}
        {type === 'login' && (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        )}

        {/* Global Error Alert banner */}
        {state.error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3.5 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400 animate-shake"
          >
            <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{state.error}</span>
          </div>
        )}

        {/* Full Name field (Signup Only) */}
        {type === 'signup' && (
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              disabled={isPending}
              className="block w-full rounded-xl border border-zinc-250 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-650"
              placeholder="e.g. Shafin Minhaj"
            />
            {state.fieldErrors?.fullName && (
              <p className="text-[11px] font-bold text-red-500 mt-1">{state.fieldErrors.fullName[0]}</p>
            )}
          </div>
        )}

        {/* Email Address field */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
            className="block w-full rounded-xl border border-zinc-250 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-650"
            placeholder="e.g. shafin@example.com"
          />
          {state.fieldErrors?.email && (
            <p className="text-[11px] font-bold text-red-500 mt-1">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Password
            </label>
            {type === 'login' && (
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 transition-colors"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={type === 'login' ? 'current-password' : 'new-password'}
              required
              disabled={isPending}
              className="block w-full rounded-xl border border-zinc-250 bg-white pl-4 pr-10 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-650"
              placeholder="••••••••"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              {showPassword ? (
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {state.fieldErrors?.password && (
            <p className="text-[11px] font-bold text-red-500 mt-1">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        {/* Confirm Password field (Signup Only) */}
        {type === 'signup' && (
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              disabled={isPending}
              className="block w-full rounded-xl border border-zinc-250 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-650"
              placeholder="••••••••"
            />
            {state.fieldErrors?.confirmPassword && (
              <p className="text-[11px] font-bold text-red-500 mt-1">{state.fieldErrors.confirmPassword[0]}</p>
            )}
          </div>
        )}

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-600/15 hover:bg-amber-700 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {isPending ? (
            <>
              <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              {type === 'login' ? 'Signing in...' : 'Creating Account...'}
            </>
          ) : (
            type === 'login' ? 'Sign In' : 'Create Account'
          )}
        </button>

        {/* Bottom Toggle links */}
        <div className="pt-2 text-center text-xs">
          {type === 'login' ? (
            <p className="text-zinc-500 dark:text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-bold text-amber-600 hover:text-amber-750 hover:underline dark:text-amber-500 dark:hover:text-amber-400"
              >
                Sign up
              </Link>
            </p>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-amber-600 hover:text-amber-750 hover:underline dark:text-amber-500 dark:hover:text-amber-400"
              >
                Log in
              </Link>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
