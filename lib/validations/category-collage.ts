import { z } from 'zod'

export const MAX_FEATURED_CATEGORIES = 7

export const COLLAGE_SLOT_CONFIGS = [
  { slot: 1, name: 'Tall Left', gridArea: 'slot1', desc: 'Spans row 1 & 2' },
  { slot: 2, name: 'Top Center', gridArea: 'slot2', desc: 'Row 1 center' },
  { slot: 3, name: 'Tall Right', gridArea: 'slot3', desc: 'Spans row 1 & 2' },
  { slot: 4, name: 'Mid Center', gridArea: 'slot4', desc: 'Row 2 center' },
  { slot: 5, name: 'Bottom Left', gridArea: 'slot5', desc: 'Row 3 left' },
  { slot: 6, name: 'Bottom Center', gridArea: 'slot6', desc: 'Row 3 center' },
  { slot: 7, name: 'Bottom Right', gridArea: 'slot7', desc: 'Row 3 right' },
] as const

export interface FeaturedCategoryItem {
  id: string
  name: string
  slug: string
  image_url: string | null
  featured_order: number
  is_featured: boolean
  product_count?: number
}

export const updateCategoryCoverSchema = z.object({
  category_id: z.string().uuid('Invalid category ID'),
  image_url: z
    .string()
    .min(1, 'Image URL is required')
    .refine(
      (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
      'Image URL must be a valid path or web URL'
    ),
})

export const toggleFeaturedCategorySchema = z.object({
  category_id: z.string().uuid('Invalid category ID'),
  is_featured: z.boolean(),
})

export const reorderFeaturedCategoriesSchema = z.object({
  ordered_ids: z
    .array(z.string().uuid('Invalid category ID'))
    .max(MAX_FEATURED_CATEGORIES, `Cannot feature more than ${MAX_FEATURED_CATEGORIES} categories`),
})
