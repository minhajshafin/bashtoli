import { describe, it, expect } from 'vitest'
import {
  MAX_FEATURED_CATEGORIES,
  COLLAGE_SLOT_CONFIGS,
  updateCategoryCoverSchema,
  toggleFeaturedCategorySchema,
  reorderFeaturedCategoriesSchema,
} from '@/lib/validations/category-collage'

describe('Category Grid Collage Validation & Constraints', () => {
  it('enforces exactly 7 featured category slots on the homepage collage', () => {
    expect(MAX_FEATURED_CATEGORIES).toBe(7)
    expect(COLLAGE_SLOT_CONFIGS.length).toBe(7)

    const gridAreas = COLLAGE_SLOT_CONFIGS.map((s) => s.gridArea)
    expect(gridAreas).toEqual(['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6', 'slot7'])
  })

  describe('updateCategoryCoverSchema', () => {
    it('accepts a valid category ID and web image URL', () => {
      const valid = {
        category_id: '3a22f960-90ec-4006-9ce2-5dd7aba6c380',
        image_url: 'https://images.unsplash.com/photo-example.jpg',
      }
      const res = updateCategoryCoverSchema.safeParse(valid)
      expect(res.success).toBe(true)
    })

    it('accepts a valid category ID and relative storage path image', () => {
      const valid = {
        category_id: '3a22f960-90ec-4006-9ce2-5dd7aba6c380',
        image_url: '/logo-text.svg',
      }
      const res = updateCategoryCoverSchema.safeParse(valid)
      expect(res.success).toBe(true)
    })

    it('rejects an invalid image URL without / or http(s)', () => {
      const invalid = {
        category_id: '3a22f960-90ec-4006-9ce2-5dd7aba6c380',
        image_url: 'not-a-valid-url-path.jpg',
      }
      const res = updateCategoryCoverSchema.safeParse(invalid)
      expect(res.success).toBe(false)
    })

    it('rejects an invalid category UUID', () => {
      const invalid = {
        category_id: 'not-a-uuid',
        image_url: '/category.jpg',
      }
      const res = updateCategoryCoverSchema.safeParse(invalid)
      expect(res.success).toBe(false)
    })
  })

  describe('toggleFeaturedCategorySchema', () => {
    it('accepts valid category UUID and boolean', () => {
      const valid = {
        category_id: '3a22f960-90ec-4006-9ce2-5dd7aba6c380',
        is_featured: true,
      }
      const res = toggleFeaturedCategorySchema.safeParse(valid)
      expect(res.success).toBe(true)
    })

    it('rejects non-uuid category_id', () => {
      const invalid = {
        category_id: '123',
        is_featured: true,
      }
      const res = toggleFeaturedCategorySchema.safeParse(invalid)
      expect(res.success).toBe(false)
    })
  })

  describe('reorderFeaturedCategoriesSchema', () => {
    it('accepts up to 7 category UUIDs', () => {
      const valid = {
        ordered_ids: [
          '3a22f960-90ec-4006-9ce2-5dd7aba6c380',
          '59aaaaa5-48e2-4de1-aa6c-2474281a047e',
          'e1edad4d-64bb-4a6d-8089-0091982be2fa',
        ],
      }
      const res = reorderFeaturedCategoriesSchema.safeParse(valid)
      expect(res.success).toBe(true)
    })

    it('rejects when array contains more than 7 category UUIDs', () => {
      const invalid = {
        ordered_ids: Array.from({ length: 8 }, () => '3a22f960-90ec-4006-9ce2-5dd7aba6c380'),
      }
      const res = reorderFeaturedCategoriesSchema.safeParse(invalid)
      expect(res.success).toBe(false)
    })
  })
})
