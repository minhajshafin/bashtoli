import type { AdminOrderSummary } from '@/lib/queries/orders'

/**
 * Generates and downloads a UTF-8 BOM CSV export from a page of admin order summaries.
 */
export function downloadOrdersCSV(orders: AdminOrderSummary[]): void {
  const escapeCell = (v: string | number) =>
    `"${String(v).replace(/"/g, '""')}"`

  const headers = [
    'Order #',
    'Date',
    'Customer Name',
    'Phone',
    'Fulfillment',
    'Items',
    'Total (BDT)',
    'Status',
  ]

  const rows = orders.map((o) =>
    [
      o.order_number,
      new Date(o.created_at).toLocaleString('en-GB'),
      o.customer_name,
      o.phone,
      o.fulfillment_type,
      o.item_count,
      o.total,
      o.status,
    ]
      .map(escapeCell)
      .join(',')
  )

  // UTF-8 BOM ensures Excel renders currency symbols correctly
  const csv = '\uFEFF' + [headers.map(escapeCell).join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bashtoli-orders-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
