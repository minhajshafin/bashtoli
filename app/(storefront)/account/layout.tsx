import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export async function generateMetadata() {
  return {
    title: 'My Account | Bashtoli',
    description: 'Manage your Bashtoli customer account settings, saved addresses, and orders.',
  }
}

/**
 * Account Layout.
 * Enforces customer authentication and renders navigation layout sidebar.
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
    redirect('/login?redirectTo=/account/addresses')
  }

  // Retrieve matching profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 gap-y-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 pb-6 lg:pb-0 border-b lg:border-b-0 lg:border-r border-forest-200 lg:pr-8">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold-500">Account Owner</p>
              <h2
                className="mt-1 text-lg font-black text-forest-900 truncate"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                {profile?.full_name || user.email}
              </h2>
            </div>
            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible">
              <Link
                href="/account"
                className="shrink-0 flex items-center rounded-xl px-4 py-2.5 text-xs font-semibold text-forest-700 hover:bg-cream-200 hover:text-forest-900 transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/account/profile"
                className="shrink-0 flex items-center rounded-xl px-4 py-2.5 text-xs font-semibold text-forest-700 hover:bg-cream-200 hover:text-forest-900 transition-colors"
              >
                Profile Settings
              </Link>
              <Link
                href="/account/orders"
                className="shrink-0 flex items-center rounded-xl px-4 py-2.5 text-xs font-semibold text-forest-700 hover:bg-cream-200 hover:text-forest-900 transition-colors"
              >
                Order History
              </Link>
              <Link
                href="/account/addresses"
                className="shrink-0 flex items-center rounded-xl px-4 py-2.5 text-xs font-semibold text-forest-700 hover:bg-cream-200 hover:text-forest-900 transition-colors"
              >
                Saved Addresses
              </Link>
              <Link
                href="/account/wishlist"
                className="shrink-0 flex items-center rounded-xl px-4 py-2.5 text-xs font-semibold text-forest-700 hover:bg-cream-200 hover:text-forest-900 transition-colors"
              >
                My Wishlist
              </Link>
              <Link
                href="/order/lookup"
                className="shrink-0 flex items-center rounded-xl px-4 py-2.5 text-xs font-semibold text-forest-700 hover:bg-cream-200 hover:text-forest-900 transition-colors"
              >
                Track Guest Order
              </Link>
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-9 lg:pl-8 pt-6 lg:pt-0">
          {children}
        </div>
      </div>
    </div>
  )
}

