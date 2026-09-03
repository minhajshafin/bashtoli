'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { assertStaffOrAdmin } from '@/lib/actions/admin-guard'
import {
  heroSlideSchema,
  HERO_SLIDE_MIN_COUNT,
  HERO_SLIDE_MAX_COUNT,
  type HeroSlideInput,
} from '@/lib/validations/hero-slides'

export type HeroSlideActionResponse = {
  success: boolean
  error?: string | null
  fieldErrors?: Partial<Record<keyof HeroSlideInput, string[]>>
}

/**
 * Server Action: Create a new hero slide (Staff / Admin only).
 * Enforces maximum 6 slides.
 */
export async function createHeroSlideAction(
  data: unknown
): Promise<HeroSlideActionResponse> {
  try {
    const supabase = await createClient()
    await assertStaffOrAdmin(supabase)

    // Check count constraint
    const { count, error: countError } = await supabase
      .from('hero_slides')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      return { success: false, error: countError.message }
    }

    if ((count ?? 0) >= HERO_SLIDE_MAX_COUNT) {
      return {
        success: false,
        error: `Cannot add more than ${HERO_SLIDE_MAX_COUNT} slides. Please remove an existing slide first.`,
      }
    }

    const parsed = heroSlideSchema.safeParse(data)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Please fix the validation errors.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      }
    }

    // Determine next sort order
    const { data: lastSlide } = await supabase
      .from('hero_slides')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextSortOrder = (lastSlide?.sort_order ?? -1) + 1

    const { error: insertError } = await supabase.from('hero_slides').insert({
      image_url: parsed.data.image_url,
      alt_text: parsed.data.alt_text,
      badge_text: parsed.data.badge_text,
      badge_color_preset: parsed.data.badge_color_preset,
      link_url: parsed.data.link_url,
      subtext: parsed.data.subtext,
      sort_order: nextSortOrder,
      active: parsed.data.active,
    })

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/storefront')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create hero slide.',
    }
  }
}

/**
 * Server Action: Update a hero slide (Staff / Admin only).
 */
export async function updateHeroSlideAction(
  slideId: string,
  data: unknown
): Promise<HeroSlideActionResponse> {
  try {
    const supabase = await createClient()
    await assertStaffOrAdmin(supabase)

    const parsed = heroSlideSchema.safeParse(data)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Please fix the validation errors.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      }
    }

    const { error: updateError } = await supabase
      .from('hero_slides')
      .update({
        image_url: parsed.data.image_url,
        alt_text: parsed.data.alt_text,
        badge_text: parsed.data.badge_text,
        badge_color_preset: parsed.data.badge_color_preset,
        link_url: parsed.data.link_url,
        subtext: parsed.data.subtext,
        active: parsed.data.active,
      })
      .eq('id', slideId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/storefront')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update hero slide.',
    }
  }
}

/**
 * Server Action: Delete a hero slide (Staff / Admin only).
 * Enforces minimum 1 slide.
 */
export async function deleteHeroSlideAction(
  slideId: string
): Promise<{ success: boolean; error?: string | null }> {
  try {
    const supabase = await createClient()
    await assertStaffOrAdmin(supabase)

    // Check count constraint
    const { count, error: countError } = await supabase
      .from('hero_slides')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      return { success: false, error: countError.message }
    }

    if ((count ?? 0) <= HERO_SLIDE_MIN_COUNT) {
      return {
        success: false,
        error: `Cannot delete the only slide. The hero carousel requires at least ${HERO_SLIDE_MIN_COUNT} slide.`,
      }
    }

    const { error: deleteError } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', slideId)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/storefront')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete hero slide.',
    }
  }
}

/**
 * Server Action: Reorder hero slides (Staff / Admin only).
 */
export async function reorderHeroSlidesAction(
  orderedSlideIds: string[]
): Promise<{ success: boolean; error?: string | null }> {
  try {
    const supabase = await createClient()
    await assertStaffOrAdmin(supabase)

    for (let i = 0; i < orderedSlideIds.length; i++) {
      const { error } = await supabase
        .from('hero_slides')
        .update({ sort_order: i })
        .eq('id', orderedSlideIds[i])

      if (error) throw error
    }

    revalidatePath('/')
    revalidatePath('/admin/storefront')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to reorder hero slides.',
    }
  }
}
