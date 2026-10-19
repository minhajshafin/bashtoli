import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/storefront/profile-form'
import Link from 'next/link'
import React from 'react'

export async function generateMetadata() {
  return {
    title: 'Profile Settings',
    description: 'Manage your personal name, phone number, shipping address, and password settings.',
  }
}

export const instant = false

/**
 * Customer Profile Settings page.
 * Server component that authenticates the user and provides profile details to the interactive client form.
 */
export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/account/profile')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role')
    .eq('id', user.id)
    .maybeSingle()

  const { data: savedAddress } = await supabase
    .from('addresses')
    .select('full_address, phone')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const profileData = {
    id: user.id,
    full_name: profile?.full_name || (user.user_metadata?.full_name as string) || null,
    phone: profile?.phone || savedAddress?.phone || null,
    address: savedAddress?.full_address || null,
    role: profile?.role || 'customer',
  }

  return (
    <div className="space-y-6">
      {/* Top Utility Navigation Row */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-forest-800/80">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-gold-400 hover:text-gold-300 transition-colors uppercase tracking-wider group cursor-pointer"
        >
          <svg
            className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <span>Account Overview</span>
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-forest-400">
          CUSTOMER PORTAL
        </span>
      </div>

      <div className="border-b border-forest-800/80 pb-5">
        <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-400/90 mb-1">
          — ACCOUNT PREFERENCES · BASHTOLI STATIONERY
        </p>
        <h1 className="text-2xl sm:text-3xl text-cream-50 font-medium tracking-tight font-display">
          Profile Settings
        </h1>
        <p className="text-xs sm:text-[13px] text-forest-300 mt-1 font-sans leading-relaxed">
          Manage your account information, default checkout details, and password.
        </p>
      </div>

      <ProfileForm profile={profileData} email={user.email || null} />
    </div>
  )
}
