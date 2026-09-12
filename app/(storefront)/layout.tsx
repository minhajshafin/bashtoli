import type { Metadata } from 'next'
import React, { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { CartProvider } from '@/lib/cart/cart-context'
import { Footer } from '@/components/storefront/footer'
import { ToastProvider } from '@/components/ui/toast'
import { ConfirmDialogProvider } from '@/components/ui/confirm-dialog'
import { WishlistProvider } from '@/lib/wishlist/wishlist-context'
import { NavHeader } from '@/components/storefront/nav-header'

export const metadata: Metadata = {
  title: {
    template: '%s | Bashtoli Stationery',
    default: 'Bashtoli Stationery | Your Neighborhood Stationery Shop',
  },
  description: 'Pens, pencils, paper, pouches & more — everything you need to write, create, and organise. Visit Bashtoli Stationery today.',
}

function StorefrontLayoutFallback({ children }: { children: React.ReactNode }) {
  return (
    <WishlistProvider isLoggedIn={false}>
      <CartProvider isLoggedIn={false}>
        <div className="flex min-h-screen flex-col bg-cream-50 text-forest-900 font-sans antialiased">
          {/* Guest Header Fallback */}
          <NavHeader
            isLoggedIn={false}
            fullName={null}
            isStaffOrAdmin={false}
          />

          {/* Main Content Area */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </CartProvider>
    </WishlistProvider>
  )
}

async function AuthAwareShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Fetch auth user and profile details
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .maybeSingle()
    profile = prof
  }

  const isStaffOrAdmin = profile?.role === 'staff' || profile?.role === 'admin'

  return (
    <WishlistProvider isLoggedIn={!!user}>
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
    </WishlistProvider>
  )
}

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <ConfirmDialogProvider>
        <Suspense fallback={<StorefrontLayoutFallback>{children}</StorefrontLayoutFallback>}>
          <AuthAwareShell>{children}</AuthAwareShell>
        </Suspense>
      </ConfirmDialogProvider>
    </ToastProvider>
  )
}

