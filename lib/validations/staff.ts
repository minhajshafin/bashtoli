import { z } from 'zod'

export const promoteUserSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address.')
    .transform((val) => val.trim().toLowerCase()),
})

export const demoteUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID format.'),
})
