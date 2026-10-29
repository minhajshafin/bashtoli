import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/supabase/require-user'
import { AccountLayoutWrapper } from '@/components/storefront/account-layout-wrapper'

export async function generateMetadata() {
  return {
    description: 'Manage your Bashtoli customer account settings, saved addresses, and orders.',
  }
}

export const instant = false

/**
 * AccountLayout
 * Refined customer portal layout wrapped in Bashtoli's warm stationery paper aesthetic.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser('/account')
  const supabase = await createClient()

  // Retrieve matching profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Customer'
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <AccountLayoutWrapper
      userInitial={userInitial}
      displayName={displayName}
      email={user.email}
      role={profile?.role}
    >
      {children}
    </AccountLayoutWrapper>
  )
}

