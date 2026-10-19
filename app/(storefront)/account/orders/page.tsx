import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import React from 'react'
import { fetchCustomerOrders } from '@/lib/queries/customer-orders'
import { findUnclaimedGuestOrders } from '@/lib/actions/claim-guest-orders'
import { ClaimOrdersPrompt } from '@/components/storefront/claim-orders-prompt'
import { OrderHistoryList } from '@/components/storefront/order-history-list'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Package } from 'lucide-react'

export async function generateMetadata() {
  return {
    title: 'Order History',
    description: 'View and track all your past Bashtoli orders.',
  }
}

export const instant = false

/**
 * Customer Order History Page.
 * Server component that retrieves and shows customer checkouts and matching claimable guest orders.
 */
export default async function OrderHistoryPage() {
  const supabase = await createClient()

  // Verify auth session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/account/orders')
  }

  // 1. Fetch user order history
  const orders = await fetchCustomerOrders()

  // 2. Fetch any unclaimed guest orders matching email/phone to link
  const claimRes = await findUnclaimedGuestOrders()
  const unclaimedOrders = claimRes.orders || []

  return (
    <div className="space-y-6">
      {/* Top Utility Navigation */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-forest-800/80">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-gold-400 hover:text-gold-300 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Account Overview</span>
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-forest-400">
          PURCHASE ARCHIVE
        </span>
      </div>

      {/* Masthead */}
      <div className="border-b border-forest-800/80 pb-5">
        <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-400/90 mb-1">
          — PURCHASE RECORDS · BASHTOLI STATIONERY
        </p>
        <h1 className="text-2xl sm:text-3xl text-cream-50 font-medium tracking-tight font-display">
          Order History
        </h1>
        <p className="text-xs sm:text-[13px] text-forest-300 mt-1 font-sans leading-relaxed">
          Manage and track your ongoing and past stationery orders.
        </p>
      </div>

      {/* Claim matching guest orders prompt banner */}
      {unclaimedOrders.length > 0 && (
        <ClaimOrdersPrompt initialOrders={unclaimedOrders} />
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-forest-200/90 bg-cream-50 shadow-md text-forest-950 p-8 sm:p-12 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-forest-950 text-gold-400 mb-2 border border-forest-800 shadow-2xs">
            <Package className="h-5 w-5 stroke-[1.75]" />
          </div>
          <p className="text-sm font-semibold text-forest-950 font-display">You haven&apos;t placed any orders yet.</p>
          <p className="text-xs text-forest-600 max-w-sm mx-auto font-sans">Browse our handcrafted notebooks and studio supplies to get started.</p>
          <div className="pt-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-wider text-gold-600 hover:text-gold-700 transition-colors"
            >
              <span>Browse stationery collection</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <OrderHistoryList orders={orders} />
      )}
    </div>
  )
}
