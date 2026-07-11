'use server'

import { validateCartItems, type ValidatedCartItem } from '@/lib/queries/cart'

/**
 * Server Action: Validates a list of variant IDs in the database.
 * Returns the current prices, stocks, and active flags.
 */
export async function checkCartItemsAvailability(
  variantIds: string[]
): Promise<ValidatedCartItem[]> {
  try {
    return await validateCartItems(variantIds)
  } catch (error) {
    console.error('Failed to validate cart items:', error)
    return []
  }
}
