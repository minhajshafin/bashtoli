import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { CartProvider } from '@/lib/cart/cart-context'
import { CartIcon } from '@/components/storefront/cart-icon'

export const metadata: Metadata = {
  title: {
    template: '%s | Bashtoli',
    default: 'Bashtoli | Premium Handicrafts',
  },
  description: 'Authentic organic handicraft products made in Bangladesh.',
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Concurrently fetch auth user to determine if we should render admin panel link
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isStaffOrAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    isStaffOrAdmin = profile?.role === 'staff' || profile?.role === 'admin'
  }

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-stone-50/30 text-zinc-900 font-sans antialiased dark:bg-zinc-950 dark:text-zinc-50">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left: Brand name logo */}
            <div className="flex items-center gap-6">
              <Link
                href="/products"
                className="text-xl font-black tracking-tight text-zinc-900 hover:text-amber-600 transition-colors dark:text-white dark:hover:text-amber-500"
              >
                Bashtoli
              </Link>
              {/* Navigation links */}
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                <Link
                  href="/products"
                  className="hover:text-amber-600 transition-colors dark:hover:text-amber-500"
                >
                  Shop Catalog
                </Link>
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
              {/* Admin Panel Shortcut Link */}
              {isStaffOrAdmin && (
                <Link
                  href="/admin"
                  className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-bold tracking-wide text-white hover:bg-amber-600 transition-colors dark:bg-zinc-850 dark:hover:bg-amber-500"
                >
                  Admin Panel
                </Link>
              )}

              {/* Cart Icon & Item Badge */}
              <CartIcon />

              {/* User Login/Account Link */}
              <Link
                href="/login"
                className="text-sm font-bold text-zinc-600 hover:text-amber-600 transition-colors dark:text-zinc-400 dark:hover:text-amber-500"
              >
                Account
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-400 dark:text-zinc-500">
            <div>
              <p>&copy; {new Date().getFullYear()} Bashtoli. All rights reserved.</p>
              <p className="mt-1 text-[10px] text-zinc-400/80">Premium Handicrafts & Sustainable Decor</p>
            </div>
            <div className="flex gap-6">
              <Link href="/products" className="hover:text-zinc-600 dark:hover:text-zinc-300">
                Catalog
              </Link>
              <Link href="/login" className="hover:text-zinc-600 dark:hover:text-zinc-300">
                Account
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}
