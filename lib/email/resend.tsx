import { Resend } from 'resend'
import React from 'react'
import { OrderAlertEmail } from './templates/order-alert'
import { OrderConfirmationEmail } from './templates/order-confirmation'

const resendApiKey = process.env.RESEND_API_KEY
// Initialize client only if API key is provided
export const resend = resendApiKey && resendApiKey !== 're_dummy_api_key_for_testing' ? new Resend(resendApiKey) : null

interface OrderItemInfo {
  product_name: string
  qty: number
  price_at_purchase: number
}

interface OrderInfo {
  order_number: string
  customer_name: string
  phone: string
  guest_email?: string | null
  address: string
  fulfillment_type: string
  delivery_zone?: string | null
  delivery_fee: number | string
  subtotal: number | string
  total: number | string
}

/**
 * Fires email notifications asynchronously (fire-and-forget).
 * Logs failure but never blocks caller execution.
 */
export async function sendOrderEmails(order: OrderInfo, items: OrderItemInfo[]) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@example.com'

  if (!resend) {
    console.warn(
      `[Email Warning] Resend is not configured (RESEND_API_KEY is missing or set to placeholder). Skipped sending emails for ${order.order_number}.`
    )
    return
  }

  // 1. Send Admin Alert Email
  resend.emails
    .send({
      from: 'Bashtoli Orders <orders@bashtoli.com>',
      to: adminEmail,
      subject: `New Order ${order.order_number} - ৳${Number(order.total).toLocaleString()}`,
      react: (
        <OrderAlertEmail
          orderNumber={order.order_number}
          customerName={order.customer_name}
          phone={order.phone}
          address={order.address}
          fulfillmentType={order.fulfillment_type}
          deliveryZone={order.delivery_zone || null}
          deliveryFee={Number(order.delivery_fee)}
          subtotal={Number(order.subtotal)}
          total={Number(order.total)}
          items={items}
        />
      ),
    })
    .then((res) => {
      if (res.error) {
        console.error(`[Resend Error] Admin alert send failed for ${order.order_number}:`, res.error)
      } else {
        console.log(`[Resend Success] Admin alert sent for ${order.order_number}: ID ${res.data?.id}`)
      }
    })
    .catch((err) => {
      console.error(`[Resend Connection Error] Admin alert catch for ${order.order_number}:`, err)
    })

  // 2. Send Customer Confirmation Email (if email was provided at checkout)
  if (order.guest_email && order.guest_email.trim() !== '') {
    resend.emails
      .send({
        from: 'Bashtoli <orders@bashtoli.com>',
        to: order.guest_email,
        subject: `Your Bashtoli Order ${order.order_number} has been received!`,
        react: (
          <OrderConfirmationEmail
            orderNumber={order.order_number}
            customerName={order.customer_name}
            address={order.address}
            total={Number(order.total)}
            items={items}
          />
        ),
      })
      .then((res) => {
        if (res.error) {
          console.error(
            `[Resend Error] Customer confirmation send failed to ${order.guest_email} for ${order.order_number}:`,
            res.error
          )
        } else {
          console.log(
            `[Resend Success] Customer confirmation sent to ${order.guest_email}: ID ${res.data?.id}`
          )
        }
      })
      .catch((err) => {
        console.error(
          `[Resend Connection Error] Customer confirmation catch for ${order.order_number}:`,
          err
        )
      })
  }
}
