/**
 * Delivery zone fee configuration.
 *
 * Fees are hardcoded constants for v1 — no database settings table needed.
 * See database.md §7 for the full spec.
 *
 * Usage:
 *   import { DELIVERY_FEES, getDeliveryFee } from '@/lib/config/delivery'
 *
 *   const fee = getDeliveryFee('delivery', 'inside_dhaka') // 70
 *   const fee = getDeliveryFee('pickup')                   // 0
 */

import type { Database } from '@/lib/supabase/database.types'

type FulfillmentType = Database['public']['Enums']['fulfillment_type']
type DeliveryZone = Database['public']['Enums']['delivery_zone']

/** Fee in BDT for each delivery zone */
export const DELIVERY_FEES: Record<DeliveryZone, number> = {
  inside_dhaka: 70,
  outside_dhaka: 120,
} as const

/**
 * Returns the delivery fee in BDT given the fulfillment type and optional zone.
 * - Pickup is always free (0).
 * - Delivery requires a zone; throws if zone is missing.
 */
export function getDeliveryFee(
  fulfillmentType: FulfillmentType,
  zone?: DeliveryZone | null,
): number {
  if (fulfillmentType === 'pickup') return 0
  if (!zone) throw new Error('delivery_zone is required for fulfillment_type = delivery')
  return DELIVERY_FEES[zone]
}
