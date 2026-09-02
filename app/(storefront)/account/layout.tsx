import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountNav } from '@/components/storefront/account-nav'

export async function generateMetadata() {
  return {
    title: 'My Account | Bashtoli',
    description: 'Manage your Bashtoli customer account settings, saved addresses, and orders.',
  }
}

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

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-cream-50 py-10 sm:py-16 flex flex-col justify-start">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-4 pb-6 lg:pb-0 border-b lg:border-b-0 lg:border-r border-forest-200 lg:pr-8">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-500">
                  Customer Portal
                </p>
                <h2
                  className="mt-1 text-xl font-normal text-forest-900 truncate"
                  style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic' }}
                >
                  {displayName}
                </h2>
                <p className="text-xs text-forest-500 truncate mt-0.5">{user.email}</p>
              </div>

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
