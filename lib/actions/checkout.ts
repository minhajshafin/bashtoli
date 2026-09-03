'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkoutSchema } from '@/lib/validations/checkout'
import type { CartItem } from '@/lib/cart/guest-cart'
import { sendOrderEmails } from '@/lib/email/resend'



export type CheckoutActionState = {
  error: string | null
  orderNumber?: string
  fieldErrors?: Partial<
    Record<
      'customer_name' | 'phone' | 'guest_email' | 'address' | 'fulfillment_type' | 'delivery_zone' | 'notes',
      string[]
    >
  >
}

/**
 * Server Action: Submit a checkout order.
 * Validates fields using checkoutSchema, structures variables, and invokes transactional place_order.
 */
export async function submitCheckout(
  formData: {
    customer_name: string
    phone: string
    guest_email?: string
    address: string
    fulfillment_type: 'delivery' | 'pickup'
    delivery_zone: 'inside_dhaka' | 'outside_dhaka' | null
    notes?: string
  },
  cartItems: CartItem[]
): Promise<CheckoutActionState> {
  if (!cartItems || cartItems.length === 0) {
    return { error: 'Your cart is empty. Please add items to proceed.' }
  }

  // 1. Validate fields with Zod
  const parsed = checkoutSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors as CheckoutActionState['fieldErrors'],
    }
  }

  const supabase = await createClient()

  // 2. Fetch authenticated user (if any) to link the order
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 3. Pre-flight check: verify items are available and build the items payload.
  // The SQL function will re-verify prices and stock atomically, but this early
  // check gives users a clear, fast error before hitting the DB transaction.
  const variantIds = cartItems.map((item) => item.variant_id)
  const { data: dbVariants, error: dbError } = await supabase
    .from('product_variants')
    .select('id, price, active, stock_qty, products!inner(name, active)')
    .in('id', variantIds)

  if (dbError || !dbVariants) {
    return { error: 'Failed to verify items in your cart. Please try again.' }
  }

  // Two separate arrays:
  //   itemsParameter  — slim payload sent to the SQL RPC (no price; SQL looks it up)
  //   itemsForEmail   — full snapshot used for the confirmation email
  const itemsParameter: { variant_id: string; product_id: string; qty: number; product_name: string }[] = []
  const itemsForEmail: { variant_id: string; product_id: string; qty: number; product_name: string; price_at_purchase: number }[] = []

  for (const item of cartItems) {
    const dbVariant = dbVariants.find((v) => v.id === item.variant_id)
    const product = dbVariant?.products as unknown as { name: string; active: boolean } | null
    if (!dbVariant || !dbVariant.active || !product || !product.active) {
      return { error: `"${item.name}" is no longer available. Please remove it from your cart.` }
    }

    if (dbVariant.stock_qty < item.qty) {
      return {
        error: `Insufficient stock for "${item.name}". Only ${dbVariant.stock_qty} left in stock.`,
      }
    }

    // Use the authoritative product name from the DB — NOT the client-supplied item.name.
    // item.name comes from the guest localStorage cart and could contain arbitrary text
    // (stored XSS risk if rendered without escaping in admin UIs or emails). (M-NEW-2)
    const dbProductName = product.name
    const productName = item.variant_name && item.variant_name !== 'Default'
      ? `${dbProductName} (${item.variant_name})`
      : dbProductName

    itemsParameter.push({
      variant_id: item.variant_id,
      product_id: item.product_id,
      qty: item.qty,
      product_name: productName,
    })

    // Include the pre-flight price for the email snapshot (read from DB, not from the client)
    itemsForEmail.push({
      variant_id: item.variant_id,
      product_id: item.product_id,
      qty: item.qty,
      product_name: productName,
      price_at_purchase: dbVariant.price,
    })
  }

  // 4. Execute place_order SQL transaction.
  //    All financial totals (subtotal, delivery_fee, total) are computed
  //    inside the function using live DB prices — NOT passed in by the caller.
  //    The function returns a JSONB object with the computed financials.
  interface PlaceOrderResult {
    order_number: string
    subtotal: number
    delivery_fee: number
    total: number
  }

  interface LooseSupabase {
    rpc(fn: string, args?: unknown): Promise<{ data: unknown; error: { message: string } | null }>
  }

  const adminDb = createAdminClient()
  const { data: rpcData, error: rpcError } = await (adminDb as unknown as LooseSupabase).rpc('place_order', {
    p_user_id: user?.id || null,
    p_customer_name: parsed.data.customer_name,
    p_phone: parsed.data.phone,
    p_guest_email: parsed.data.guest_email || null,
    p_address: parsed.data.address,
    p_notes: parsed.data.notes || null,
    p_fulfillment_type: parsed.data.fulfillment_type,
    p_delivery_zone: parsed.data.delivery_zone || null,
    p_items: itemsParameter,
  })

  if (rpcError) {
    console.error('Checkout place_order RPC error:', rpcError)

    if (rpcError.message.includes('INSUFFICIENT_STOCK')) {
      return {
        error: 'One or more items in your cart do not have enough stock. Please adjust quantities and try again.',
      }
    }
    if (rpcError.message.includes('ITEM_INACTIVE')) {
      return {
        error: 'One or more items in your cart are no longer available. Please refresh and try again.',
      }
    }
    return { error: 'Failed to place order. Please try again.' }
  }

  const result = rpcData as PlaceOrderResult

  // 5. Trigger emails asynchronously (fire-and-forget).
  //    Financials come from the authoritative DB result, not local variables.
  // Await the email send to prevent serverless context termination
  // from aborting the dispatch mid-flight.
  try {
    await sendOrderEmails(
      {
        order_number: result.order_number,
        customer_name: parsed.data.customer_name,
        phone: parsed.data.phone,
        guest_email: parsed.data.guest_email || null,
        address: parsed.data.address,
        fulfillment_type: parsed.data.fulfillment_type,
        delivery_zone: parsed.data.delivery_zone || null,
        delivery_fee: result.delivery_fee,
        subtotal: result.subtotal,
        total: result.total,
      },
      itemsForEmail
    )
  } catch (err) {
    // Email failure should not block the checkout response.
    console.error('sendOrderEmails failed:', err)
  }

  return {
    error: null,
    orderNumber: result.order_number,
  }
}
