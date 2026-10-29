import { timingSafeEqualStrings } from '@/lib/utils/order-token'

export type OrderAccessLevel = 'full' | 'partial' | 'gate' | 'not_found'

export type OrderStatusType =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface ResolveOrderAccessOrder {
  user_id?: string | null
  access_token?: string | null
}

export interface ResolveOrderAccessUser {
  id: string
}

export interface ResolveOrderAccessParams {
  order: ResolveOrderAccessOrder | null | undefined
  user?: ResolveOrderAccessUser | null
  role?: string | null
  token?: string | null
  cookieVerified?: boolean
}

/**
 * Pure function resolving customer/staff access level for an order.
 *
 * Rules:
 * - Missing order -> 'not_found'
 * - Staff or Admin role -> 'full'
 * - Authenticated Owner (user.id === order.user_id) -> 'full'
 * - Valid token matching order.access_token (constant-time compare) -> 'full'
 * - Signed httpOnly phone-verification cookie verified -> 'partial'
 * - Otherwise (including logged-in non-owner without token/cookie) -> 'gate'
 */
export function resolveOrderAccess({
  order,
  user,
  role,
  token,
  cookieVerified = false,
}: ResolveOrderAccessParams): OrderAccessLevel {
  if (!order) {
    return 'not_found'
  }

  // 1. Staff or admin role gets full access
  if (role === 'staff' || role === 'admin') {
    return 'full'
  }

  // 2. Authenticated owner gets full access
  if (user?.id && order.user_id && order.user_id === user.id) {
    return 'full'
  }

  // 3. Valid access token (constant-time timingSafeEqualStrings) gets full access
  if (token && order.access_token && timingSafeEqualStrings(token, order.access_token)) {
    return 'full'
  }

  // 4. Verified guest phone cookie gets redacted partial tracking view
  if (cookieVerified) {
    return 'partial'
  }

  // 5. Otherwise, show security verification gate (including logged-in non-owner)
  return 'gate'
}

/**
 * Checks if a pending order is cancelable (placed within the last 24 hours).
 */
export function isOrderCancelable(createdAtStr: string, status: string): boolean {
  if (status !== 'pending') return false
  const createdAt = new Date(createdAtStr)
  return createdAt.getTime() > Date.now() - 24 * 60 * 60 * 1000
}

export interface RedactedOrderItem {
  id: string
  product_name: string
  qty: number
}

/**
 * Pre-redacted DTO for partial view and phone verification gate.
 * Contains ONLY public tracking fields.
 * Strictly excludes: customer_name, phone, email, guest_email, address, notes, access_token, user_id, financial columns.
 */
export interface RedactedOrderDTO {
  order_number: string
  status: OrderStatusType
  created_at?: string
  items: RedactedOrderItem[]
}

export interface FullOrderItemDTO {
  id: string
  product_name: string
  qty: number
  price_at_purchase: number
}

export interface FullOrderDTO {
  id: string
  order_number: string
  customer_name: string
  phone: string
  guest_email: string | null
  address: string
  notes: string | null
  fulfillment_type: 'delivery' | 'pickup'
  delivery_zone: 'inside_dhaka' | 'outside_dhaka' | null
  subtotal: number
  delivery_fee: number
  total: number
  status: OrderStatusType
  created_at: string
}
