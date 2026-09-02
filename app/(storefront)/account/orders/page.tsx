import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import React from 'react'
import { fetchCustomerOrders } from '@/lib/queries/customer-orders'
import { findUnclaimedGuestOrders } from '@/lib/actions/claim-guest-orders'
import { ClaimOrdersPrompt } from '@/components/storefront/claim-orders-prompt'
import { OrderHistoryList } from '@/components/storefront/order-history-list'

export async function generateMetadata() {
  return {
    title: 'Order History | Bashtoli',
    description: 'View and track all your past Bashtoli orders.',
  }
}

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
      <div className="border-b border-forest-200 pb-5">
        <p className="text-[11px] uppercase tracking-[0.25em] text-gold-500 font-bold mb-1">
          History
        </p>
        <h1
          className="text-2xl sm:text-3xl text-forest-900 font-normal tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic' }}
        >
          Order History
        </h1>
        <p className="text-xs text-forest-600 mt-1 font-light">
          Manage and track your ongoing and past orders.
        </p>
      </div>

      {/* Claim matching guest orders prompt banner */}
      {unclaimedOrders.length > 0 && (
        <ClaimOrdersPrompt initialOrders={unclaimedOrders} />
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-forest-200 bg-cream-100/50 rounded-3xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 text-forest-500 mb-3">
            <svg className="h-6 w-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-forest-900">You haven&apos;t placed any orders yet.</p>
          <p className="text-xs text-forest-500 mt-1">Browse our products and place an order to see it listed here.</p>
        </div>
      ) : (
        <OrderHistoryList orders={orders} />
      )}
    </div>
  )
}
