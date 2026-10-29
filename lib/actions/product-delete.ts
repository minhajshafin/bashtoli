'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { assertStaffOrAdmin } from '@/lib/actions/admin-guard'

const PRODUCTS_PATH = '/admin/products'

/**
 * Server Action: Soft-delete a product (set active = false) if it has order history,
 * or hard-delete it if it has never been ordered.
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
    revalidatePath('/')
    revalidatePath('/products')
    revalidateTag('products', 'max')
    revalidateTag('featured-products', 'max')
    return { error: null }
  }

  // No order history — safe to hard-delete
  // 1. Clean up any uploaded image files from Supabase Storage
  const { data: images } = await supabase
    .from('product_images')
    .select('url')
    .eq('product_id', productId)

  if (images && images.length > 0) {
    const storagePaths = images
      .map((img) => {
        const marker = '/storage/v1/object/public/product-images/'
        const idx = img.url.indexOf(marker)
        if (idx !== -1) return img.url.substring(idx + marker.length)
        try {
          const parsed = new URL(img.url)
          const segments = parsed.pathname.split('/')
          const bucketIdx = segments.indexOf('product-images')
          if (bucketIdx !== -1 && bucketIdx < segments.length - 1) {
            return segments.slice(bucketIdx + 1).join('/')
          }
        } catch {}
        return img.url
      })
      .filter(Boolean)

    if (storagePaths.length > 0) {
      await supabase.storage.from('product-images').remove(storagePaths)
    }
  }

  // 2. Delete product variants first (product_variants has ON DELETE RESTRICT on products)
  const { error: variantsError } = await supabase
    .from('product_variants')
    .delete()
    .eq('product_id', productId)

  if (variantsError) {
    return { error: `Failed to delete product variants: ${variantsError.message}` }
  }

  // 3. Delete product record (product_images, product_options, and wishlist cascade)
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    return { error: `Failed to delete product: ${error.message}` }
  }

  revalidatePath(PRODUCTS_PATH)
  revalidatePath('/')
  revalidatePath('/products')
  revalidateTag('products', 'max')
  revalidateTag('featured-products', 'max')
  return { error: null }
}
