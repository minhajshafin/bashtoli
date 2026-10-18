'use client'

import React, { useTransition, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfileAction, updatePasswordAction, deleteAccountAction } from '@/lib/actions/profile'
import { useToast } from '@/components/ui/toast'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Trash2,
  Check,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react'

interface ProfileFormProps {
  profile: {
    id: string
    full_name: string | null
    phone: string | null
    address: string | null
    role: string
  } | null
  email: string | null
}

/**
 * Customer Profile Settings Form.
 * Dedicated mobile-first layout with grouped inset sections, 48px tactile inputs,
 * direct inline editing, and smooth animated security accordions.
 */
export function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Password accordion state
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const passwordFormRef = useRef<HTMLFormElement>(null)

  // Danger Zone Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Saved feedback state
  const [isJustSaved, setIsJustSaved] = useState(false)

  // Transitions
  const [isProfilePending, startProfileTransition] = useTransition()
  const [isPasswordPending, startPasswordTransition] = useTransition()
  const [isDeletePending, startDeleteTransition] = useTransition()

  // Form State
  const [profileState, setProfileState] = useState<{
    error: string | null
    fieldErrors?: Partial<Record<'fullName' | 'phone' | 'address', string[]>>
  }>({ error: null })

  const [passwordState, setPasswordState] = useState<{
    error: string | null
    fieldErrors?: Partial<Record<'newPassword' | 'confirmPassword', string[]>>
  }>({ error: null })

  const handleProfileSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startProfileTransition(async () => {
      const res = await updateProfileAction({ error: null }, formData)
      setProfileState(res)
      if (res.success) {
        setIsJustSaved(true)
        setTimeout(() => setIsJustSaved(false), 2000)
        toast('Profile details updated successfully!', 'success')
      }
    })
  }

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

  const handleDeleteSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setDeleteError(null)
    const formData = new FormData()
    formData.append('confirmation', deleteConfirmation)

    startDeleteTransition(async () => {
      const res = await deleteAccountAction({ error: null }, formData)
      if (res.error) {
        setDeleteError(res.error)
      } else if (res.success) {
        toast('Your account has been deleted successfully.', 'info')
        router.push('/')
      }
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* 1. Personal & Delivery Information Card */}
      <div className="rounded-2xl border border-forest-800/90 bg-forest-900/80 p-4 sm:p-7 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 border-b border-forest-800/70 pb-4 mb-5">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-forest-950 text-gold-400 border border-gold-500/30 shadow-inner">
            <User className="h-5 w-5 stroke-[1.8]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-medium text-cream-50 font-display">
              Personal Information
            </h2>
            <p className="text-xs sm:text-[13px] text-cream-200/70 font-sans leading-relaxed">
              Your name, contact details, and default shipping address.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {profileState.error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl bg-terracotta-950/70 border border-terracotta-500/50 p-3.5 text-xs font-semibold text-terracotta-200 font-sans"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-terracotta-400" />
              <span>{profileState.error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="fullName"
                className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-400/90"
              >
                Full Name <span className="text-gold-400">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                defaultValue={profile?.full_name || ''}
                disabled={isProfilePending}
                placeholder="e.g. Shafi Rahman"
                className="block w-full h-12 rounded-xl border border-forest-700/80 bg-forest-950/80 px-4 text-sm sm:text-base text-cream-50 placeholder-forest-500 focus:border-gold-400 focus:outline-hidden focus:ring-2 focus:ring-gold-400/20 transition-all font-sans"
              />
              {profileState.fieldErrors?.fullName && (
                <p className="text-xs font-semibold text-terracotta-400 mt-1 font-sans">
                  {profileState.fieldErrors.fullName[0]}
                </p>
              )}
            </div>

            {/* Email (Read-Only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="email"
                  className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-400/90"
                >
                  Email Address
                </label>
                <span className="text-[10px] font-medium text-forest-400 font-mono">
                  Read-only
                </span>
              </div>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email || ''}
                  readOnly
                  disabled
                  className="block w-full h-12 rounded-xl border border-forest-800/80 bg-forest-950/40 px-4 pl-10 text-sm sm:text-base text-cream-200/60 cursor-not-allowed select-none font-sans"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Contact Phone Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="phone"
                className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-400/90"
              >
                Phone Number
              </label>
              <span className="text-[10px] font-semibold text-forest-400 font-sans">
                Optional
              </span>
            </div>
            <div className="relative">
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                defaultValue={profile?.phone || ''}
                disabled={isProfilePending}
                placeholder="e.g. 01712345678"
                className="block w-full h-12 rounded-xl border border-forest-700/80 bg-forest-950/80 px-4 pl-10 text-sm sm:text-base text-cream-50 placeholder-forest-500 focus:border-gold-400 focus:outline-hidden focus:ring-2 focus:ring-gold-400/20 transition-all font-mono tracking-wide"
              />
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-400 pointer-events-none" />
            </div>
            {profileState.fieldErrors?.phone && (
              <p className="text-xs font-semibold text-terracotta-400 mt-1 font-sans">
                {profileState.fieldErrors.phone[0]}
              </p>
            )}
          </div>

          {/* Default Address */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="address"
                className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-400/90"
              >
                Default Shipping Address
              </label>
              <span className="text-[10px] font-semibold text-forest-400 font-sans">
                Optional
              </span>
            </div>
            <div className="relative">
              <textarea
                id="address"
                name="address"
                rows={3}
                defaultValue={profile?.address || ''}
                disabled={isProfilePending}
                placeholder="e.g. House #12, Road #4, Uttara, Dhaka"
                className="block w-full rounded-xl border border-forest-700/80 bg-forest-950/80 p-4 pl-10 text-sm sm:text-base text-cream-50 placeholder-forest-500 focus:border-gold-400 focus:outline-hidden focus:ring-2 focus:ring-gold-400/20 transition-all font-sans leading-relaxed"
              />
              <MapPin className="absolute left-3.5 top-4 h-4 w-4 text-forest-400 pointer-events-none" />
            </div>
            {profileState.fieldErrors?.address && (
              <p className="text-xs font-semibold text-terracotta-400 mt-1 font-sans">
                {profileState.fieldErrors.address[0]}
              </p>
            )}
          </div>

          {/* Save Changes CTA */}
          <div className="pt-3 border-t border-forest-800/70">
            <button
              type="submit"
              disabled={isProfilePending}
              className={`w-full sm:w-auto inline-flex h-12 sm:h-11 items-center justify-center gap-2 rounded-xl px-7 text-xs sm:text-sm font-sans font-bold active:scale-95 transition-all shadow-md cursor-pointer ${
                isJustSaved
                  ? 'bg-forest-900 text-gold-300 border border-gold-400/70'
                  : 'btn-accent'
              }`}
            >
              {isProfilePending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-forest-950 border-t-gold-500" />
                  <span>Saving Changes...</span>
                </div>
              ) : isJustSaved ? (
                <>
                  <Check className="h-4 w-4 text-gold-300" />
                  <span>Saved Successfully ✓</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 text-forest-950" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Password & Security Card (Collapsible Accordion) */}
      <div className="rounded-2xl border border-forest-800/90 bg-forest-900/80 p-4 sm:p-7 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-forest-950 text-gold-400 border border-gold-500/30 shadow-inner">
              <ShieldCheck className="h-5 w-5 stroke-[1.8]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-medium text-cream-50 font-display">
                Password &amp; Security
              </h2>
              <p className="text-xs sm:text-[13px] text-cream-200/70 font-sans leading-relaxed">
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
            className="shrink-0 inline-flex h-10 sm:h-10 items-center justify-center gap-1.5 rounded-xl border border-forest-700/80 bg-forest-950/80 px-3.5 text-xs font-sans font-semibold text-cream-100 hover:border-gold-500/60 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Lock className="h-3.5 w-3.5 text-gold-400" />
            <span className="hidden sm:inline">
              {isChangingPassword ? 'Close' : 'Change Password'}
            </span>
            <span className="sm:hidden">
              {isChangingPassword ? 'Close' : 'Update'}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-forest-400 transition-transform duration-200 ${
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
            className="mt-5 pt-5 border-t border-forest-800/70 space-y-4 animate-fade-in"
          >
            {passwordState.error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl bg-terracotta-950/70 border border-terracotta-500/50 p-3.5 text-xs font-semibold text-terracotta-200 font-sans"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-terracotta-400" />
                <span>{passwordState.error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="newPassword"
                  className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-400/90"
                >
                  New Password <span className="text-gold-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isPasswordPending}
                    placeholder="At least 8 characters"
                    className="block w-full h-12 rounded-xl border border-forest-700/80 bg-forest-950/80 px-4 pr-11 text-sm sm:text-base text-cream-50 placeholder-forest-500 focus:border-gold-400 focus:outline-hidden focus:ring-2 focus:ring-gold-400/20 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-forest-400 hover:text-gold-400 cursor-pointer"
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
                  <p className="text-xs font-semibold text-terracotta-400 mt-1 font-sans">
                    {passwordState.fieldErrors.newPassword[0]}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-400/90"
                >
                  Confirm Password <span className="text-gold-400">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isPasswordPending}
                  placeholder="Re-enter password"
                  className="block w-full h-12 rounded-xl border border-forest-700/80 bg-forest-950/80 px-4 text-sm sm:text-base text-cream-50 placeholder-forest-500 focus:border-gold-400 focus:outline-hidden focus:ring-2 focus:ring-gold-400/20 transition-all font-sans"
                />
                {passwordState.fieldErrors?.confirmPassword && (
                  <p className="text-xs font-semibold text-terracotta-400 mt-1 font-sans">
                    {passwordState.fieldErrors.confirmPassword[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-forest-800/70">
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
                className="inline-flex h-12 sm:h-11 items-center justify-center rounded-xl border border-forest-700/80 bg-forest-950/60 px-5 text-xs sm:text-sm font-sans font-semibold text-cream-200 hover:text-cream-50 hover:bg-forest-900 disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. Danger Zone Section */}
      <div className="rounded-2xl border border-terracotta-500/40 bg-terracotta-950/30 p-4 sm:p-7 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-terracotta-950/70 text-terracotta-400 border border-terracotta-500/40 shadow-inner">
              <AlertTriangle className="h-5 w-5 stroke-[1.8]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-terracotta-200 tracking-tight font-sans">
                Danger Zone
              </h2>
              <p className="text-xs sm:text-[13px] text-terracotta-300/80 mt-1 max-w-xl font-sans leading-relaxed">
                Permanently delete your account and all associated profile details. Past order invoices are preserved securely in store records.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteConfirmation('')
              setDeleteError(null)
              setIsDeleteModalOpen(true)
            }}
            className="btn-danger shrink-0 w-full sm:w-auto inline-flex h-12 sm:h-10 items-center justify-center gap-1.5 rounded-xl px-5 text-xs sm:text-sm font-sans font-semibold active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-forest-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeletePending && setIsDeleteModalOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-forest-800 bg-forest-950 p-6 sm:p-8 shadow-2xl animate-fade-in z-10 space-y-6 text-cream-100">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-terracotta-950/80 text-terracotta-400 border border-terracotta-500/50">
                <Trash2 className="h-6 w-6 stroke-[1.8]" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-base sm:text-lg font-medium text-cream-50 font-display">
                  Delete Account Permanently?
                </h3>
                <p className="text-xs text-cream-200/70 font-sans">
                  This action is permanent and cannot be reversed.
                </p>
              </div>
            </div>

            <div className="space-y-2 rounded-xl bg-forest-900/90 p-4 text-xs text-cream-200 border border-forest-800 font-sans">
              <p className="font-semibold text-cream-50">
                What will happen:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-cream-300/80 leading-relaxed">
                <li>Your login credentials, profile data, and saved addresses will be deleted.</li>
                <li>Your bag and wishlist items will be cleared.</li>
                <li>Store bookkeeping preserves past invoices without personal identification.</li>
              </ul>
            </div>

            {deleteError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl bg-terracotta-950/80 border border-terracotta-500/50 p-3.5 text-xs font-semibold text-terracotta-200 font-sans"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-terracotta-400" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="deleteConfirmation"
                  className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-400/90"
                >
                  Type <span className="font-mono font-black text-terracotta-400 select-all">DELETE</span> to confirm:
                </label>
                <input
                  id="deleteConfirmation"
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  disabled={isDeletePending}
                  placeholder="DELETE"
                  className="block w-full h-12 rounded-xl border border-forest-700 bg-forest-900/80 px-4 text-sm font-mono font-bold text-cream-50 placeholder-forest-500 focus:border-terracotta-500 focus:outline-hidden focus:ring-2 focus:ring-terracotta-500/20 transition-all tracking-wider"
                  autoComplete="off"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setDeleteConfirmation('')
                    setDeleteError(null)
                  }}
                  disabled={isDeletePending}
                  className="inline-flex h-12 sm:h-11 items-center justify-center rounded-xl border border-forest-700/80 bg-forest-900/60 px-5 text-xs sm:text-sm font-sans font-semibold text-cream-200 hover:text-cream-50 hover:bg-forest-900 disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmation !== 'DELETE' || isDeletePending}
                  className="btn-danger inline-flex h-12 sm:h-11 items-center justify-center rounded-xl px-6 text-xs sm:text-sm font-sans font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer shadow-md"
                >
                  {isDeletePending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Deleting Account...</span>
                    </div>
                  ) : (
                    'Permanently Delete Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
