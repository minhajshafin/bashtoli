import { z } from 'zod'

export const orderStatusSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format.'),
  status: z.enum([
    'pending',
    'confirmed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ], {
    message: 'Invalid order status option.',
  }),
})
