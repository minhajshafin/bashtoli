import { z } from 'zod'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(150, 'Name must be 150 characters or fewer'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(150, 'Slug must be 150 characters or fewer')
    .regex(
      slugPattern,
      'Slug may only contain lowercase letters, numbers, and hyphens (e.g. fine-bamboo-table)',
    ),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or fewer')
    .nullable()
    .optional()
    .or(z.literal('').transform(() => null)),
  category_id: z
    .string()
    .uuid('Invalid category selected')
    .nullable()
    .optional()
    .or(z.literal('').transform(() => null)),
  base_price: z.coerce
    .number('Base price must be a number')
    .min(0, 'Base price must be 0 or greater')
    .max(1000000, 'Base price must be 1,000,000 or less'),
  active: z.preprocess(
    (val) => val === 'true' || val === 'on' || val === true,
    z.boolean()
  ),
  featured: z.preprocess(
    (val) => val === 'true' || val === 'on' || val === true,
    z.boolean()
  ),
})

export const updateProductSchema = createProductSchema.extend({
  id: z.string().uuid('Invalid product ID'),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
