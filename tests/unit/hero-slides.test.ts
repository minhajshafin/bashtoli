import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  heroSlideSchema,
  BADGE_COLOR_PRESETS,
  HERO_SLIDE_MIN_COUNT,
  HERO_SLIDE_MAX_COUNT,
} from '@/lib/validations/hero-slides'

describe('Hero Slides Validation & Constraints', () => {
  it('enforces min 1 and max 6 limits', () => {
    expect(HERO_SLIDE_MIN_COUNT).toBe(1)
    expect(HERO_SLIDE_MAX_COUNT).toBe(6)
  })

  it('provides all 5 curated color presets with accessible text/bg combinations', () => {
    const presets = Object.keys(BADGE_COLOR_PRESETS)
    expect(presets).toEqual(['gold', 'forest', 'crimson', 'ocean', 'slate'])

    for (const key of presets) {
      const preset = BADGE_COLOR_PRESETS[key as keyof typeof BADGE_COLOR_PRESETS]
      expect(preset.bg).toBeTruthy()
      expect(preset.text).toBeTruthy()
      expect(preset.border).toBeTruthy()
      expect(preset.label).toBeTruthy()
    }
  })

  describe('heroSlideSchema', () => {
    it('accepts a valid slide with relative path image', () => {
      const input = {
        image_url: '/logo-text.svg',
        alt_text: 'Bashtoli Stationery',
        badge_text: 'New Season',
        badge_color_preset: 'gold',
        link_url: '/products',
        active: true,
      }
      const result = heroSlideSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('accepts a valid slide with https image URL', () => {
      const input = {
        image_url: 'https://example.com/slide1.jpg',
        badge_text: '20% Off Pens',
        badge_color_preset: 'crimson',
        link_url: '/products?category=pens',
      }
      const result = heroSlideSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.badge_color_preset).toBe('crimson')
        expect(result.data.active).toBe(true)
      }
    })

    it('defaults link_url to /products when empty', () => {
      const input = {
        image_url: '/slide.jpg',
        badge_text: 'Staff Pick',
        badge_color_preset: 'ocean',
        link_url: '',
      }
      const result = heroSlideSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.link_url).toBe('/products')
      }
    })

    it('rejects an invalid image URL without / or http(s)', () => {
      const input = {
        image_url: 'just-a-filename.jpg',
        badge_text: 'Staff Pick',
      }
      const result = heroSlideSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.image_url).toBeDefined()
      }
    })

    it('rejects empty badge text', () => {
      const input = {
        image_url: '/slide.jpg',
        badge_text: '   ',
      }
      const result = heroSlideSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects overly long badge text exceeding 40 characters', () => {
      const input = {
        image_url: '/slide.jpg',
        badge_text: 'A'.repeat(41),
      }
      const result = heroSlideSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects unsupported badge color preset', () => {
      const input = {
        image_url: '/slide.jpg',
        badge_text: 'Bestseller',
        badge_color_preset: 'neon-yellow',
      }
      const result = heroSlideSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('defaults subtext to "Now in store & online" when not provided or empty', () => {
      const input = {
        image_url: '/slide.jpg',
        badge_text: 'Featured',
      }
      const result = heroSlideSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.subtext).toBe('Now in store & online')
      }

      const inputEmpty = {
        image_url: '/slide.jpg',
        badge_text: 'Featured',
        subtext: '   ',
      }
      const resultEmpty = heroSlideSchema.safeParse(inputEmpty)
      expect(resultEmpty.success).toBe(true)
      if (resultEmpty.success) {
        expect(resultEmpty.data.subtext).toBe('Now in store & online')
      }
    })

    it('accepts a custom subtext', () => {
      const input = {
        image_url: '/slide.jpg',
        badge_text: 'Special Edition',
        subtext: 'Limited stock remaining in Dhanmondi shop',
      }
      const result = heroSlideSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.subtext).toBe('Limited stock remaining in Dhanmondi shop')
      }
    })

    it('rejects overly long subtext exceeding 60 characters', () => {
      const input = {
        image_url: '/slide.jpg',
        badge_text: 'Special Edition',
        subtext: 'A'.repeat(61),
      }
      const result = heroSlideSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })
})
