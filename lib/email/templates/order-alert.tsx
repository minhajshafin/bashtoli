import React from 'react'

interface OrderAlertEmailProps {
  orderNumber: string
  customerName: string
  phone: string
  address: string
  fulfillmentType: string
  deliveryZone: string | null
  deliveryFee: number
  subtotal: number
  total: number
  items: Array<{
    product_name: string
    qty: number
    price_at_purchase: number
  }>
}

export function OrderAlertEmail({
  orderNumber,
  customerName,
  phone,
  address,
  fulfillmentType,
  deliveryZone,
  deliveryFee,
  subtotal,
  total,
  items,
}: OrderAlertEmailProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', border: '1px solid #e4e4e7', borderRadius: '12px' }}>
      <h2 style={{ color: '#d97706', borderBottom: '1px solid #f4f4f5', paddingBottom: '10px' }}>
        New Order Alert: {orderNumber}
      </h2>
      <div style={{ margin: '20px 0' }}>
        <p style={{ margin: '0 0 8px 0' }}><strong>Customer Name:</strong> {customerName}</p>
        <p style={{ margin: '0 0 8px 0' }}><strong>Phone:</strong> {phone}</p>
        <p style={{ margin: '0 0 8px 0' }}><strong>Fulfillment Method:</strong> {fulfillmentType} {deliveryZone ? `(${deliveryZone})` : ''}</p>
        <p style={{ margin: '0' }}><strong>Address:</strong> {address}</p>
      </div>

      <h3 style={{ borderBottom: '1px solid #f4f4f5', paddingBottom: '5px' }}>Items</h3>
      <ul style={{ paddingLeft: '20px' }}>
        {items.map((item, idx) => (
          <li key={idx} style={{ marginBottom: '8px' }}>
            <strong>{item.product_name}</strong> - {item.qty} x Tk {item.price_at_purchase.toLocaleString()}
            {' '}(Tk {(item.price_at_purchase * item.qty).toLocaleString()})
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fafaf9', borderRadius: '8px' }}>
        <p style={{ margin: '0 0 6px 0' }}>Subtotal: Tk {subtotal.toLocaleString()}</p>
        <p style={{ margin: '0 0 6px 0' }}>Shipping: Tk {deliveryFee.toLocaleString()}</p>
        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '16px' }}>Total (COD): Tk {total.toLocaleString()}</p>
      </div>
    </div>
  )
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function renderOrderAlertEmailHtml({
  orderNumber,
  customerName,
  phone,
  address,
  fulfillmentType,
  deliveryZone,
  deliveryFee,
  subtotal,
  total,
  items,
}: OrderAlertEmailProps): string {
  const itemsHtml = items
    .map(
      (item) =>
        `<li style="margin-bottom: 8px;"><strong>${escapeHtml(item.product_name)}</strong> - ${item.qty} x Tk ${item.price_at_purchase.toLocaleString()} (Tk ${(item.price_at_purchase * item.qty).toLocaleString()})</li>`
    )
    .join('')

  return `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
      <h2 style="color: #d97706; border-bottom: 1px solid #f4f4f5; padding-bottom: 10px;">New Order Alert: ${escapeHtml(orderNumber)}</h2>
      <div style="margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Customer Name:</strong> ${escapeHtml(customerName)}</p>
        <p style="margin: 0 0 8px 0;"><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p style="margin: 0 0 8px 0;"><strong>Fulfillment Method:</strong> ${escapeHtml(fulfillmentType)} ${deliveryZone ? `(${escapeHtml(deliveryZone)})` : ''}</p>
        <p style="margin: 0;"><strong>Address:</strong> ${escapeHtml(address)}</p>
      </div>
      <h3 style="border-bottom: 1px solid #f4f4f5; padding-bottom: 5px;">Items</h3>
      <ul style="padding-left: 20px;">${itemsHtml}</ul>
      <div style="margin-top: 20px; padding: 15px; background-color: #fafaf9; border-radius: 8px;">
        <p style="margin: 0 0 6px 0;">Subtotal: Tk ${subtotal.toLocaleString()}</p>
        <p style="margin: 0 0 6px 0;">Shipping: Tk ${deliveryFee.toLocaleString()}</p>
        <p style="margin: 0; font-weight: bold; font-size: 16px;">Total (COD): Tk ${total.toLocaleString()}</p>
      </div>
    </div>
  `
}
