import { z } from 'zod'

/**
 * Validation schema for updating a customer's profile information.
 * Phone number and address are optional.
 */
export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters long')
    .max(64, 'Full name is too long')
    .transform((val) => val.trim()),
  phone: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null
      const trimmed = val.trim()
      return trimmed === '' ? null : trimmed
    })
    .refine(
      (val) => {
        if (val === null || val === undefined) return true
        return /^(?:\+8801|8801|01)[3-9]\d{8}$/.test(val)
      },
      {
        message: 'Please enter a valid Bangladeshi phone number (e.g. 01712345678)',
      }
    )
    .transform((val) => {
      if (!val) return null
      let clean = val.replace(/\D/g, '')
      if (clean.startsWith('8801')) {
        clean = '01' + clean.slice(4)
      } else if (clean.startsWith('+8801')) {
        clean = '01' + clean.slice(5)
      }
      return clean
    }),
  address: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null
      const trimmed = val.trim()
      return trimmed === '' ? null : trimmed
    })
    .refine(
      (val) => {
        if (val === null || val === undefined) return true
        return val.length >= 5 && val.length <= 300
      },
      {
        message: 'Address must be between 5 and 300 characters',
      }
    ),
})

/**
 * Validation schema for updating user password in account settings.
 */
export const passwordChangeSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(72, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
