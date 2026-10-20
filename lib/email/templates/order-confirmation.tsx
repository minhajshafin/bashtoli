import React from 'react'

interface OrderConfirmationEmailProps {
  orderNumber: string
  accessToken?: string
  customerName: string
  address: string
  total: number
  items: Array<{
    product_name: string
    qty: number
    price_at_purchase: number
  }>
}

export function OrderConfirmationEmail({
  orderNumber,
  accessToken,
  customerName,
  address,
  total,
  items,
}: OrderConfirmationEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bashtoli.com'
  const trackingUrl = accessToken
    ? `${siteUrl}/order/${orderNumber}?token=${encodeURIComponent(accessToken)}`
    : `${siteUrl}/order/${orderNumber}`

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', border: '1px solid #e4e4e7', borderRadius: '12px' }}>
      <h2 style={{ color: '#d97706', borderBottom: '1px solid #f4f4f5', paddingBottom: '10px' }}>
        Thank You for Your Order!
      </h2>
      <p>Hi {customerName},</p>
      <p>Your Cash on Delivery order <strong>{orderNumber}</strong> has been received and is currently pending verification.</p>

      <h3 style={{ borderBottom: '1px solid #f4f4f5', paddingBottom: '5px', marginTop: '20px' }}>Order Summary</h3>
      <ul style={{ paddingLeft: '20px' }}>
        {items.map((item, idx) => (
          <li key={idx} style={{ marginBottom: '8px' }}>
            <strong>{item.product_name}</strong> - {item.qty} x ৳{item.price_at_purchase.toLocaleString()}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fafaf9', borderRadius: '8px' }}>
        <p style={{ margin: '0 0 6px 0' }}><strong>Delivery Address:</strong> {address}</p>
        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '16px' }}>Total Amount to Pay: ৳{total.toLocaleString()} (COD)</p>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <a
          href={trackingUrl}
          style={{
            display: 'inline-block',
            backgroundColor: '#1b382b',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          View / Track Order Details
        </a>
      </div>

      <p style={{ marginTop: '30px', fontSize: '11px', color: '#71717b', textAlign: 'center' }}>
        If you have any questions, please contact our support team.
      </p>
    </div>
  )
}
