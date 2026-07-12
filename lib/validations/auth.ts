import { z } from 'zod'

/**
 * Validation schema for customer and admin logins.
 */
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

/**
 * Validation schema for customer signups.
 * Enforces name requirements, valid emails, and at least 8 password characters.
 */
export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters long')
      .max(64, 'Full name is too long')
      .transform((val) => val.trim()),
    email: z
      .string()
      .email('Please enter a valid email address')
      .transform((val) => val.trim().toLowerCase()),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(72, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
