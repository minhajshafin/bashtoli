'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  productImageInsertSchema,
  productImageUpdateSchema,
} from '@/lib/validations/product-image'

const PRODUCTS_PATH = '/admin/products'

/**
 * Helper to extract the relative path inside the storage bucket from a public URL.
 * Example URL:
 *   https://[project].supabase.co/storage/v1/object/public/product-images/570f141c.../1712..._image.webp
 * Output path inside bucket:
 *   570f141c.../1712..._image.webp
 */
function getStoragePathFromUrl(url: string): string {
  const marker = '/storage/v1/object/public/product-images/'
  const index = url.indexOf(marker)
  if (index !== -1) {
    return url.substring(index + marker.length)
  }
  // If URL format doesn't match standard public path, try parsing path segments
  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split('/')
    const bucketIndex = segments.indexOf('product-images')
    if (bucketIndex !== -1 && bucketIndex < segments.length - 1) {
      return segments.slice(bucketIndex + 1).join('/')
    }
  } catch {}
  return url
}

/**
 * Server Action: Add a product image reference to the database.
 * Computes next sort_order automatically.
 */
export async function addProductImage(
  productId: string,
  url: string,
  altText?: string | null
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  // Fetch current max sort_order
  const { data: currentImages, error: fetchErr } = await supabase
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId)

  if (fetchErr) {
    return { error: 'Failed to check existing images: ' + fetchErr.message }
  }

  const maxSortOrder =
    currentImages && currentImages.length > 0
      ? Math.max(...currentImages.map((img) => img.sort_order))
      : -1

  const parsed = productImageInsertSchema.safeParse({
    product_id: productId,
    url,
    alt_text: altText ?? '',
    sort_order: maxSortOrder + 1,
  })

  if (!parsed.success) {
    return {
      error: 'Validation error: ' + parsed.error.issues[0].message,
    }
  }

  const { error: insertErr } = await supabase.from('product_images').insert({
    product_id: parsed.data.product_id,
    url: parsed.data.url,
    alt_text: parsed.data.alt_text,
    sort_order: parsed.data.sort_order,
  })

  if (insertErr) {
    return { error: 'Failed to save image metadata: ' + insertErr.message }
  }

  revalidatePath(`${PRODUCTS_PATH}/${productId}`)
  return { error: null }
}

/**
 * Server Action: Update the alt text of a product image.
 */
export async function updateProductImageAlt(
  imageId: string,
  altText: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  // Fetch current row to preserve sort_order during schema validation
  const { data: current, error: getErr } = await supabase
    .from('product_images')
    .select('*')
    .eq('id', imageId)
    .single()

  if (getErr || !current) {
    return { error: 'Image not found: ' + (getErr?.message ?? '') }
  }

  const parsed = productImageUpdateSchema.safeParse({
    id: imageId,
    alt_text: altText,
    sort_order: current.sort_order,
  })

  if (!parsed.success) {
    return {
      error: 'Validation error: ' + parsed.error.issues[0].message,
    }
  }

  const { error: updateErr } = await supabase
    .from('product_images')
    .update({
      alt_text: parsed.data.alt_text,
    })
    .eq('id', imageId)

  if (updateErr) {
    return { error: 'Failed to update alt text: ' + updateErr.message }
  }

  revalidatePath(`${PRODUCTS_PATH}/${current.product_id}`)
  return { error: null }
}

/**
 * Server Action: Delete a product image from both the database and Supabase Storage.
 */
export async function deleteProductImage(
  imageId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  // Get image metadata to retrieve URL and product ID
  const { data: image, error: getErr } = await supabase
    .from('product_images')
    .select('*')
    .eq('id', imageId)
    .single()

  if (getErr || !image) {
    return { error: 'Image not found: ' + (getErr?.message ?? '') }
  }

  // Step 1: Delete from Database
  const { error: dbDeleteErr } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId)

  if (dbDeleteErr) {
    return { error: 'Failed to delete database record: ' + dbDeleteErr.message }
  }

  // Step 2: Delete from Supabase Storage
  const storagePath = getStoragePathFromUrl(image.url)
  const { error: storageDeleteErr } = await supabase.storage
    .from('product-images')
    .remove([storagePath])

  if (storageDeleteErr) {
    // Note: Log the error but don't fail completely if DB deletion was successful,
    // though warning the user is good.
    console.error('Failed to clean up storage file:', storageDeleteErr.message)
  }

  revalidatePath(`${PRODUCTS_PATH}/${image.product_id}`)
  return { error: null }
}

/**
 * Server Action: Batch update product images sort order.
 */
export async function saveProductImageOrder(
  imagesOrder: { id: string; sort_order: number }[]
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  let productId = ''

  for (const update of imagesOrder) {
    // Fetch row to validate
    const { data: current } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', update.id)
      .single()

    if (!current) continue
    productId = current.product_id

    const parsed = productImageUpdateSchema.safeParse({
      id: update.id,
      alt_text: current.alt_text,
      sort_order: update.sort_order,
    })

    if (!parsed.success) {
      return {
        error: 'Validation error: ' + parsed.error.issues[0].message,
      }
    }

    const { error: updateErr } = await supabase
      .from('product_images')
      .update({ sort_order: parsed.data.sort_order })
      .eq('id', update.id)

    if (updateErr) {
      return {
        error: `Failed to save new sorting position: ${updateErr.message}`,
      }
    }
  }

  if (productId) {
    revalidatePath(`${PRODUCTS_PATH}/${productId}`)
  }

  return { error: null }
}
