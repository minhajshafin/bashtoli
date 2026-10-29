import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import React from 'react'
import { cookies } from 'next/headers'
import { isOrderCookieVerified } from '@/lib/utils/order-token'
import {
  resolveOrderAccess,
  type FullOrderDTO,
  type FullOrderItemDTO,
  type RedactedOrderDTO,
} from '@/lib/order/access'
import { FullOrderView } from '@/components/storefront/order/full-order-view'
import {
  PartialOrderView,
  OrderPhoneVerificationGate,
} from '@/components/storefront/order/partial-order-view'

interface OrderPageProps {
  params: Promise<{
    orderNumber: string
  }>
  searchParams: Promise<{
    token?: string
  }>
}

export async function generateMetadata({ params }: OrderPageProps) {
  const resolvedParams = await params
  return {
    title: `Order #${resolvedParams.orderNumber}`,
    description: 'Track your Bashtoli order status and purchase details.',
    robots: { index: false, follow: false },
  }
}

export const instant = false

/**
 * Order Confirmation & Tracking Page Orchestrator.
 * Queries minimum columns for access decision first, then delegates rendering to
 * FullOrderView or PartialOrderView / OrderPhoneVerificationGate.
 */
export default async function OrderConfirmationPage({
  params,
  searchParams,
}: OrderPageProps) {
  const resolvedParams = await params
  const { orderNumber } = resolvedParams

  const resolvedSearchParams = await searchParams
  const tokenParam = resolvedSearchParams?.token

  // 1. Fetch only the minimum columns required for the access decision
  const adminDb = createAdminClient()
  const { data: initialOrder, error: orderError } = await adminDb
    .from('orders')
    .select('id, order_number, user_id, access_token')
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (orderError) {
    console.error('Error fetching order for access check:', orderError)
  }

  // 2. Fetch authenticated user and profile role if a session exists
  const client = await createClient()
  const {
    data: { user },
  } = await client.auth.getUser()

  let role: string | null = null
  if (user) {
    const { data: profile } = await client
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    role = profile?.role ?? null
  }

  // 3. Check for signed httpOnly phone-verification cookie
  const cookieStore = await cookies()
  const cookieVerified = initialOrder
    ? isOrderCookieVerified(cookieStore, initialOrder.order_number)
    : false

  // 4. Resolve access decision
  const access = resolveOrderAccess({
    order: initialOrder,
    user,
    role,
    token: tokenParam,
    cookieVerified,
  })

  // 5. Handle routing based on resolved access level
  if (access === 'not_found') {
    notFound()
  }

  if (access === 'gate') {
    const gateDTO: RedactedOrderDTO = {
      order_number: initialOrder!.order_number,
      status: 'pending',
      items: [],
    }
    return <OrderPhoneVerificationGate order={gateDTO} />
  }

  if (access === 'partial') {
    const [{ data: partialOrder, error: partialOrderError }, { data: partialItems, error: partialItemsError }] =
      await Promise.all([
        adminDb
          .from('orders')
          .select('status, created_at')
          .eq('id', initialOrder!.id)
          .single(),
        adminDb
          .from('order_items')
          .select('id, product_name, qty')
          .eq('order_id', initialOrder!.id),
      ])

    if (partialOrderError) {
      console.error('Error fetching partial order details:', partialOrderError)
    }
    if (partialItemsError) {
      console.error('Error fetching partial order items:', partialItemsError)
    }

    const partialDTO: RedactedOrderDTO = {
      order_number: initialOrder!.order_number,
      status: partialOrder?.status ?? 'pending',
      created_at: partialOrder?.created_at,
      items: (partialItems || []).map((i) => ({
        id: i.id,
        product_name: i.product_name,
        qty: i.qty,
      })),
    }

    return <PartialOrderView order={partialDTO} />
  }

  // access === 'full'
  const [{ data: fullOrder, error: fullOrderError }, { data: fullItems, error: fullItemsError }] =
    await Promise.all([
      adminDb
        .from('orders')
        .select(
          'id, order_number, customer_name, phone, guest_email, address, notes, fulfillment_type, delivery_zone, subtotal, delivery_fee, total, status, created_at'
        )
        .eq('id', initialOrder!.id)
        .single(),
      adminDb
        .from('order_items')
        .select('id, product_name, qty, price_at_purchase')
        .eq('order_id', initialOrder!.id),
    ])

  if (fullOrderError || !fullOrder) {
    if (fullOrderError) console.error('Error fetching full order details:', fullOrderError)
    notFound()
  }

  if (fullItemsError) {
    console.error('Error fetching full order items:', fullItemsError)
  }

  const isOwner = Boolean(user?.id && initialOrder!.user_id && initialOrder!.user_id === user.id)

  return (
    <FullOrderView
      order={fullOrder as FullOrderDTO}
      items={(fullItems || []) as FullOrderItemDTO[]}
      isOwner={isOwner}
    />
  )
}
