import { createClient } from '@/lib/supabase/server'
import { CheckoutForm } from '@/components/storefront/checkout-form'
import { CheckoutSteps } from '@/components/storefront/checkout-steps'
import type { Database } from '@/lib/supabase/database.types'
import Link from 'next/link'
import React from 'react'

export const metadata = {
  title: 'Checkout',
  description: 'Provide your delivery info and complete your order with Cash on Delivery.',
}

export const instant = false

/**
 * Checkout page route.
 * Server component loading user profile data and saved addresses to pre-fill the form.
 * Harmonized with the rest of the storefront (laid-paper canvas, displays, and cards).
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
    <div className="checkout-page-root min-h-screen bg-cream-50 bg-laid-paper text-forest-950 py-5 sm:py-8 lg:py-10 pb-36 sm:pb-24 selection:bg-gold-500/20 selection:text-forest-900">
      <div className="mx-auto max-w-[1440px] xl:max-w-[1520px] px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col justify-start">
        {/* 3-Step Visual Progress Track */}
        <div className="mb-6">
          <CheckoutSteps currentStep={2} variant="light" />
        </div>

        {/* Masthead Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-5 border-b border-forest-900/10 gap-4">
          <div>
            <Link
              href="/bag"
              className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-forest-700 hover:text-forest-950 transition-colors duration-fast mb-2 cursor-pointer group"
            >
              <svg
                className="h-3.5 w-3.5 transition-transform duration-fast group-hover:-translate-x-0.5 text-gold-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              <span>Return to Shopping Bag</span>
            </Link>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-px w-5 bg-gold-700/60" />
              <span className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-700">
                Dispatch &amp; Delivery · Dhaka Shop
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-forest-950 tracking-tight font-display leading-tight">
                Checkout · Delivery Details
              </h1>
              <span className="rounded-pill bg-gold-400/20 border border-gold-600/30 px-2.5 py-0.5 text-xs font-bold text-gold-800 font-price shrink-0">
                Cash on Delivery
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-forest-600 mt-1 font-sans leading-relaxed">
              Provide your delivery info and complete your order with verified Cash on Delivery.
            </p>
          </div>
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
    </div>
  )
}
