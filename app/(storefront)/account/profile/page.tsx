import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/storefront/profile-form'
import React from 'react'

export async function generateMetadata() {
  return {
    title: 'Profile Settings | Bashtoli',
    description: 'Manage your personal name, phone number, shipping address, and password settings.',
  }
}

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
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          Profile Settings
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your account information, default checkout details, and password.
        </p>
      </div>

      <ProfileForm profile={profileData} email={user.email || null} />
    </div>
  )
}
