import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import React from 'react'

export async function generateMetadata() {
  return {
    title: 'My Account | Bashtoli',
    description: 'Manage your Bashtoli orders, wishlist, and shipping addresses.',
  }
}

/**
 * Customer Account Portal home.
 * Server component that redirects guests and displays card options for customer account management.
 */
export default async function AccountPage() {
  const supabase = await createClient()

  // Verify auth session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/account')
  }

  // Fetch customer profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const displayName = profile?.full_name || user.email

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          Hello, {displayName}!
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Welcome to your customer portal. Choose an option below to manage your account details.
        </p>
      </div>

      {/* Portal features grid cards layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Orders Card */}
        <Link
          href="/account/orders"
          className="group p-6 rounded-3xl border border-zinc-200 bg-white hover:border-zinc-300 shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500 mb-4 group-hover:scale-105 transition-transform">
            <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50 group-hover:text-amber-600 transition-colors">
            Order History
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Track shipping status, view order summaries, or cancel pending orders.
          </p>
        </Link>

        {/* Addresses Card */}
        <Link
          href="/account/addresses"
          className="group p-6 rounded-3xl border border-zinc-200 bg-white hover:border-zinc-300 shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-500 mb-4 group-hover:scale-105 transition-transform">
            <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 transition-colors">
            Saved Addresses
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Manage your delivery address book to pre-fill information during checkout.
          </p>
        </Link>

        {/* Wishlist Card */}
        <Link
          href="/account/wishlist"
          className="group p-6 rounded-3xl border border-zinc-200 bg-white hover:border-zinc-300 shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-500 mb-4 group-hover:scale-105 transition-transform">
            <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50 group-hover:text-rose-600 transition-colors">
            My Wishlist
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Review handcrafted products you saved for later and add them to your cart.
          </p>
        </Link>
      </div>
    </div>
  )
}
