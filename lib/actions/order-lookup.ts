'use server'

import { createClient } from '@/lib/supabase/server'
import { orderLookupSchema } from '@/lib/validations/order-lookup'

export type OrderLookupActionState = {
  error: string | null
  success?: boolean
  fieldErrors?: Partial<Record<'order_number' | 'phone', string[]>>
}

/**
 * Server Action: Validates user entries and queries matching orders.
 * Returns success or a generic error to prevent order discovery.
 */
export async function lookupOrder(formData: {
  order_number: string
  phone: string
}): Promise<OrderLookupActionState> {
  // 1. Zod schema validation
  const parsed = orderLookupSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()

  // 2. Query matching order (must match BOTH number and phone)
  const { data: order, error } = await supabase
    .from('orders')
    .select('id')
    .eq('order_number', parsed.data.order_number)
    .eq('phone', parsed.data.phone)
    .maybeSingle()

  if (error || !order) {
    if (error) console.error('Lookup database error:', error)
    return {
      error: 'Order not found. Please double-check the order number and phone number.',
    }
  }

  return {
    error: null,
    success: true,
  }
}
