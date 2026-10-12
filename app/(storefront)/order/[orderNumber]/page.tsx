import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import { OrderStatus } from '@/components/storefront/order-status'
import { OrderLookupForm } from '@/components/storefront/order-lookup-form'
import { WhatsAppLink } from '@/components/storefront/whatsapp-link'
import { CancelOrderButton } from '@/components/storefront/cancel-order-button'
import { CheckoutSteps } from '@/components/storefront/checkout-steps'
import { PrintReceiptButton } from '@/components/storefront/print-receipt-button'

interface OrderPageProps {
  params: Promise<{
    orderNumber: string
  }>
  searchParams: Promise<{
    phone?: string
  }>
}

export async function generateMetadata({ params }: OrderPageProps) {
  const resolvedParams = await params
  return {
    title: `Order ${resolvedParams.orderNumber} | Bashtoli`,
    description: 'Track your Bashtoli order status and purchase details.',
    robots: { index: false, follow: false },
  }
}

/**
 * Checks if a pending order is cancelable (placed within the last 24 hours).
 */
function isOrderCancelable(createdAtStr: string, status: string): boolean {
  if (status !== 'pending') return false
  const createdAt = new Date(createdAtStr)
  return createdAt.getTime() > Date.now() - 24 * 60 * 60 * 1000
}

export const instant = false

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: OrderPageProps) {
  const resolvedParams = await params
  const { orderNumber } = resolvedParams

  const resolvedSearchParams = await searchParams
  const phoneParam = resolvedSearchParams?.phone

  // Use admin client to bypass guest select RLS policy
  const adminDb = createAdminClient()

  // 1. Fetch order details
  const { data: order, error: orderError } = await adminDb
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (orderError || !order) {
    if (orderError) console.error('Error fetching order details:', orderError)
    notFound()
  }

  // 2. Access control logic: verify owner session or phone check
  const client = await createClient()
  const {
    data: { user },
  } = await client.auth.getUser()

  const isOwner = user && order.user_id === user.id
  const isGuestVerified =
    phoneParam && phoneParam.trim() === order.phone.trim()

  const hasAccess = isOwner || isGuestVerified

  // If no access, show phone verification gate
  if (!hasAccess) {
    return (
      <div className="min-h-[calc(100dvh-5rem)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-cream-100/70 border border-forest-200/80 rounded-3xl p-8 sm:p-10 shadow-2xs space-y-6 text-center animate-fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-900 text-gold-400 mb-2 shadow-xs border border-forest-800">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium text-forest-950 font-display">
              Verify Phone Number
            </h1>
            <p className="mt-2 text-xs sm:text-[13px] text-forest-600 leading-relaxed max-w-xs mx-auto font-sans">
              To view details for order <span className="font-semibold text-forest-950 font-mono">{orderNumber}</span>, please enter the phone number provided at checkout.
            </p>
          </div>

          <OrderLookupForm initialOrderNumber={orderNumber} />
        </div>
      </div>
    )
  }

  // 3. Fetch order items (only if access granted)
  const { data: itemsData, error: itemsError } = await adminDb
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)

  if (itemsError) {
    console.error('Error fetching order items:', itemsError)
  }

  const items = itemsData || []
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const isPendingAndCancelable = isOrderCancelable(order.created_at, order.status)

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] px-4 py-8 sm:px-6 lg:px-8 xl:px-10 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-3xl space-y-6 sm:space-y-8">
        {/* 3-Step Visual Progress Track */}
        <div className="print:hidden">
          <CheckoutSteps currentStep={3} />
        </div>

        {/* Header Banner */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-900 border border-forest-800 px-3.5 py-1 text-gold-400 text-xs font-semibold shadow-2xs">
            <span className="text-[10px] uppercase tracking-widest text-forest-400 font-sans">Order Placed</span>
            <span className="font-mono text-cream-100 font-bold tracking-wider">{order.order_number}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-[2.2rem] font-medium text-forest-950 tracking-tight font-display">
            Thank you, {order.customer_name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-[13px] text-forest-600 font-sans max-w-md mx-auto">
            Your stationery goods are confirmed. We are carefully packaging your items at our Dhaka shop.
          </p>
        </div>

        {/* Main Order Card / Receipt */}
        <div className="bg-cream-100/70 border border-forest-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-9 shadow-2xs space-y-6 sm:space-y-7 print:bg-white print:border-none print:shadow-none print:p-0">
          {/* Header row: Order ID + Date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-forest-200/80">
            <div>
              <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
                Official Order Reference
              </p>
              <p className="text-base sm:text-lg font-bold text-forest-950 font-mono mt-0.5">
                {order.order_number}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
                Placement Timestamp
              </p>
              <p className="text-xs sm:text-sm font-medium text-forest-700 mt-0.5 font-sans">
                {orderDate}
              </p>
            </div>
          </div>

          {/* Stepper block */}
          <div className="pb-5 border-b border-forest-200/80 print:hidden">
            <OrderStatus status={order.status} />
          </div>

          {/* Delivery Details & Fulfillment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery Info */}
            <div className="rounded-2xl bg-cream-50/90 border border-forest-200/70 p-4 sm:p-5 space-y-2">
              <h3 className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
                Recipient Details
              </h3>
              <p className="text-sm font-semibold text-forest-950 font-sans">{order.customer_name}</p>
              <p className="text-xs font-mono text-forest-700">{order.phone}</p>
              <p className="text-xs sm:text-[13px] text-forest-600 leading-relaxed whitespace-pre-line font-sans pt-0.5">
                {order.address}
              </p>
              {order.guest_email && (
                <p className="text-xs text-forest-400 font-mono pt-1">{order.guest_email}</p>
              )}
            </div>

            {/* Options */}
            <div className="rounded-2xl bg-cream-50/90 border border-forest-200/70 p-4 sm:p-5 space-y-2.5">
              <h3 className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
                Fulfillment &amp; Payment
              </h3>
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-forest-500">Method</span>
                  <span className="font-semibold text-forest-950 capitalize">{order.fulfillment_type === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</span>
                </div>
                {order.fulfillment_type === 'delivery' && (
                  <div className="flex justify-between items-center">
                    <span className="text-forest-500">Region</span>
                    <span className="font-semibold text-forest-950 capitalize">
                      {order.delivery_zone?.replace('_', ' ')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-forest-500">Payment Type</span>
                  <span className="font-semibold text-forest-950">Cash on Delivery (COD)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer notes if any */}
          {order.notes && (
            <div className="rounded-xl bg-cream-50 border border-forest-200/80 p-3.5 text-xs space-y-1">
              <p className="font-sans font-semibold uppercase tracking-wider text-gold-600 text-[10px]">Customer Instructions</p>
              <p className="text-forest-700 italic leading-relaxed">{order.notes}</p>
            </div>
          )}

          {/* Purchased Items breakdown */}
          <div className="space-y-3 pt-1">
            <h3 className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
              Purchased Items ({items.length})
            </h3>
            <div className="divide-y divide-forest-200/70 border-t border-b border-forest-200/70">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 text-xs sm:text-sm font-sans">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="font-medium text-forest-950 truncate">{item.product_name}</p>
                    <p className="text-xs text-forest-500 font-mono mt-0.5">Quantity: {item.qty}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-forest-950 font-price">
                      ৳{(item.price_at_purchase * item.qty).toLocaleString()}
                    </p>
                    {item.qty > 1 && (
                      <p className="text-[10px] text-forest-400 font-price mt-0.5">
                        ৳{item.price_at_purchase.toLocaleString()} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Cost card block */}
          <div className="space-y-2.5 bg-cream-200/50 p-4 sm:p-5 rounded-xl border border-forest-200/80">
            <div className="flex justify-between text-xs sm:text-[13px] font-sans">
              <span className="text-forest-600">Subtotal</span>
              <span className="font-semibold text-forest-950 font-price">৳{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-[13px] font-sans">
              <span className="text-forest-600">Shipping &amp; Delivery</span>
              <span className="font-semibold text-forest-950 font-price">
                {order.delivery_fee === 0 ? (
                  <span className="text-emerald-700 font-semibold uppercase tracking-wider text-xs">Free</span>
                ) : (
                  `৳${order.delivery_fee.toLocaleString()}`
                )}
              </span>
            </div>
            <hr className="border-forest-200/80 my-1" />
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-semibold text-forest-950 font-sans">Total (Pay on Delivery)</span>
              <span className="text-xl sm:text-2xl font-bold text-forest-950 font-price">
                ৳{order.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
          {isOwner && isPendingAndCancelable && (
            <CancelOrderButton orderId={order.id} />
          )}
          <PrintReceiptButton />
          <WhatsAppLink orderNumber={order.order_number} />
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-forest-900 px-6 text-xs font-sans font-semibold uppercase tracking-wider text-cream-50 shadow-xs hover:bg-forest-850 transition-all active:scale-[0.98] cursor-pointer"
          >
            Continue Shopping &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
