'use server'

import { createClient } from '@/lib/supabase/server'
import { checkoutSchema } from '@/lib/validations/checkout'
import { getDeliveryFee } from '@/lib/config/delivery'
import type { CartItem } from '@/lib/cart/guest-cart'


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

  // 3. Double-check item details and compute subtotal
  // We compute subtotal and totals server-side using current DB values for safety
  const variantIds = cartItems.map((item) => item.variant_id)
  const { data: dbVariants, error: dbError } = await supabase
    .from('product_variants')
    .select('id, price, active, stock_qty, products!inner(name, active)')
    .in('id', variantIds)

  if (dbError || !dbVariants) {
    return { error: 'Failed to verify items in your cart. Please try again.' }
  }

  let subtotal = 0
  const itemsParameter = []

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

    const currentPrice = dbVariant.price
    subtotal += currentPrice * item.qty

    // Snapshot details for order item insertion
    const productName = item.variant_name && item.variant_name !== 'Default'
      ? `${item.name} (${item.variant_name})`
      : item.name

    itemsParameter.push({
      variant_id: item.variant_id,
      product_id: item.product_id,
      qty: item.qty,
      price_at_purchase: currentPrice,
      product_name: productName,
    })
  }

  let deliveryFee = 0
  try {
    deliveryFee = getDeliveryFee(parsed.data.fulfillment_type, parsed.data.delivery_zone)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid delivery configuration.'
    return { error: errorMsg }
  }

  const total = subtotal + deliveryFee

  interface LooseSupabase {
    rpc(fn: string, args?: unknown): Promise<{ data: unknown; error: { message: string } | null }>
  }

  // 5. Execute place_order SQL transaction
  const { data: orderNumber, error: rpcError } = await (supabase as unknown as LooseSupabase).rpc('place_order', {
    p_user_id: user?.id || null,
    p_customer_name: parsed.data.customer_name,
    p_phone: parsed.data.phone,
    p_guest_email: parsed.data.guest_email || null,
    p_address: parsed.data.address,
    p_notes: parsed.data.notes || null,
    p_fulfillment_type: parsed.data.fulfillment_type,
    p_delivery_zone: parsed.data.delivery_zone || null,
    p_subtotal: subtotal,
    p_delivery_fee: deliveryFee,
    p_total: total,
    p_items: itemsParameter,
  })

  if (rpcError) {
    console.error('Checkout place_order RPC error:', rpcError)
    
    // Check custom stock error message
    if (rpcError.message.includes('INSUFFICIENT_STOCK')) {
      return {
        error: 'One or more items in your cart do not have enough stock. Please adjust quantities and try again.',
      }
    }
    return { error: 'Failed to place order: ' + rpcError.message }
  }

  return {
    error: null,
    orderNumber: orderNumber as string,
  }
}
