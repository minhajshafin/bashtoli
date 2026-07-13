import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { CartProvider } from '@/lib/cart/cart-context'
import { CartIcon } from '@/components/storefront/cart-icon'
import { logoutAction } from '@/lib/actions/auth'
import { Footer } from '@/components/storefront/footer'
import { MobileNav } from '@/components/storefront/mobile-nav'
import { ToastProvider } from '@/components/ui/toast'

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

  // Fetch auth user and profile details
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    profile = prof
  }

  const isStaffOrAdmin = profile?.role === 'staff' || profile?.role === 'admin'

  return (
    <ToastProvider>
      <CartProvider isLoggedIn={!!user}>
        <div className="flex min-h-screen flex-col bg-stone-50/30 text-zinc-900 font-sans antialiased dark:bg-zinc-950 dark:text-zinc-50">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left: Brand name logo */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
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
                  Catalog
                </Link>
                <Link
                  href="/about"
                  className="hover:text-amber-600 transition-colors dark:hover:text-amber-500"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="hover:text-amber-600 transition-colors dark:hover:text-amber-500"
                >
                  Contact
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
              {profile ? (
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline text-xs font-bold text-zinc-500 dark:text-zinc-400 max-w-[120px] truncate">
                    {profile.full_name || user?.email}
                  </span>
                  <form action={logoutAction} className="inline-block">
                    <button
                      type="submit"
                      className="text-sm font-bold text-zinc-600 hover:text-amber-600 transition-colors dark:text-zinc-400 dark:hover:text-amber-500"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-bold text-zinc-600 hover:text-amber-600 transition-colors dark:text-zinc-400 dark:hover:text-amber-500"
                >
                  Account
                </Link>
              )}

              {/* Mobile hamburger navigation drawer */}
              <MobileNav
                isLoggedIn={!!user}
                fullName={profile?.full_name || user?.email || null}
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
      </CartProvider>
    </ToastProvider>
  )
}
