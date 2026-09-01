import { createClient } from '@/lib/supabase/server'
import { CheckoutForm } from '@/components/storefront/checkout-form'
import type { Database } from '@/lib/supabase/database.types'
import React from 'react'

export const metadata = {
  title: 'Checkout | Bashtoli Storefront',
  description: 'Provide your shipping info and complete your order with Cash on Delivery.',
}

/**
 * Checkout page route.
 * Server component loading user profile data and saved addresses to pre-fill the form.
 */
export default async function CheckoutPage() {
  const supabase = await createClient()

  // Concurrently get session details
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let savedAddresses: Database['public']['Tables']['addresses']['Row'][] = []
  let userFullName: string | null = null
  let userPhone: string | null = null
  let userAddress: string | null = null

  if (user) {
    // 1. Fetch saved addresses
    const { data: addressData } = await supabase
      .from('addresses')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    savedAddresses = addressData || []

    // 2. Fetch profile details (full name, phone)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .maybeSingle()

    const defaultAddress = savedAddresses.find((a) => a.is_default) || savedAddresses[0]

    userFullName = profile?.full_name || (user.user_metadata?.full_name as string) || null
    userPhone = profile?.phone || defaultAddress?.phone || null
    userAddress = defaultAddress?.full_address || null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-extrabold tracking-tight text-forest-900"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Checkout
        </h1>
        <p className="mt-2 text-sm text-forest-600">
          Confirm your order details and delivery address below.
        </p>
      </div>

      {/* Interactive Form Component */}
      <CheckoutForm
        savedAddresses={savedAddresses}
        userEmail={user?.email || null}
        userFullName={userFullName}
        userPhone={userPhone}
        userAddress={userAddress}
      />
    </div>
  )
}

