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
    title: `Order ${resolvedParams.orderNumber} Status | Bashtoli`,
    description: 'Track your Bashtoli purchase status and details.',
    robots: { index: false, follow: false },
  }
}

/**
 * Checks if a pending order is cancelable (placed within the last 24 hours).
 * Declared outside the component render block to keep the component pure.
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
      <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm dark:bg-zinc-950 dark:border-zinc-800 space-y-6 animate-fade-in">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 mb-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Verify Phone Number
            </h1>
            <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto leading-normal">
              To view details for order <span className="font-bold text-zinc-700 dark:text-zinc-300">{orderNumber}</span>, please enter the phone number associated with it.
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
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Confirmation Success Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500 mb-4 animate-bounce">
          <svg className="h-8 w-8 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          Order Status
        </h1>
        <p className="mt-2.5 text-sm text-zinc-500 max-w-md dark:text-zinc-400">
          Order status and details for <span className="font-bold text-zinc-800 dark:text-zinc-200">{order.customer_name}</span>.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm dark:bg-zinc-950 dark:border-zinc-800 space-y-6">
        {/* Order Details Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Order Number</p>
            <p className="text-lg font-black text-zinc-900 dark:text-zinc-50">{order.order_number}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Placed On</p>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-350">{orderDate}</p>
          </div>
        </div>

        {/* Visual Stepper */}
        <div className="pb-5 border-b border-zinc-100 dark:border-zinc-800">
          <OrderStatus status={order.status} />
        </div>

        {/* Shipping details block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Delivery Details</h3>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{order.customer_name}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{order.phone}</p>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 mt-0.5 whitespace-pre-line">{order.address}</p>
            {order.guest_email && <p className="text-xs text-zinc-400 mt-1.5">{order.guest_email}</p>}
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Order Options</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Method</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 capitalize">{order.fulfillment_type}</span>
              </div>
              {order.fulfillment_type === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Zone</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 capitalize">
                    {order.delivery_zone?.replace('_', ' ')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Payment</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order notes if any */}
        {order.notes && (
          <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 text-xs text-zinc-650 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400">
            <p className="font-bold text-zinc-850 dark:text-zinc-250 mb-0.5">Customer Notes</p>
            <p className="italic">{order.notes}</p>
          </div>
        )}

        {/* Itemized List breakdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Purchased Items</h3>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-zinc-900 dark:text-zinc-50 truncate">{item.product_name}</p>
                  <p className="text-xs text-zinc-405 mt-0.5">Quantity: {item.qty}</p>
                </div>
                <div className="text-right pl-4">
                  <p className="font-bold text-zinc-900 dark:text-zinc-50">৳{(item.price_at_purchase * item.qty).toLocaleString()}</p>
                  {item.qty > 1 && (
                    <p className="text-[10px] text-zinc-400 mt-0.5">৳{item.price_at_purchase.toLocaleString()} each</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-zinc-100 dark:border-zinc-800" />

        {/* Total Cost card block */}
        <div className="space-y-3 bg-stone-50/50 p-5 rounded-2xl border border-zinc-150 dark:bg-zinc-900/20 dark:border-zinc-800">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-zinc-500">Subtotal</span>
            <span className="text-zinc-950 dark:text-zinc-50">৳{order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-zinc-500">Shipping & Handling</span>
            <span className="text-zinc-950 dark:text-zinc-50">
              {order.delivery_fee === 0 ? 'Free' : `৳${order.delivery_fee.toLocaleString()}`}
            </span>
          </div>
          <hr className="border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Total (COD)</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
              ৳{order.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Continue shopping links CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
        {isOwner && isPendingAndCancelable && (
          <CancelOrderButton orderId={order.id} />
        )}
        <WhatsAppLink orderNumber={order.order_number} />
        <Link
          href="/products"
          className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-bold text-white shadow-md hover:bg-zinc-800 transition-colors dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
