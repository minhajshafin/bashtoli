'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  variantInlineUpdateSchema,
  type VariantInlineUpdateType,
} from '@/lib/validations/variant'
import { assertStaffOrAdmin } from '@/lib/actions/admin-guard'

const PRODUCTS_PATH = '/admin/products'

/**
 * Server Action: Bulk update a list of variants' price, stock, active status and SKU.
 */
export async function updateVariantsBulk(
  productId: string,
  updates: {
    id: string
    price: number | string
    stock_qty: number | string
    sku?: string | null
    active: boolean
  }[]
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  try {
    await assertStaffOrAdmin(supabase)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unauthorized.' }
  }

  // Validate and coerce all updates first
  const validatedUpdates: VariantInlineUpdateType[] = []
  for (const update of updates) {
    const parsed = variantInlineUpdateSchema.safeParse(update)
    if (!parsed.success) {
      return {
        error: `Validation error for variant update: ${parsed.error.issues[0]?.message ?? 'Invalid variant data'}`,
      }
    }
    validatedUpdates.push(parsed.data)
  }

  // Run sequential updates using clean, validated and coerced data
  for (const update of validatedUpdates) {
    const { error } = await supabase
      .from('product_variants')
      .update({
        sku: update.sku ?? null,
        price: update.price,
        stock_qty: update.stock_qty,
        active: update.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', update.id)
      .eq('product_id', productId) // Prevent IDOR — ensure variant belongs to this product (L-NEW-4)

    if (error) {
      return {
        error: `Failed to update variant ID ${update.id}: ${error.message}`,
      }
    }
  }

  // Synchronize products.base_price with variant pricing
  const { data: allVariants } = await supabase
    .from('product_variants')
    .select('price, active')
    .eq('product_id', productId)

  if (allVariants && allVariants.length > 0) {
    const activeVariants = allVariants.filter((v) => v.active)
    const candidateVariants = activeVariants.length > 0 ? activeVariants : allVariants
    const lowestPrice = Math.min(...candidateVariants.map((v) => Number(v.price)))

    if (Number.isFinite(lowestPrice)) {
      await supabase
        .from('products')
        .update({
          base_price: lowestPrice,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
    }
  }

  // Revalidate admin and storefront paths
  const { data: prod } = await supabase
    .from('products')
    .select('slug')
    .eq('id', productId)
    .maybeSingle()

  revalidatePath(PRODUCTS_PATH)
  revalidatePath(`${PRODUCTS_PATH}/${productId}`)
  revalidatePath('/')
  revalidatePath('/products')
  revalidateTag('products', 'max')
  revalidateTag('featured-products', 'max')
  if (prod?.slug) {
    revalidatePath(`/products/${prod.slug}`)
  }

  return { error: null }
}
