import { z } from 'zod'

export const productImageInsertSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  url: z.string().url('Invalid image URL'),
  alt_text: z
    .string()
    .max(150, 'Alt text must be 150 characters or fewer')
    .optional()
    .nullable()
    .transform((val) => (val?.trim() ? val.trim() : null)),
  sort_order: z.coerce
    .number('Sort order must be a number')
    .int('Sort order must be a whole number')
    .min(0, 'Sort order must be 0 or greater'),
})

export const productImageUpdateSchema = z.object({
  id: z.string().uuid('Invalid image ID'),
  alt_text: z
    .string()
    .max(150, 'Alt text must be 150 characters or fewer')
    .optional()
    .nullable()
    .transform((val) => (val?.trim() ? val.trim() : null)),
  sort_order: z.coerce
    .number('Sort order must be a number')
    .int('Sort order must be a whole number')
    .min(0, 'Sort order must be 0 or greater'),
})

export const updateProductImageAltSchema = z.object({
  id: z.string().uuid('Invalid image ID'),
  alt_text: z
    .string()
    .max(150, 'Alt text must be 150 characters or fewer')
    .optional()
    .nullable()
    .transform((val) => (val?.trim() ? val.trim() : null)),
})

export type ProductImageInsertType = z.infer<typeof productImageInsertSchema>
export type ProductImageUpdateType = z.infer<typeof productImageUpdateSchema>
export type UpdateProductImageAltType = z.infer<typeof updateProductImageAltSchema>
