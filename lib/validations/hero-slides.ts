import { z } from 'zod'
import {
  HERO_SLIDE_MIN_COUNT,
  HERO_SLIDE_MAX_COUNT,
  BADGE_COLOR_PRESETS,
  type BadgeColorPresetKey,
  type HeroSlideItem,
  DEFAULT_FALLBACK_SLIDE,
} from '@/lib/constants/hero-slides'

export {
  HERO_SLIDE_MIN_COUNT,
  HERO_SLIDE_MAX_COUNT,
  BADGE_COLOR_PRESETS,
  type BadgeColorPresetKey,
  type HeroSlideItem,
  DEFAULT_FALLBACK_SLIDE,
}

export const heroSlideSchema = z.object({
  image_url: z
    .string()
    .min(1, 'Image URL is required')
    .refine(
      (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
      'Image URL must be a valid path or web URL'
    ),
  alt_text: z
    .string()
    .max(100, 'Alt text cannot exceed 100 characters')
    .optional()
    .nullable()
    .transform((val) => (val?.trim() ? val.trim() : null)),
  badge_text: z
    .string()
    .trim()
    .min(1, 'Badge text is required')
    .max(40, 'Badge text cannot exceed 40 characters'),
  badge_color_preset: z.enum(['gold', 'forest', 'crimson', 'ocean', 'slate']).default('gold'),
  link_url: z
    .string()
    .trim()
    .max(200, 'Link URL is too long')
    .default('/products')
    .transform((val) => (val && val.length > 0 ? val : '/products')),
  subtext: z
    .string()
    .trim()
    .max(60, 'Subtext cannot exceed 60 characters')
    .default('Now in store & online')
    .transform((val) => (val && val.length > 0 ? val : 'Now in store & online')),
  active: z.boolean().default(true),
})

export type HeroSlideInput = z.infer<typeof heroSlideSchema>
