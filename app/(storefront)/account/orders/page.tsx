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
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          Order History
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage and track your past orders.
        </p>
      </div>

      {/* Claim matching guest orders prompt banner */}
      {unclaimedOrders.length > 0 && (
        <ClaimOrdersPrompt initialOrders={unclaimedOrders} />
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-3xl dark:border-zinc-800">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-650 mb-3">
            <svg className="h-6 w-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-zinc-400">{"You haven't placed any orders yet."}</p>
          <p className="text-xs text-zinc-405 mt-1">Browse our products and place an order to see it listed here.</p>
        </div>
      ) : (
        <OrderHistoryList orders={orders} />
      )}
    </div>
  )
}
