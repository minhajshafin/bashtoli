import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import { OrderStatus } from '@/components/storefront/order-status'
import { OrderLookupForm } from '@/components/storefront/order-lookup-form'
import { WhatsAppLink } from '@/components/storefront/whatsapp-link'
import { CancelOrderButton } from '@/components/storefront/cancel-order-button'

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
      <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center bg-cream-50 px-4 py-16">
        <div className="w-full max-w-md bg-cream-100 border border-forest-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6 text-center animate-fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-800 text-gold-400 mb-2 shadow-sm">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-light text-forest-900"
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic' }}
            >
              Verify Phone Number
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-forest-600 leading-relaxed max-w-xs mx-auto font-light">
              To view details for order <span className="font-semibold text-forest-900">{orderNumber}</span>, please enter the phone number used at checkout.
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
    <div className="relative min-h-[calc(100dvh-4rem)] bg-cream-50 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Botanical corner decorations */}
      <svg
        viewBox="0 0 320 320"
        fill="none"
        className="absolute top-0 right-0 w-64 h-64 md:w-80 md:h-80 pointer-events-none opacity-20"
        aria-hidden="true"
      >
        <path d="M300 10 Q260 70 200 110 Q150 145 170 210 Q185 250 230 270" stroke="#c9a96e" strokeWidth="1.5" fill="none" />
        <path d="M200 90 Q182 65 158 82 Q148 100 168 112 Q188 124 200 90Z" fill="#c9a96e" opacity="0.7" />
        <path d="M240 55 Q222 30 198 47 Q188 65 208 77 Q228 89 240 55Z" fill="#c9a96e" opacity="0.5" />
      </svg>

      <div className="relative z-10 mx-auto max-w-3xl space-y-8">
        {/* Header Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-800 px-4 py-1 text-gold-400 text-xs font-semibold shadow-xs">
            <span>Order Reference</span>
            <span className="font-mono text-cream-100 font-bold tracking-wider">{order.order_number}</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-light text-forest-900 tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', lineHeight: 1.15 }}
          >
            Thank you, {order.customer_name.split(' ')[0]}!
          </h1>
          <p className="text-sm sm:text-base text-forest-600 font-light max-w-md mx-auto">
            Your stationery goods are being carefully prepared and packaged with care.
          </p>
        </div>

        {/* Main Order Card */}
        <div className="bg-cream-100/90 border border-forest-200 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm space-y-8">
          {/* Header row: Order ID + Date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-forest-200">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
                Order Number
              </p>
              <p className="text-xl font-bold text-forest-900 font-mono mt-0.5">
                {order.order_number}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
                Placed On
              </p>
              <p className="text-sm font-medium text-forest-700 mt-0.5">
                {orderDate}
              </p>
            </div>
          </div>

          {/* Stepper block */}
          <div className="pb-6 border-b border-forest-200">
            <OrderStatus status={order.status} />
          </div>

          {/* Delivery Details & Fulfillment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Delivery Info */}
            <div className="rounded-2xl bg-cream-50/90 border border-forest-200/70 p-5 space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
                Delivery Details
              </h3>
              <p className="text-sm font-bold text-forest-900">{order.customer_name}</p>
              <p className="text-sm text-forest-700 font-medium">{order.phone}</p>
              <p className="text-sm text-forest-600 leading-relaxed whitespace-pre-line font-light">
                {order.address}
              </p>
              {order.guest_email && (
                <p className="text-xs text-forest-400 pt-1">{order.guest_email}</p>
              )}
            </div>

            {/* Options */}
            <div className="rounded-2xl bg-cream-50/90 border border-forest-200/70 p-5 space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
                Order Options
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-forest-500 font-light">Method</span>
                  <span className="font-semibold text-forest-900 capitalize">{order.fulfillment_type}</span>
                </div>
                {order.fulfillment_type === 'delivery' && (
                  <div className="flex justify-between items-center">
                    <span className="text-forest-500 font-light">Delivery Zone</span>
                    <span className="font-semibold text-forest-900 capitalize">
                      {order.delivery_zone?.replace('_', ' ')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-forest-500 font-light">Payment</span>
                  <span className="font-semibold text-forest-900">Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer notes if any */}
          {order.notes && (
            <div className="rounded-2xl bg-cream-50 border border-forest-200/80 p-4 text-xs space-y-1">
              <p className="font-bold uppercase tracking-wider text-gold-600 text-[10px]">Customer Notes</p>
              <p className="text-forest-700 italic leading-relaxed">{order.notes}</p>
            </div>
          )}

          {/* Purchased Items breakdown */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
              Purchased Items ({items.length})
            </h3>
            <div className="divide-y divide-forest-200/70">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0 text-sm">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="font-semibold text-forest-900 truncate">{item.product_name}</p>
                    <p className="text-xs text-forest-500 mt-0.5">Quantity: {item.qty}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-forest-900">
                      ৳{(item.price_at_purchase * item.qty).toLocaleString()}
                    </p>
                    {item.qty > 1 && (
                      <p className="text-[10px] text-forest-400 mt-0.5">
                        ৳{item.price_at_purchase.toLocaleString()} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Cost card block */}
          <div className="space-y-3 bg-cream-200/60 p-5 sm:p-6 rounded-2xl border border-forest-200">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-forest-600 font-light">Subtotal</span>
              <span className="font-semibold text-forest-900">৳{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-forest-600 font-light">Shipping & Handling</span>
              <span className="font-semibold text-forest-900">
                {order.delivery_fee === 0 ? (
                  <span className="text-emerald-700 font-bold uppercase tracking-wider text-xs">Free</span>
                ) : (
                  `৳${order.delivery_fee.toLocaleString()}`
                )}
              </span>
            </div>
            <hr className="border-forest-200/80 my-2" />
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm sm:text-base font-bold text-forest-900">Total (COD)</span>
              <span
                className="text-2xl sm:text-3xl font-extrabold text-forest-950"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                ৳{order.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          {isOwner && isPendingAndCancelable && (
            <CancelOrderButton orderId={order.id} />
          )}
          <WhatsAppLink orderNumber={order.order_number} />
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-full bg-gold-500 px-8 text-sm font-bold text-forest-900 shadow-sm hover:bg-gold-400 transition-all active:scale-[0.98]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
