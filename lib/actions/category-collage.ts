'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { assertStaffOrAdmin } from '@/lib/actions/admin-guard'
import {
  MAX_FEATURED_CATEGORIES,
  updateCategoryCoverSchema,
  toggleFeaturedCategorySchema,
  reorderFeaturedCategoriesSchema,
} from '@/lib/validations/category-collage'

export type CategoryCollageActionResponse = {
  success: boolean
  error?: string | null
}

/**
 * Server Action: Toggle category featured status on homepage collage (Staff / Admin only).
 * Enforces maximum 7 categories.
 */
export async function toggleCategoryFeaturedAction(
  categoryId: string,
  isFeatured: boolean
): Promise<CategoryCollageActionResponse> {
  try {
    const supabase = await createClient()
    await assertStaffOrAdmin(supabase)

    const parsed = toggleFeaturedCategorySchema.safeParse({
      category_id: categoryId,
      is_featured: isFeatured,
    })

    if (!parsed.success) {
      return { success: false, error: 'Invalid category parameters.' }
    }

    if (isFeatured) {
      // Check count limit
      const { count, error: countError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true)

      if (countError) return { success: false, error: countError.message }

      if ((count ?? 0) >= MAX_FEATURED_CATEGORIES) {
        return {
          success: false,
          error: `Maximum of ${MAX_FEATURED_CATEGORIES} categories can be featured in the collage. Please remove an existing one first.`,
        }
      }

      // Next featured order
      const { data: lastCat } = await supabase
        .from('categories')
        .select('featured_order')
        .eq('is_featured', true)
        .order('featured_order', { ascending: false })
        .limit(1)
        .maybeSingle()

      const nextOrder = (lastCat?.featured_order ?? 0) + 1

      const { error: updateError } = await supabase
        .from('categories')
        .update({
          is_featured: true,
          featured_order: nextOrder,
        })
        .eq('id', categoryId)

      if (updateError) return { success: false, error: updateError.message }
    } else {
      const { error: updateError } = await supabase
        .from('categories')
        .update({
          is_featured: false,
          featured_order: 0,
        })
        .eq('id', categoryId)

      if (updateError) return { success: false, error: updateError.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/storefront')
    revalidatePath('/admin/categories')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update category featured status.',
    }
  }
}

/**
 * Server Action: Update cover image for a category (Staff / Admin only).
 */
export async function updateCategoryCoverImageAction(
  categoryId: string,
  imageUrl: string
): Promise<CategoryCollageActionResponse> {
  try {
    const supabase = await createClient()
    await assertStaffOrAdmin(supabase)

    const parsed = updateCategoryCoverSchema.safeParse({
      category_id: categoryId,
      image_url: imageUrl,
    })

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid image URL.' }
    }

    const { error: updateError } = await supabase
      .from('categories')
      .update({ image_url: parsed.data.image_url })
      .eq('id', categoryId)

    if (updateError) return { success: false, error: updateError.message }

    revalidatePath('/')
    revalidatePath('/admin/storefront')
    revalidatePath('/admin/categories')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update category cover image.',
    }
  }
}

/**
 * Server Action: Reorder featured categories in the collage (Staff / Admin only).
 */
export async function reorderFeaturedCategoriesAction(
  orderedCategoryIds: string[]
): Promise<CategoryCollageActionResponse> {
  try {
    const supabase = await createClient()
    await assertStaffOrAdmin(supabase)

    const parsed = reorderFeaturedCategoriesSchema.safeParse({
      ordered_ids: orderedCategoryIds,
    })

    if (!parsed.success) {
      return { success: false, error: 'Invalid reorder parameters.' }
    }

    for (let i = 0; i < orderedCategoryIds.length; i++) {
      const { error } = await supabase
        .from('categories')
        .update({ featured_order: i + 1 })
        .eq('id', orderedCategoryIds[i])

      if (error) throw error
    }

    revalidatePath('/')
    revalidatePath('/admin/storefront')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to reorder featured categories.',
    }
  }
}
