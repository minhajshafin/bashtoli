import { z } from 'zod'

export const orderLookupSchema = z.object({
  order_number: z
    .string()
    .min(1, 'Order number is required')
    .regex(/^ORD-\d{8}-\d{4}$/, 'Invalid order number format (e.g. ORD-20260703-0042)'),
  phone: z
    .string()
    .min(11, 'Phone number must be at least 11 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^(?:\+88)?01[3-9]\d{8}$/, 'Invalid Bangladeshi phone number format (e.g. 017XXXXXXXX)'),
})
