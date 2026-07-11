'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  productOptionsSchema,
  variantInlineUpdateSchema,
} from '@/lib/validations/variant'
import { generateOptionCombinations } from '@/lib/utils/generate-variants'
import type { Database } from '@/lib/supabase/database.types'

type OptionInput = {
  name: string
  values: string[]
}

const PRODUCTS_PATH = '/admin/products'

/**
 * Checks if two flat JSON option value records are equivalent.
 * e.g. { Size: 'S', Color: 'Red' } === { Color: 'Red', Size: 'S' }
 */
function areOptionValuesEqual(v1: unknown, v2: unknown): boolean {
  if (!v1 || !v2 || typeof v1 !== 'object' || typeof v2 !== 'object') return false
  const o1 = v1 as Record<string, unknown>
  const o2 = v2 as Record<string, unknown>
  const keys1 = Object.keys(o1)
  const keys2 = Object.keys(o2)
  if (keys1.length !== keys2.length) return false
  return keys1.every((key) => o1[key] === o2[key])
}

/**
 * Server Action: Save all options and option values for a product,
 * and automatically synchronize the product_variants.
 *
 * It will:
 * 1. Wipe and re-insert product_options and product_option_values.
 * 2. Generate all Cartesian combinations.
 * 3. Match combinations against existing variants to preserve price/stock/SKU.
 * 4. Add new variants.
 * 5. Delete unused variants (or mark active = false if they have order history).
 */
export async function saveProductOptionsAndValues(
  productId: string,
  options: OptionInput[]
): Promise<{ error: string | null }> {
  // Validate incoming options structure
  const parsed = productOptionsSchema.safeParse(options)
  if (!parsed.success) {
    return { error: 'Invalid options data: ' + parsed.error.message }
  }

  const supabase = await createClient()

  // Get product's base price to use as default price for new variants
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('base_price')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    return { error: 'Product not found: ' + (productError?.message ?? '') }
  }

  const basePrice = product.base_price

  // Fetch current variants and any variants referenced in order history
  const [variantsRes, orderItemsRes] = await Promise.all([
    supabase.from('product_variants').select('*').eq('product_id', productId),
    supabase.from('order_items').select('variant_id').eq('product_id', productId),
  ])

  if (variantsRes.error) {
    return { error: 'Failed to fetch variants: ' + variantsRes.error.message }
  }

  const currentVariants = variantsRes.data ?? []
  const orderedVariantIds = new Set(
    orderItemsRes.data?.map((item) => item.variant_id) ?? []
  )

  // Step 1: Remove existing product options (will cascade delete product_option_values)
  const { error: deleteOptsError } = await supabase
    .from('product_options')
    .delete()
    .eq('product_id', productId)

  if (deleteOptsError) {
    return {
      error: 'Failed to clear old options: ' + deleteOptsError.message,
    }
  }

  // Step 2: Insert new options and option values
  for (let i = 0; i < options.length; i++) {
    const optInput = options[i]
    if (optInput.name.trim() === '' || optInput.values.length === 0) {
      continue
    }

    const { data: optionRow, error: optInsertError } = await supabase
      .from('product_options')
      .insert({
        product_id: productId,
        name: optInput.name.trim(),
        sort_order: i,
      })
      .select('id')
      .single()

    if (optInsertError || !optionRow) {
      return {
        error:
          'Failed to insert option axis: ' +
          (optInsertError?.message ?? 'unknown'),
      }
    }

    const valueInserts = optInput.values.map((val, valIndex) => ({
      option_id: optionRow.id,
      value: val.trim(),
      sort_order: valIndex,
    }))

    const { error: valInsertError } = await supabase
      .from('product_option_values')
      .insert(valueInserts)

    if (valInsertError) {
      return {
        error: 'Failed to insert option values: ' + valInsertError.message,
      }
    }
  }

  // Step 3: Compute Cartesian combinations
  const combos = generateOptionCombinations(options)

  const variantsToKeepIds = new Set<string>()
  const newVariantsToInsert: Database['public']['Tables']['product_variants']['Insert'][] = []

  // Check which combos already exist, and which are new
  for (const combo of combos) {
    const existing = currentVariants.find((v) =>
      areOptionValuesEqual(v.option_values, combo)
    )

    if (existing) {
      variantsToKeepIds.add(existing.id)
    } else {
      newVariantsToInsert.push({
        product_id: productId,
        option_values: combo,
        price: basePrice,
        stock_qty: 0,
        active: true,
      })
    }
  }

  // Identify variants that are no longer valid under new options
  const invalidVariants = currentVariants.filter(
    (v) => !variantsToKeepIds.has(v.id)
  )

  // Split invalid variants into those we can delete and those we must soft-deactivate
  const variantsToDeleteIds: string[] = []
  const variantsToDeactivateIds: string[] = []

  for (const iv of invalidVariants) {
    if (orderedVariantIds.has(iv.id)) {
      variantsToDeactivateIds.push(iv.id)
    } else {
      variantsToDeleteIds.push(iv.id)
    }
  }

  // Step 4: Perform Database Sync updates
  // Insert new combinations
  if (newVariantsToInsert.length > 0) {
    const { error: insErr } = await supabase
      .from('product_variants')
      .insert(newVariantsToInsert)
    if (insErr) {
      return { error: 'Failed to insert new variants: ' + insErr.message }
    }
  }

  // Soft-deactivate invalid variants with order history
  if (variantsToDeactivateIds.length > 0) {
    const { error: deacErr } = await supabase
      .from('product_variants')
      .update({ active: false, updated_at: new Date().toISOString() })
      .in('id', variantsToDeactivateIds)
    if (deacErr) {
      return { error: 'Failed to deactivate old variants: ' + deacErr.message }
    }
  }

  // Hard delete invalid variants without order history
  if (variantsToDeleteIds.length > 0) {
    const { error: delErr } = await supabase
      .from('product_variants')
      .delete()
      .in('id', variantsToDeleteIds)
    if (delErr) {
      return { error: 'Failed to delete old variants: ' + delErr.message }
    }
  }

  revalidatePath(`${PRODUCTS_PATH}/${productId}`)
  return { error: null }
}

/**
 * Server Action: Bulk update a list of variants' price, stock, active status and SKU.
 */
export async function updateVariantsBulk(
  productId: string,
  updates: {
    id: string
    price: number
    stock_qty: number
    sku?: string | null
    active: boolean
  }[]
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  // Validate all updates first
  for (const update of updates) {
    const parsed = variantInlineUpdateSchema.safeParse(update)
    if (!parsed.success) {
      return {
        error: `Validation error for variant update: ${parsed.error.issues[0].message}`,
      }
    }
  }

  // Run sequential updates
  for (const update of updates) {
    const { error } = await supabase
      .from('product_variants')
      .update({
        sku: update.sku?.trim() || null,
        price: update.price,
        stock_qty: update.stock_qty,
        active: update.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', update.id)

    if (error) {
      return {
        error: `Failed to update variant ID ${update.id}: ${error.message}`,
      }
    }
  }

  revalidatePath(`${PRODUCTS_PATH}/${productId}`)
  return { error: null }
}

/**
 * Server Action: Toggle variant active status directly.
 */
export async function toggleVariantActive(
  productId: string,
  variantId: string,
  active: boolean
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('product_variants')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', variantId)

  if (error) {
    return { error: `Failed to update variant: ${error.message}` }
  }

  revalidatePath(`${PRODUCTS_PATH}/${productId}`)
  return { error: null }
}
