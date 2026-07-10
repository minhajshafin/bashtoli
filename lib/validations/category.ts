import { z } from 'zod'

/**
 * Converts a free-text string into a URL-safe slug.
 * Used by both the client form (live preview) and server actions
 * (canonical derivation from name when slug field is empty).
 *
 * Examples:
 *   slugify('Men\'s T-Shirts!')  → 'mens-t-shirts'
 *   slugify('  New Arrivals  ')  → 'new-arrivals'
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // strip non-alphanumeric except spaces and hyphens
    .replace(/[\s]+/g, '-')        // spaces → hyphens
    .replace(/-+/g, '-')           // collapse multiple hyphens
    .replace(/^-+|-+$/g, '')       // trim leading/trailing hyphens
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Schema for creating a new category. */
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(80, 'Name must be 80 characters or fewer'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(80, 'Slug must be 80 characters or fewer')
    .regex(
      slugPattern,
      'Slug may only contain lowercase letters, numbers, and hyphens (e.g. mens-t-shirts)',
    ),
  sort_order: z.coerce
    .number('Sort order must be a number')
    .int('Sort order must be a whole number')
    .min(0, 'Sort order must be 0 or greater')
    .max(9999, 'Sort order must be 9999 or less'),
})

/** Schema for updating an existing category (same fields + required id). */
export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().uuid('Invalid category ID'),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
