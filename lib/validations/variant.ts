import { z } from 'zod'

export const optionInputSchema = z.object({
  name: z
    .string()
    .min(1, 'Option name is required')
    .max(50, 'Option name must be 50 characters or fewer'),
  values: z
    .array(
      z
        .string()
        .min(1, 'Option value cannot be empty')
        .max(50, 'Option value must be 50 characters or fewer')
    )
    .min(1, 'At least one option value is required'),
})

export const productOptionsSchema = z
  .array(optionInputSchema)
  .max(3, 'A product can have at most 3 option dimensions')

export const variantInlineUpdateSchema = z.object({
  id: z.string().uuid('Invalid variant ID'),
  sku: z
    .string()
    .max(100, 'SKU must be 100 characters or fewer')
    .nullable()
    .optional()
    .or(z.literal('').transform(() => null)),
  price: z.coerce
    .number('Price must be a number')
    .min(0, 'Price must be 0 or greater')
    .max(1000000, 'Price must be 1,000,000 or less'),
  stock_qty: z.coerce
    .number('Stock must be a number')
    .int('Stock must be a whole number')
    .min(0, 'Stock must be 0 or greater')
    .max(100000, 'Stock must be 100,000 or less'),
  active: z.boolean(),
})

export type OptionInputType = z.infer<typeof optionInputSchema>
export type VariantInlineUpdateType = z.infer<typeof variantInlineUpdateSchema>
