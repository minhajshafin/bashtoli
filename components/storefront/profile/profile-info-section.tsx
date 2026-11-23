'use client'

import React, { useState, useTransition } from 'react'
import { updateProfileAction } from '@/lib/actions/profile'
import { useToast } from '@/components/ui/toast'
import {
  User,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  Check,
} from 'lucide-react'

interface ProfileInfoSectionProps {
  profile: {
    id: string
    full_name: string | null
    phone: string | null
    address: string | null
    role: string
  } | null
  email: string | null
}

export function ProfileInfoSection({ profile, email }: ProfileInfoSectionProps) {
  const { toast } = useToast()
  const [isJustSaved, setIsJustSaved] = useState(false)
  const [isProfilePending, startProfileTransition] = useTransition()

  const [profileState, setProfileState] = useState<{
    error: string | null
    fieldErrors?: Partial<Record<'fullName' | 'phone' | 'address', string[]>>
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

  return (
    <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-5 sm:p-7 shadow-xl space-y-5 text-cream-50 backdrop-blur-sm">
      <div className="flex items-center gap-3 border-b border-forest-800 pb-4 mb-5">
        <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-forest-950 text-gold-400 border border-forest-800 shadow-2xs">
          <User className="h-5 w-5 stroke-[1.8]" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-medium text-cream-50 font-display">
            Personal Information
          </h2>
          <p className="text-xs sm:text-[13px] text-forest-300 font-sans leading-relaxed">
            Your name, contact details, and default shipping address.
          </p>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-4">
        {profileState.error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl bg-terracotta-950/60 border border-terracotta-500/40 p-3.5 text-xs font-semibold text-terracotta-200 font-sans"
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
              className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-gold-300"
            >
              Full Name <span className="text-terracotta-400">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              defaultValue={profile?.full_name || ''}
              disabled={isProfilePending}
              placeholder="e.g. Shafi Rahman"
              className="block w-full h-12 rounded-xl border border-forest-700 bg-forest-950/80 px-4 text-sm text-cream-50 placeholder:text-forest-400 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all font-sans shadow-2xs"
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
                className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-gold-300"
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
                className="block w-full h-12 rounded-xl border border-forest-800 bg-forest-950/40 px-4 pl-10 text-sm text-forest-300 cursor-not-allowed select-none font-sans"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-400/70 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Contact Phone Number */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="phone"
              className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-gold-300"
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
              className="block w-full h-12 rounded-xl border border-forest-700 bg-forest-950/80 px-4 pl-10 text-sm text-cream-50 placeholder:text-forest-400 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all font-mono tracking-wide shadow-2xs"
            />
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-400/70 pointer-events-none" />
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
              className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-gold-300"
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
              className="block w-full rounded-xl border border-forest-700 bg-forest-950/80 p-4 pl-10 text-sm text-cream-50 placeholder:text-forest-400 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all font-sans leading-relaxed shadow-2xs"
            />
            <MapPin className="absolute left-3.5 top-4 h-4 w-4 text-gold-400/70 pointer-events-none" />
          </div>
          {profileState.fieldErrors?.address && (
            <p className="text-xs font-semibold text-terracotta-400 mt-1 font-sans">
              {profileState.fieldErrors.address[0]}
            </p>
          )}
        </div>

        {/* Save Changes CTA */}
        <div className="pt-3 border-t border-forest-800">
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
  )
}
