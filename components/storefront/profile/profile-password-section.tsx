'use client'

import React, { useState, useTransition, useRef } from 'react'
import { updatePasswordAction } from '@/lib/actions/profile'
import { useToast } from '@/components/ui/toast'
import {
  ShieldCheck,
  Lock,
  ChevronDown,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react'

export function ProfilePasswordSection() {
  const { toast } = useToast()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const passwordFormRef = useRef<HTMLFormElement>(null)
  const [isPasswordPending, startPasswordTransition] = useTransition()

  const [passwordState, setPasswordState] = useState<{
    error: string | null
    fieldErrors?: Partial<Record<'newPassword' | 'confirmPassword', string[]>>
  }>({ error: null })

  const handlePasswordSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startPasswordTransition(async () => {
      const res = await updatePasswordAction({ error: null }, formData)
      setPasswordState(res)
      if (res.success) {
        toast('Password updated successfully!', 'success')
        passwordFormRef.current?.reset()
        setIsChangingPassword(false)
      }
    })
  }

  return (
    <div className="rounded-2xl border border-forest-200/90 bg-cream-50 p-5 sm:p-7 shadow-md text-forest-950">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-forest-800 border border-forest-200/90 shadow-2xs">
            <ShieldCheck className="h-5 w-5 stroke-[1.8]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-medium text-forest-950 font-display">
              Password &amp; Security
            </h2>
            <p className="text-xs sm:text-[13px] text-forest-600 font-sans leading-relaxed">
              Ensure your Bashtoli account remains protected.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setPasswordState({ error: null })
            setIsChangingPassword(!isChangingPassword)
          }}
          className="shrink-0 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-forest-200/90 bg-white px-3.5 text-xs font-sans font-semibold text-forest-800 hover:border-gold-500/60 hover:text-gold-700 active:scale-95 transition-all cursor-pointer shadow-2xs"
        >
          <Lock className="h-3.5 w-3.5 text-gold-600" />
          <span className="hidden sm:inline">
            {isChangingPassword ? 'Close' : 'Change Password'}
          </span>
          <span className="sm:hidden">
            {isChangingPassword ? 'Close' : 'Update'}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-forest-500 transition-transform duration-200 ${
              isChangingPassword ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Expandable Password Form */}
      {isChangingPassword && (
        <form
          ref={passwordFormRef}
          onSubmit={handlePasswordSubmit}
          className="mt-5 pt-5 border-t border-forest-200/80 space-y-4 animate-fade-in"
        >
          {passwordState.error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl bg-terracotta-100 border border-terracotta-400/40 p-3.5 text-xs font-semibold text-terracotta-800 font-sans"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-terracotta-600" />
              <span>{passwordState.error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="newPassword"
                className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-forest-700"
              >
                New Password <span className="text-terracotta-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isPasswordPending}
                  placeholder="At least 8 characters"
                  className="block w-full h-12 rounded-xl border border-forest-200/90 bg-white px-4 pr-11 text-sm text-forest-950 placeholder:text-forest-400 focus:border-forest-950 focus:outline-none focus:ring-1 focus:ring-forest-950 transition-all font-sans shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-forest-500 hover:text-forest-950 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordState.fieldErrors?.newPassword && (
                <p className="text-xs font-semibold text-terracotta-600 mt-1 font-sans">
                  {passwordState.fieldErrors.newPassword[0]}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-forest-700"
              >
                Confirm Password <span className="text-terracotta-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isPasswordPending}
                placeholder="Re-enter password"
                className="block w-full h-12 rounded-xl border border-forest-200/90 bg-white px-4 text-sm text-forest-950 placeholder:text-forest-400 focus:border-forest-950 focus:outline-none focus:ring-1 focus:ring-forest-950 transition-all font-sans shadow-2xs"
              />
              {passwordState.fieldErrors?.confirmPassword && (
                <p className="text-xs font-semibold text-terracotta-600 mt-1 font-sans">
                  {passwordState.fieldErrors.confirmPassword[0]}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-forest-200/80">
            <button
              type="submit"
              disabled={isPasswordPending}
              className="btn-accent inline-flex h-12 sm:h-11 items-center justify-center gap-2 rounded-xl px-6 text-xs sm:text-sm font-sans font-bold disabled:opacity-60 active:scale-95 transition-all cursor-pointer shadow-md"
            >
              {isPasswordPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-forest-950 border-t-gold-500" />
                  <span>Updating Password...</span>
                </div>
              ) : (
                <>
                  <Check className="h-4 w-4 text-forest-950" />
                  <span>Save New Password</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsChangingPassword(false)
                setPasswordState({ error: null })
              }}
              disabled={isPasswordPending}
              className="inline-flex h-12 sm:h-11 items-center justify-center rounded-xl border border-forest-200/90 bg-white px-5 text-xs sm:text-sm font-sans font-semibold text-forest-700 hover:text-forest-950 hover:bg-cream-100 disabled:opacity-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
