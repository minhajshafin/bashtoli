'use client'

import React, { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfileAction, updatePasswordAction, deleteAccountAction } from '@/lib/actions/profile'
import { useToast } from '@/components/ui/toast'

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

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  // UX State: View vs Edit mode for Personal Information
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)

  // UX State: Expandable Change Password
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Danger Zone Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Transitions for smooth state handling
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

  const passwordFormRef = React.useRef<HTMLFormElement>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleProfileSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startProfileTransition(async () => {
      const res = await updateProfileAction({ error: null }, formData)
      setProfileState(res)
      if (res.success) {
        toast('Profile details updated successfully!', 'success')
        setIsEditingPersonal(false)
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

  const userInitial = (profile?.full_name || email || 'U').charAt(0).toUpperCase()

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header Profile Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6 rounded-2xl border border-forest-200 bg-cream-100/80 shadow-xs">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest-800 text-gold-400 text-2xl font-normal"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {userInitial}
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h2
              className="text-lg sm:text-xl font-normal text-forest-900 truncate"
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic' }}
            >
              {profile?.full_name || 'My Profile'}
            </h2>
            <span className="inline-flex items-center rounded-full bg-forest-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-forest-800">
              {profile?.role || 'customer'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-forest-600 truncate font-light">
            {email || 'No email associated'}
          </p>
        </div>
      </div>

      {/* 1. Personal Information Card */}
      <div className="rounded-2xl border border-forest-200 bg-cream-100/70 p-6 sm:p-7 shadow-xs">
        <div className="flex items-start justify-between gap-4 border-b border-forest-200/60 pb-4 mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-forest-900">
              Personal Information
            </h2>
            <p className="text-xs sm:text-sm text-forest-600 mt-1 font-light">
              {isEditingPersonal
                ? 'Update your name, contact phone, or default delivery address below.'
                : 'Your name, contact details, and default shipping address.'}
            </p>
          </div>

          {!isEditingPersonal && (
            <button
              type="button"
              onClick={() => setIsEditingPersonal(true)}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-cream-50 px-4 py-2 text-xs sm:text-sm font-semibold text-forest-800 hover:bg-cream-200/80 transition-all cursor-pointer"
            >
              <svg className="h-3.5 w-3.5 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              <span>Edit Details</span>
            </button>
          )}
        </div>

        <form
          key={`${profile?.full_name}-${profile?.phone}-${profile?.address}-${isEditingPersonal}`}
          onSubmit={handleProfileSubmit}
          className="space-y-4"
        >
          {profileState.error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700"
            >
              <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{profileState.error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-forest-500">
                Full Name {isEditingPersonal && <span className="text-gold-600">*</span>}
              </label>
              {isEditingPersonal ? (
                <>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    defaultValue={profile?.full_name || ''}
                    disabled={isProfilePending}
                    placeholder="e.g. Shafi Rahman"
                    className="block w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-2.5 text-sm sm:text-base text-forest-900 placeholder-forest-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all"
                  />
                  {profileState.fieldErrors?.fullName && (
                    <p className="text-xs font-bold text-rose-600 mt-1">{profileState.fieldErrors.fullName[0]}</p>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-forest-200/80 bg-cream-50/70 px-4 py-2.5 text-sm sm:text-base font-semibold text-forest-900">
                  {profile?.full_name || <span className="text-forest-400 italic">Not set</span>}
                </div>
              )}
            </div>

            {/* Email (Read-Only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-forest-500">
                  Email Address
                </label>
                <span className="text-[10px] font-medium text-forest-400">Read-only</span>
              </div>
              <input
                id="email"
                type="email"
                value={email || ''}
                readOnly
                disabled
                className="block w-full rounded-xl border border-forest-200 bg-cream-50/50 px-4 py-2.5 text-sm sm:text-base text-forest-600 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Contact Phone Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-forest-500">
                Phone Number
              </label>
              <span className="text-[10px] font-semibold text-forest-400">Optional</span>
            </div>
            {isEditingPersonal ? (
              <>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile?.phone || ''}
                  disabled={isProfilePending}
                  placeholder="e.g. 01712345678"
                  className="block w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-2.5 text-sm sm:text-base text-forest-900 placeholder-forest-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all"
                />
                {profileState.fieldErrors?.phone && (
                  <p className="text-xs font-bold text-rose-600 mt-1">{profileState.fieldErrors.phone[0]}</p>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-forest-200/80 bg-cream-50/70 px-4 py-2.5 text-sm sm:text-base font-semibold text-forest-900">
                {profile?.phone || <span className="text-forest-400 font-normal italic">No phone number provided</span>}
              </div>
            )}
          </div>

          {/* Default Address */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-forest-500">
                Default Shipping Address
              </label>
              <span className="text-[10px] font-semibold text-forest-400">Optional</span>
            </div>
            {isEditingPersonal ? (
              <>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  defaultValue={profile?.address || ''}
                  disabled={isProfilePending}
                  placeholder="e.g. House #12, Road #4, Uttara, Dhaka"
                  className="block w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-2.5 text-sm sm:text-base text-forest-900 placeholder-forest-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all"
                />
                {profileState.fieldErrors?.address && (
                  <p className="text-xs font-bold text-rose-600 mt-1">{profileState.fieldErrors.address[0]}</p>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-forest-200/80 bg-cream-50/70 px-4 py-2.5 text-sm sm:text-base font-semibold text-forest-900 whitespace-pre-wrap min-h-[44px]">
                {profile?.address || <span className="text-forest-400 font-normal italic">No delivery address saved</span>}
              </div>
            )}
          </div>

          {/* Action Buttons in Edit Mode */}
          {isEditingPersonal && (
            <div className="flex items-center gap-3 pt-3 border-t border-forest-200/60">
              <button
                type="submit"
                disabled={isProfilePending}
                className="inline-flex h-10 sm:h-11 items-center justify-center rounded-full bg-forest-800 px-6 text-xs sm:text-sm font-bold text-cream-100 shadow-md hover:bg-gold-500 hover:text-forest-900 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
              >
                {isProfilePending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-cream-100 border-t-gold-400" />
                    <span>Saving Changes...</span>
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingPersonal(false)}
                disabled={isProfilePending}
                className="inline-flex h-10 sm:h-11 items-center justify-center rounded-full border border-forest-200 bg-cream-50 px-5 text-xs sm:text-sm font-semibold text-forest-700 hover:bg-cream-200/80 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* 2. Password & Security Card (Below, Expandable) */}
      <div className="rounded-2xl border border-forest-200 bg-cream-100/70 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-forest-900">
              Password &amp; Security
            </h2>
            <p className="text-xs sm:text-sm text-forest-600 mt-1 font-light">
              Manage your password to ensure your Bashtoli account remains protected.
            </p>
          </div>

          {!isChangingPassword && (
            <button
              type="button"
              onClick={() => {
                setPasswordState({ error: null })
                setIsChangingPassword(true)
              }}
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-forest-800 px-5 py-2.5 text-xs sm:text-sm font-bold text-cream-100 hover:bg-gold-500 hover:text-forest-900 transition-all cursor-pointer shadow-xs"
            >
              <svg className="w-4 h-4 text-gold-400 group-hover:text-forest-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <span>Change Password</span>
            </button>
          )}
        </div>

        {/* Expandable Password Form */}
        {isChangingPassword && (
          <form
            ref={passwordFormRef}
            onSubmit={handlePasswordSubmit}
            className="mt-5 pt-5 border-t border-forest-200/60 space-y-4 animate-fade-in"
          >
            {passwordState.error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700"
              >
                <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{passwordState.error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label htmlFor="newPassword" className="block text-xs font-bold uppercase tracking-wider text-forest-500">
                  New Password <span className="text-gold-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isPasswordPending}
                    placeholder="At least 8 characters"
                    className="block w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-2.5 pr-10 text-sm sm:text-base text-forest-900 placeholder-forest-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-700 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordState.fieldErrors?.newPassword && (
                  <p className="text-xs font-bold text-rose-600 mt-1">{passwordState.fieldErrors.newPassword[0]}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-forest-500">
                  Confirm Password <span className="text-gold-600">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isPasswordPending}
                  placeholder="Re-enter password"
                  className="block w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-2.5 text-sm sm:text-base text-forest-900 placeholder-forest-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all"
                />
                {passwordState.fieldErrors?.confirmPassword && (
                  <p className="text-xs font-bold text-rose-600 mt-1">{passwordState.fieldErrors.confirmPassword[0]}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-forest-200/60">
              <button
                type="submit"
                disabled={isPasswordPending}
                className="inline-flex h-10 sm:h-11 items-center justify-center rounded-full bg-forest-800 px-6 text-xs sm:text-sm font-bold text-cream-100 shadow-md hover:bg-gold-500 hover:text-forest-900 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
              >
                {isPasswordPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-cream-100 border-t-gold-400" />
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  'Save New Password'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false)
                  setPasswordState({ error: null })
                }}
                disabled={isPasswordPending}
                className="inline-flex h-10 sm:h-11 items-center justify-center rounded-full border border-forest-200 bg-cream-50 px-5 text-xs sm:text-sm font-semibold text-forest-700 hover:bg-cream-200/80 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. Danger Zone Section */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-rose-900 tracking-tight flex items-center gap-2">
              <svg className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Danger Zone
            </h2>
            <p className="text-xs sm:text-sm text-rose-700/80 mt-1 max-w-xl font-light">
              Permanently delete your account and all associated profile details from the database. Past completed and in-progress orders are preserved securely in store records.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteConfirmation('')
              setDeleteError(null)
              setIsDeleteModalOpen(true)
            }}
            className="shrink-0 inline-flex h-10 items-center justify-center rounded-full bg-rose-600 px-5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-rose-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-forest-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => !isDeletePending && setIsDeleteModalOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-forest-200 bg-cream-50 p-6 sm:p-8 shadow-2xl animate-fade-in z-10 space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="space-y-1 min-w-0">
                <h3
                  className="text-lg sm:text-xl font-normal text-forest-900"
                  style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic' }}
                >
                  Delete Account Permanently?
                </h3>
                <p className="text-xs text-forest-600">
                  This action is permanent and cannot be reversed.
                </p>
              </div>
            </div>

            <div className="space-y-2 rounded-xl bg-cream-100 p-4 text-xs text-forest-700 border border-forest-200">
              <p className="font-bold text-forest-900">
                What will happen:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-forest-600 font-light leading-relaxed">
                <li>Your login credentials, profile data, and saved addresses will be deleted.</li>
                <li>Your bag and wishlist items will be cleared.</li>
                <li>Store bookkeeping preserves past invoices without personal identification.</li>
              </ul>
            </div>

            {deleteError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700"
              >
                <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="deleteConfirmation" className="block text-xs font-bold uppercase tracking-wider text-forest-600">
                  Type <span className="font-mono font-black text-rose-600 select-all">DELETE</span> to confirm:
                </label>
                <input
                  id="deleteConfirmation"
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  disabled={isDeletePending}
                  placeholder="DELETE"
                  className="block w-full rounded-xl border border-forest-200 bg-cream-50 px-4 py-2.5 text-sm font-mono font-bold text-forest-900 placeholder-forest-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                  autoComplete="off"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setDeleteConfirmation('')
                    setDeleteError(null)
                  }}
                  disabled={isDeletePending}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-forest-200 bg-cream-100 px-5 text-xs sm:text-sm font-semibold text-forest-700 hover:bg-cream-200/80 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmation !== 'DELETE' || isDeletePending}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-rose-600 px-6 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-rose-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
