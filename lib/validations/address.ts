import { z } from 'zod'

/**
 * Validation schema for customer saved addresses.
 */
export const addressSchema = z.object({
  label: z
    .string()
    .min(2, 'Label must be at least 2 characters long (e.g. Home, Work)')
    .max(30, 'Label is too long')
    .transform((val) => val.trim()),
  full_address: z
    .string()
    .min(10, 'Please enter a complete address (minimum 10 characters)')
    .max(250, 'Address is too long')
    .transform((val) => val.trim()),
  phone: z
    .string()
    .regex(/^(?:\+8801|8801|01)[3-9]\d{8}$/, {
      message: 'Please enter a valid Bangladeshi phone number (e.g. 01712345678)',
    })
    .transform((val) => {
      let clean = val.replace(/\D/g, '')
      if (clean.startsWith('8801')) {
        clean = '01' + clean.slice(4)
      } else if (clean.startsWith('+8801')) {
        clean = '01' + clean.slice(5)
      }
      return clean
    }),
  is_default: z.boolean().default(false),
})
