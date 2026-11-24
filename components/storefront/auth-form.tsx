'use client'

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import { loginAction, signupAction } from '@/lib/actions/auth'

interface AuthFormProps {
  type: 'login' | 'signup'
  redirectTo?: string
  initialError?: string
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

export function AuthForm({ type, redirectTo = '', initialError }: AuthFormProps) {

  // Set up password visibility toggling
  const [showPassword, setShowPassword] = useState(false)

  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, {
    error: initialError || null,
  })
  const [signupState, signupFormAction, isSignupPending] = useActionState(signupAction, { error: null })

  const state = (type === 'login' ? loginState : signupState) as AuthState
  const formAction = type === 'login' ? loginFormAction : signupFormAction
  const isPending = type === 'login' ? isLoginPending : isSignupPending

  // If user signed up successfully and needs email confirmation
  if (type === 'signup' && 'success' in state && state.success) {
    return (
      <div className="w-full max-w-md bg-forest-900/95 text-cream-50 border border-forest-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 selection:bg-gold-500/25 selection:text-gold-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-950 text-gold-400 border border-forest-800 shadow-inner">
          <svg className="h-7 w-7 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-medium text-cream-50 tracking-tight font-display">
          Check Your Inbox
        </h2>
        <p className="text-xs text-forest-200/90 max-w-xs mx-auto leading-relaxed font-light">
          We have sent a verification link to your email. Please confirm your account to start managing your orders and wishlist.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="btn-accent inline-flex h-12 w-full items-center justify-center rounded-xl px-7 text-xs font-bold uppercase tracking-wider"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  const loginUrl = redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : '/login'
  const signupUrl = redirectTo ? `/signup?redirectTo=${encodeURIComponent(redirectTo)}` : '/signup'

  return (
    <div className="w-full max-w-md bg-forest-900/95 text-cream-50 border border-forest-800/90 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-md selection:bg-gold-500/25 selection:text-gold-200">
      {/* Segmented Auth Mode Switcher */}
      <div className="grid grid-cols-2 p-1 bg-forest-950/80 rounded-2xl border border-forest-800/90 mb-5 gap-1">
        <Link
          href={loginUrl}
          className={`h-10 flex items-center justify-center rounded-xl text-xs font-semibold tracking-wide transition-colors ${
            type === 'login'
              ? 'bg-forest-800 text-cream-50 border border-forest-700/80 shadow-xs'
              : 'text-forest-300 hover:text-cream-50 hover:bg-forest-900/60'
          }`}
        >
          Sign In
        </Link>
        <Link
          href={signupUrl}
          className={`h-10 flex items-center justify-center rounded-xl text-xs font-semibold tracking-wide transition-colors ${
            type === 'signup'
              ? 'bg-forest-800 text-cream-50 border border-forest-700/80 shadow-xs'
              : 'text-forest-300 hover:text-cream-50 hover:bg-forest-900/60'
          }`}
        >
          Create Account
        </Link>
      </div>

      {/* Form Header */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl text-cream-50 font-medium tracking-tight font-display">
          {type === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="mt-1 text-xs text-forest-200/90 font-light leading-relaxed">
          {type === 'login'
            ? 'Sign in to access your saved addresses, past orders, and wishlist.'
            : 'Join Bashtoli to save your delivery addresses and track orders.'}
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {/* Hidden inputs to preserve redirection search parameters */}
        {type === 'login' && (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        )}

        {/* Global Error Alert banner */}
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

        {/* Full Name field (Signup Only) */}
        {type === 'signup' && (
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="block text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-gold-300">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              disabled={isPending}
              className="block w-full h-12 rounded-xl border border-forest-700 bg-forest-950/80 px-4 text-base sm:text-sm text-cream-50 placeholder:text-forest-400 focus:border-gold-400 focus:bg-forest-950 focus:outline-hidden focus:ring-2 focus:ring-gold-500/25 transition-colors font-sans"
              placeholder="e.g. Minhaj Shafin"
            />
            {state.fieldErrors?.fullName && (
              <p className="text-[11px] font-medium text-terracotta-300 mt-0.5">{state.fieldErrors.fullName[0]}</p>
            )}
          </div>
        )}

        {/* Email Address field */}
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
            className="block w-full h-12 rounded-xl border border-forest-700 bg-forest-950/80 px-4 text-base sm:text-sm text-cream-50 placeholder:text-forest-400 focus:border-gold-400 focus:bg-forest-950 focus:outline-hidden focus:ring-2 focus:ring-gold-500/25 transition-colors font-sans"
            placeholder="e.g. shafin@example.com"
          />
          {state.fieldErrors?.email && (
            <p className="text-[11px] font-medium text-terracotta-300 mt-0.5">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <label htmlFor="password" className="block text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-gold-300">
              Password
            </label>
            {type === 'login' && (
              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-forest-300 hover:text-gold-300 transition-colors py-1"
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
              className="block w-full h-12 rounded-xl border border-forest-700 bg-forest-950/80 pl-4 pr-12 text-base sm:text-sm text-cream-50 placeholder:text-forest-400 focus:border-gold-400 focus:bg-forest-950 focus:outline-hidden focus:ring-2 focus:ring-gold-500/25 transition-colors font-sans"
              placeholder={type === 'signup' ? 'Minimum 8 characters' : 'Enter your password'}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-forest-400 hover:text-gold-300 transition-colors cursor-pointer"
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
            <p className="text-[11px] font-medium text-terracotta-300 mt-0.5">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        {/* Confirm Password field (Signup Only) */}
        {type === 'signup' && (
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-gold-300">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                disabled={isPending}
                className="block w-full h-12 rounded-xl border border-forest-700 bg-forest-950/80 pl-4 pr-12 text-base sm:text-sm text-cream-50 placeholder:text-forest-400 focus:border-gold-400 focus:bg-forest-950 focus:outline-hidden focus:ring-2 focus:ring-gold-500/25 transition-colors font-sans"
                placeholder="Re-enter password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-forest-400 hover:text-gold-300 transition-colors cursor-pointer"
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
              <p className="text-[11px] font-medium text-terracotta-300 mt-0.5">{state.fieldErrors.confirmPassword[0]}</p>
            )}
          </div>
        )}

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="btn-accent flex w-full h-12 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60 shadow-xs active:scale-[0.99]"
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
        </div>

        {/* Divider */}
        <div className="relative my-3 flex items-center justify-center">
          <div className="w-full border-t border-forest-800/90" />
          <span className="bg-forest-900/95 px-3 text-[10px] font-sans font-semibold text-forest-400 uppercase tracking-wider">
            or
          </span>
          <div className="w-full border-t border-forest-800/90" />
        </div>

        {/* Continue as Guest Button */}
        <Link
          href="/products"
          className="border border-forest-700/80 bg-forest-950/60 text-cream-100 hover:bg-forest-800 hover:text-gold-300 hover:border-gold-500/40 active:scale-[0.99] flex w-full h-12 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition-colors"
        >
          Browse Shop as Guest &rarr;
        </Link>

        {/* Bottom Toggle links */}
        <div className="pt-2 text-center text-xs">
          {type === 'login' ? (
            <p className="text-forest-300">
              Don&apos;t have an account?{' '}
              <Link
                href={signupUrl}
                className="font-bold text-gold-400 hover:text-gold-300 underline underline-offset-4 decoration-gold-400/40 hover:decoration-gold-300 inline-block py-1 transition-colors"
              >
                Sign up
              </Link>
            </p>
          ) : (
            <p className="text-forest-300">
              Already have an account?{' '}
              <Link
                href={loginUrl}
                className="font-bold text-gold-400 hover:text-gold-300 underline underline-offset-4 decoration-gold-400/40 hover:decoration-gold-300 inline-block py-1 transition-colors"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
