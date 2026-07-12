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
        <aside className="lg:col-span-3 pb-6 lg:pb-0 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 lg:pr-8">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Account Owner</p>
              <h2 className="mt-1 text-lg font-black text-zinc-900 dark:text-zinc-50 truncate">
                {profile?.full_name || user.email}
              </h2>
            </div>
            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible">
              <Link
                href="/account/addresses"
                className="shrink-0 flex items-center rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-500"
              >
                Saved Addresses
              </Link>
              <Link
                href="/order/lookup"
                className="shrink-0 flex items-center rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
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
