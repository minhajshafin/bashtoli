import { z } from 'zod'

export const checkoutSchema = z.object({
  customer_name: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  phone: z
    .string()
    .min(11, 'Phone number must be at least 11 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^(?:\+88)?01[3-9]\d{8}$/, 'Invalid Bangladeshi phone number format (e.g. 017XXXXXXXX)'),
  guest_email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(5, 'Delivery address must be at least 5 characters')
    .max(300, 'Address cannot exceed 300 characters'),
  fulfillment_type: z.enum(['delivery', 'pickup']),
  delivery_zone: z.enum(['inside_dhaka', 'outside_dhaka']).nullable().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().or(z.literal('')),
}).refine((data) => {
  if (data.fulfillment_type === 'delivery' && !data.delivery_zone) {
    return false
  }
  return true
}, {
  message: 'Delivery zone is required when fulfillment type is delivery',
  path: ['delivery_zone'],
})
