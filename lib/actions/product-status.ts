'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { assertStaffOrAdmin } from '@/lib/actions/admin-guard'

const PRODUCTS_PATH = '/admin/products'

/**
 * Server Action: Toggle the active state of a product directly.
 */
export async function toggleProductActive(
  productId: string,
  active: boolean
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  try {
    await assertStaffOrAdmin(supabase)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unauthorized.' }
  }

  const { error } = await supabase
    .from('products')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', productId)

  if (error) {
    return { error: `Failed to toggle active state: ${error.message}` }
  }

  revalidatePath(PRODUCTS_PATH)
  revalidatePath('/')
  revalidatePath('/products')
  revalidateTag('products', 'max')
  revalidateTag('featured-products', 'max')
  return { error: null }
}

/**
 * Server Action: Toggle the featured state of a product directly.
 */
export async function toggleProductFeatured(
  productId: string,
  featured: boolean
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  try {
    await assertStaffOrAdmin(supabase)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unauthorized.' }
  }

  const { error } = await supabase
    .from('products')
    .update({ featured, updated_at: new Date().toISOString() })
    .eq('id', productId)

  if (error) {
    return { error: `Failed to toggle featured state: ${error.message}` }
  }

  revalidatePath(PRODUCTS_PATH)
  revalidatePath('/')
  revalidatePath('/products')
  revalidateTag('products', 'max')
  revalidateTag('featured-products', 'max')
  return { error: null }
}
