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

  // Reference to password form for resetting inputs on success
  const passwordFormRef = React.useRef<HTMLFormElement>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startPasswordTransition(async () => {
      const res = await updatePasswordAction({ error: null }, formData)
      setPasswordState(res)
      if (res.success) {
        toast('Password updated successfully!', 'success')
        passwordFormRef.current?.reset()
      }
    })
  }

  const handleDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
    <div className="space-y-8 max-w-4xl">
      {/* Header Profile Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 text-2xl font-black">
          {userInitial}
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50 truncate">
              {profile?.full_name || 'My Profile'}
            </h1>
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              {profile?.role || 'customer'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {email || 'No email associated'}
          </p>
        </div>
      </div>

      {/* Grid of Profile Info and Password Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Section 1: Personal & Contact Information */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800 mb-6">
              <div>
                <h2 className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                  Personal Information
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {isEditingPersonal
                    ? 'Make changes to your name, contact phone, or delivery address below.'
                    : 'Your name, contact details, and default shipping address.'}
                </p>
              </div>

              {!isEditingPersonal && (
                <button
                  type="button"
                  onClick={() => setIsEditingPersonal(true)}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-850 transition-all shadow-2xs active:scale-[0.98]"
                >
                  <svg className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  <span>Edit</span>
                </button>
              )}
            </div>

            <form
              key={`${profile?.full_name}-${profile?.phone}-${profile?.address}-${isEditingPersonal}`}
              onSubmit={handleProfileSubmit}
              className="space-y-5"
            >
              {/* Alert for error */}
              {profileState.error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400"
                >
                  <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{profileState.error}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Full Name {isEditingPersonal && <span className="text-amber-500">*</span>}
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
                      className="block w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-600"
                    />
                    {profileState.fieldErrors?.fullName && (
                      <p className="text-[11px] font-bold text-rose-500 mt-1">{profileState.fieldErrors.fullName[0]}</p>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:border-zinc-800/80 dark:bg-zinc-900/30 dark:text-zinc-100">
                    {profile?.full_name || <span className="text-zinc-400 italic">Not set</span>}
                  </div>
                )}
              </div>

              {/* Email (Read-Only) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Email Address
                  </label>
                  <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">Managed via Auth</span>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email || ''}
                  readOnly
                  disabled
                  className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-500 dark:border-zinc-850 dark:bg-zinc-900/50 dark:text-zinc-400 cursor-not-allowed select-none"
                />
              </div>

              {/* Contact Phone Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Phone Number
                  </label>
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">Optional</span>
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
                      className="block w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-600"
                    />
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      When saved, this phone number will automatically pre-fill during checkout.
                    </p>
                    {profileState.fieldErrors?.phone && (
                      <p className="text-[11px] font-bold text-rose-500 mt-1">{profileState.fieldErrors.phone[0]}</p>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:border-zinc-800/80 dark:bg-zinc-900/30 dark:text-zinc-100">
                    {profile?.phone || <span className="text-zinc-400 font-normal italic">No phone number provided</span>}
                  </div>
                )}
              </div>

              {/* Default Address */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Shipping / Delivery Address
                  </label>
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">Optional</span>
                </div>
                {isEditingPersonal ? (
                  <>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      defaultValue={profile?.address || ''}
                      disabled={isProfilePending}
                      placeholder="e.g. House #12, Road #4, Sector 7, Uttara, Dhaka"
                      className="block w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-600"
                    />
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      When saved, this address will automatically pre-fill your checkout delivery address.
                    </p>
                    {profileState.fieldErrors?.address && (
                      <p className="text-[11px] font-bold text-rose-500 mt-1">{profileState.fieldErrors.address[0]}</p>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:border-zinc-800/80 dark:bg-zinc-900/30 dark:text-zinc-100 whitespace-pre-wrap min-h-[44px]">
                    {profile?.address || <span className="text-zinc-400 font-normal italic">No delivery address saved</span>}
                  </div>
                )}
              </div>

              {/* Action Buttons in Edit Mode */}
              {isEditingPersonal && (
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={isProfilePending}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 text-xs font-bold text-white shadow-md hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {isProfilePending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-50 border-t-zinc-400 dark:border-zinc-900 dark:border-t-zinc-500" />
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
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 active:scale-[0.98] transition-all disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Section 2: Security & Change Password */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs">
            <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800 mb-6">
              <h2 className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                Change Password
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Choose a strong password to keep your account safe.
              </p>
            </div>

            <form ref={passwordFormRef} onSubmit={handlePasswordSubmit} className="space-y-5">
              {/* Alert for error */}
              {passwordState.error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400"
                >
                  <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{passwordState.error}</span>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label htmlFor="newPassword" className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  New Password <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isPasswordPending}
                    placeholder="At least 8 characters"
                    className="block w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 pr-10 text-sm text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
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
                  <p className="text-[11px] font-bold text-rose-500 mt-1">{passwordState.fieldErrors.newPassword[0]}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Confirm Password <span className="text-amber-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isPasswordPending}
                  placeholder="Re-enter your new password"
                  className="block w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-600"
                />
                {passwordState.fieldErrors?.confirmPassword && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1">{passwordState.fieldErrors.confirmPassword[0]}</p>
                )}
              </div>

              {/* Submit Password Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isPasswordPending}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 text-xs font-bold text-white shadow-md hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {isPasswordPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-50 border-t-zinc-400 dark:border-zinc-900 dark:border-t-zinc-500" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="rounded-3xl border border-rose-200 bg-rose-50/30 p-6 sm:p-8 dark:border-rose-900/40 dark:bg-rose-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-rose-800 dark:text-rose-400 tracking-tight flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Danger Zone
            </h2>
            <p className="text-xs text-rose-700/80 dark:text-rose-400/80 mt-1 max-w-xl">
              Permanently delete your account and all associated personal data from the database. Past completed and in-progress orders are preserved securely in the store records.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteConfirmation('')
              setDeleteError(null)
              setIsDeleteModalOpen(true)
            }}
            className="shrink-0 inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-rose-700 active:scale-[0.98] transition-all"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isDeletePending && setIsDeleteModalOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 animate-fade-in z-10 space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                  Delete Account Permanently?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This action is permanent and cannot be reversed.
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl bg-zinc-50 p-4 text-xs text-zinc-650 dark:bg-zinc-900/50 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800">
              <p className="font-bold text-zinc-900 dark:text-zinc-200">
                What will happen:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-[11px] leading-relaxed">
                <li>Your login credentials, profile data, and saved addresses will be deleted from the database.</li>
                <li>Your cart and wishlist items will be removed.</li>
                <li>Your completed and pending orders will remain securely stored in store order records for bookkeeping and fulfillment (unlinked from your deleted profile).</li>
              </ul>
            </div>

            {deleteError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400"
              >
                <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="deleteConfirmation" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Type <span className="font-mono font-black text-rose-600 dark:text-rose-400 select-all">DELETE</span> to confirm:
                </label>
                <input
                  id="deleteConfirmation"
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  disabled={isDeletePending}
                  placeholder="DELETE"
                  className="block w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-mono font-bold text-zinc-900 placeholder-zinc-400 focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-600"
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
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 active:scale-[0.98] transition-all disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmation !== 'DELETE' || isDeletePending}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-rose-600 px-6 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-rose-600"
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
