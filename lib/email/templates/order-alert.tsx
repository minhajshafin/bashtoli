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
            <strong>{item.product_name}</strong> - {item.qty} x ৳{item.price_at_purchase.toLocaleString()}
            {' '}(৳{(item.price_at_purchase * item.qty).toLocaleString()})
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fafaf9', borderRadius: '8px' }}>
        <p style={{ margin: '0 0 6px 0' }}>Subtotal: ৳{subtotal.toLocaleString()}</p>
        <p style={{ margin: '0 0 6px 0' }}>Shipping: ৳{deliveryFee.toLocaleString()}</p>
        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '16px' }}>Total (COD): ৳{total.toLocaleString()}</p>
      </div>
    </div>
  )
}
