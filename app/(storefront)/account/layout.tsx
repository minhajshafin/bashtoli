import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountNav } from '@/components/storefront/account-nav'
import { CheckoutBackgroundArt } from '@/components/storefront/checkout-background-art'

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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login?redirectTo=/account')
  }

  // Retrieve matching profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Customer'
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] bg-cream-50 text-forest-900 overflow-hidden py-8 sm:py-12 lg:py-16">
      <CheckoutBackgroundArt />

      <div className="relative z-10 mx-auto max-w-[1440px] xl:max-w-[1520px] px-4 sm:px-6 lg:px-8 xl:px-10 w-full flex-1">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-12 items-start">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-4 pb-6 lg:pb-0 border-b lg:border-b-0 lg:border-r border-forest-200/80 lg:pr-8 xl:pr-10">
            <div className="space-y-6">
              {/* Customer Identity Card */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-forest-200/80 bg-cream-100/60 shadow-2xs">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-gold-400 font-display text-xl font-medium shadow-xs border border-forest-800">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
                      Customer
                    </p>
                    {profile?.role && profile.role !== 'customer' && (
                      <span className="inline-flex items-center rounded-full bg-gold-400/20 px-2 py-0.2 text-[9px] font-mono font-bold uppercase tracking-wider text-gold-700 border border-gold-400/40">
                        {profile.role}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg font-medium text-forest-950 font-display truncate mt-0.5">
                    {displayName}
                  </h2>
                  <p className="text-xs text-forest-600 truncate">{user.email}</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <AccountNav />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-8 pt-6 lg:pt-0 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
