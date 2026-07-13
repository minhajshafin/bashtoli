import React from 'react'

interface OrderStatusUpdateEmailProps {
  orderNumber: string
  customerName: string
  status: 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
  address: string
  total: number
}

function getStatusDescription(status: string) {
  switch (status) {
    case 'confirmed':
      return 'Your order has been verified and confirmed! We are now preparing it for shipment.'
    case 'shipped':
      return 'Great news! Your package has been handed over to our delivery partner and is on its way.'
    case 'out_for_delivery':
      return 'Your package is out for delivery and will reach your address today.'
    case 'delivered':
      return 'Your order has been successfully delivered and payment received. Thank you for shopping with Bashtoli!'
    case 'cancelled':
      return 'Your order has been cancelled.'
    default:
      return `Your order status has been updated to ${status}.`
  }
}

export function OrderStatusUpdateEmail({
  orderNumber,
  customerName,
  status,
  address,
  total,
}: OrderStatusUpdateEmailProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', border: '1px solid #e4e4e7', borderRadius: '12px' }}>
      <h2 style={{ color: '#d97706', borderBottom: '1px solid #f4f4f5', paddingBottom: '10px' }}>
        Order Status Update
      </h2>
      <p>Hi {customerName},</p>
      <p>
        The status of your order <strong>{orderNumber}</strong> has been updated to{' '}
        <strong style={{ textTransform: 'capitalize' }}>{status.replace(/_/g, ' ')}</strong>.
      </p>
      <p style={{ fontSize: '15px', color: '#1f2937', fontWeight: '500', margin: '16px 0' }}>
        {getStatusDescription(status)}
      </p>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fafaf9', borderRadius: '8px' }}>
        <p style={{ margin: '0 0 6px 0' }}><strong>Delivery Address:</strong> {address}</p>
        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '16px' }}>Total Amount: ৳{total.toLocaleString()} (COD)</p>
      </div>

      <p style={{ marginTop: '30px', fontSize: '11px', color: '#71717b', textAlign: 'center' }}>
        If you did not request this update or have questions, please contact our support team.
      </p>
    </div>
  )
}
