import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export type HeroSlideRow = Database['public']['Tables']['hero_slides']['Row']

export const DEFAULT_FALLBACK_SLIDE: HeroSlideRow = {
  id: 'default-fallback-slide',
  image_url: '/logo-text.svg',
  alt_text: 'Bashtoli Stationery',
  badge_text: 'New Collection',
  badge_color_preset: 'gold',
  link_url: '/products',
  subtext: 'Now in store & online',
  sort_order: 0,
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

/**
 * Fetch active hero slides for the public storefront.
 * Returns default fallback slide if database table is not yet migrated or empty.
 */
export async function getStorefrontHeroSlides(): Promise<HeroSlideRow[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error || !data || data.length === 0) {
      return [DEFAULT_FALLBACK_SLIDE]
    }

    return data
  } catch (err) {
    console.warn('[HeroSlides] Query error, falling back to default slide:', err)
    return [DEFAULT_FALLBACK_SLIDE]
  }
}

/**
 * Fetch all hero slides for admin management.
 */
export async function getAdminHeroSlides(): Promise<{
  slides: HeroSlideRow[]
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return { slides: [], error: error.message }
    }

    return { slides: data || [], error: null }
  } catch (err) {
    return {
      slides: [],
      error: err instanceof Error ? err.message : 'Unknown database error',
    }
  }
}
