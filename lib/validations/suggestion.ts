import { z } from 'zod'

export const suggestionSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, 'Name cannot exceed 100 characters')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  contact: z
    .string()
    .trim()
    .max(120, 'Contact info cannot exceed 120 characters')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  suggestion: z
    .string()
    .trim()
    .min(3, 'Please describe the item with at least 3 characters')
    .max(2000, 'Suggestion cannot exceed 2000 characters'),
  honeypot: z
    .string()
    .optional()
    .nullable(),
})

export type SuggestionInput = z.infer<typeof suggestionSchema>
