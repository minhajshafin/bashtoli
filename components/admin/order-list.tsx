'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Search,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Inbox,
  Filter,
} from 'lucide-react'
import type { AdminOrderSummary } from '@/lib/queries/orders'

interface OrderListProps {
  orders: AdminOrderSummary[]
  totalCount: number
  pageSize: number
}

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

function getStatusBadgeStyle(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'confirmed':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'shipped':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    case 'delivered':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

/** Generates and downloads a CSV file from the current page of orders. */
function downloadCSV(orders: AdminOrderSummary[]) {
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
    ].map(escapeCell).join(','),
  )

  // UTF-8 BOM ensures Excel renders the Bengali ৳ symbol correctly
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

export function OrderList({ orders, totalCount, pageSize }: OrderListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Input states initialized from URL parameters
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '')
  const [statusVal, setStatusVal] = useState(searchParams.get('status') || '')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Current page derived from URL
  const currentPage = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const totalPages = Math.ceil(totalCount / pageSize)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 1800)
  }

  /** Pushes a new URL with updated query params. */
  const applyFilters = (overrides: { status?: string; search?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString())

    const activeStatus = overrides.status !== undefined ? overrides.status : statusVal
    const activeSearch = overrides.search !== undefined ? overrides.search : searchVal
    const activePage = overrides.page !== undefined ? overrides.page : 1

    if (activeStatus) params.set('status', activeStatus)
    else params.delete('status')

    if (activeSearch) params.set('search', activeSearch)
    else params.delete('search')

    if (activePage > 1) params.set('page', String(activePage))
    else params.delete('page')

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    applyFilters({ page: 1 })
  }

  const goToPage = (page: number) => {
    applyFilters({ page })
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs"
      >
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-2xs"
            placeholder="Search by order number, customer name, or phone…"
          />
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          >
            <Search className="h-4 w-4" />
          </div>
        </div>

        <div className="flex gap-2.5 flex-wrap items-center">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusVal}
              onChange={(e) => {
                const val = e.target.value
                setStatusVal(val)
                applyFilters({ status: val, page: 1 })
              }}
              className="h-9 pl-3 pr-8 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer shadow-2xs"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Search button */}
          <button
            type="submit"
            disabled={isPending}
            className="h-9 px-3.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-2xs cursor-pointer"
          >
            {isPending ? 'Filtering…' : 'Filter'}
          </button>

          {/* CSV Export */}
          <button
            type="button"
            onClick={() => downloadCSV(orders)}
            disabled={orders.length === 0}
            title="Export this page as CSV"
            className="h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </form>

      {/* Orders Table */}
      <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="px-6 py-3.5">Order #</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Fulfillment</th>
                <th className="px-6 py-3.5 text-center">Items</th>
                <th className="px-6 py-3.5 text-right">Total</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 border border-slate-200">
                        <Inbox className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        No orders found
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        No orders match your selected filter criteria or search query.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const dateStr = new Date(o.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Order Number + Copy */}
                      <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-800 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200">
                          <span>{o.order_number}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(o.order_number)}
                            title="Copy Order Number"
                            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            {copiedId === o.order_number ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Customer Info */}
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{o.customer_name}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-400 font-normal mt-0.5">
                            <span className="font-mono">{o.phone}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(o.phone)}
                              title="Copy Phone Number"
                              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            >
                              {copiedId === o.phone ? (
                                <Check className="h-2.5 w-2.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-2.5 w-2.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Fulfillment */}
                      <td className="px-6 py-4 capitalize text-slate-600 font-medium text-xs">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 border border-slate-200 text-slate-700 font-semibold">
                          {o.fulfillment_type}
                        </span>
                      </td>

                      {/* Item Count */}
                      <td className="px-6 py-4 text-center font-bold text-slate-700 text-xs">
                        {o.item_count}
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 text-right font-black text-slate-900 whitespace-nowrap">
                        ৳{o.total.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${getStatusBadgeStyle(
                            o.status
                          )}`}
                        >
                          {o.status}
                        </span>
                      </td>

                      {/* Action Link */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          id={`admin-view-order-${o.order_number}`}
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-2xs"
                        >
                          <span>Details</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-3">
          <p className="text-xs sm:text-sm text-slate-500">
            Page{' '}
            <span className="font-bold text-slate-800">{currentPage}</span>{' '}
            of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span>
            {' '}·{' '}
            <span className="font-bold text-slate-800">{totalCount.toLocaleString()}</span>{' '}
            orders
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={isPending || currentPage <= 1}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={isPending || currentPage >= totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
