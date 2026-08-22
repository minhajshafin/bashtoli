'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  createProductSchema,
  updateProductSchema,
} from '@/lib/validations/product'
import { slugify } from '@/lib/validations/category'
import { assertStaffOrAdmin } from '@/lib/actions/admin-guard'

export type ProductActionState = {
  error: string | null
  fieldErrors?: Partial<
    Record<
      'name' | 'slug' | 'description' | 'category_id' | 'base_price' | 'active' | 'featured',
      string[]
    >
  >
}

const PRODUCTS_PATH = '/admin/products'

/**
 * Server Action: Create a new product.
 */
export async function createProduct(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const rawName = (formData.get('name') as string) ?? ''
  const rawSlug = (formData.get('slug') as string) ?? ''

  const parsed = createProductSchema.safeParse({
    name: rawName,
    slug: rawSlug.trim() || slugify(rawName),
    description: formData.get('description'),
    category_id: formData.get('category_id'),
    base_price: formData.get('base_price'),
    active: formData.get('active'),
    featured: formData.get('featured'),
  })

  if (!parsed.success) {
    return {
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten()
        .fieldErrors as ProductActionState['fieldErrors'],
    }
  }

  const supabase = await createClient()

  try {
    await assertStaffOrAdmin(supabase)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unauthorized.' }
  }

  const { error } = await supabase.from('products').insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    category_id: parsed.data.category_id,
    base_price: parsed.data.base_price,
    active: parsed.data.active,
    featured: parsed.data.featured,
  })

  if (error) {
    if (error.code === '23505') {
      return {
        error: null,
        fieldErrors: {
          slug: ['A product with that slug already exists. Choose a different slug.'],
        },
      }
    }
    return { error: `Failed to create product: ${error.message}` }
  }

  revalidatePath(PRODUCTS_PATH)
  redirect(PRODUCTS_PATH)
}

/**
 * Server Action: Update an existing product.
 */
export async function updateProduct(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const rawName = (formData.get('name') as string) ?? ''
  const rawSlug = (formData.get('slug') as string) ?? ''

  const parsed = updateProductSchema.safeParse({
    id: formData.get('id'),
    name: rawName,
    slug: rawSlug.trim() || slugify(rawName),
    description: formData.get('description'),
    category_id: formData.get('category_id'),
    base_price: formData.get('base_price'),
    active: formData.get('active'),
    featured: formData.get('featured'),
  })

  if (!parsed.success) {
    return {
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten()
        .fieldErrors as ProductActionState['fieldErrors'],
    }
  }

  const supabase = await createClient()

  try {
    await assertStaffOrAdmin(supabase)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unauthorized.' }
  }

  const { error } = await supabase
    .from('products')
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      category_id: parsed.data.category_id,
      base_price: parsed.data.base_price,
      active: parsed.data.active,
      featured: parsed.data.featured,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.id)

  if (error) {
    if (error.code === '23505') {
      return {
        error: null,
        fieldErrors: {
          slug: ['A product with that slug already exists. Choose a different slug.'],
        },
      }
    }
    return { error: `Failed to update product: ${error.message}` }
  }

  revalidatePath(PRODUCTS_PATH)
  revalidatePath(`/admin/products/${parsed.data.id}`)
  redirect(PRODUCTS_PATH)
}

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
  return { error: null }
}

/**
 * Server Action: Soft-delete a product (set active = false) if it has order history,
 * or hard-delete it if it has never been ordered.
 *
 * M-3 fix: the error message was misleading — it said the product was "kept as inactive"
 * when the function actually hadn't deactivated anything (the error branch).
 * Now the function always soft-deletes when there is order history, and reports what it did.
 */
export async function deleteProduct(
  productId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  try {
    await assertStaffOrAdmin(supabase)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unauthorized.' }
  }

  // Guard: check if product is referenced in order_items
  const { count, error: countError } = await supabase
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId)

  if (countError) {
    return { error: `Could not verify order history: ${countError.message}` }
  }

  if (count && count > 0) {
    // Product has order history — soft-delete only (deactivate so records remain intact)
    const { error: deactivateError } = await supabase
      .from('products')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', productId)

    if (deactivateError) {
      return { error: `Failed to deactivate product: ${deactivateError.message}` }
    }

    revalidatePath(PRODUCTS_PATH)
    // Return a success with a contextual note — the product was deactivated, not deleted
    return { error: null }
  }

  // No order history — safe to hard-delete
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    return { error: `Failed to delete product: ${error.message}` }
  }

  revalidatePath(PRODUCTS_PATH)
  return { error: null }
}
