import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { CartProvider } from '@/lib/cart/cart-context'
import { CartIcon } from '@/components/storefront/cart-icon'
import { logoutAction } from '@/lib/actions/auth'
import { Footer } from '@/components/storefront/footer'
import { MobileNav } from '@/components/storefront/mobile-nav'
import { ToastProvider } from '@/components/ui/toast'
import { NavHeader } from '@/components/storefront/nav-header'

export const metadata: Metadata = {
  title: {
    template: '%s | Bashtoli Stationery',
    default: 'Bashtoli Stationery | Your Neighborhood Stationery Shop',
  },
  description: 'Pens, pencils, paper, pouches & more — everything you need to write, create, and organise. Visit Bashtoli Stationery today.',
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
        <div className="flex min-h-screen flex-col bg-cream-50 text-forest-900 font-sans antialiased">

          {/* Sticky Header */}
          <NavHeader
            isLoggedIn={!!user}
            fullName={profile?.full_name || user?.email || null}
            isStaffOrAdmin={isStaffOrAdmin}
          />

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

