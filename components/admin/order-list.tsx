'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
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
      return 'bg-amber-100 text-amber-850 border-amber-200'
    case 'confirmed':
      return 'bg-blue-100 text-blue-850 border-blue-200'
    case 'shipped':
      return 'bg-indigo-100 text-indigo-850 border-indigo-200'
    case 'delivered':
      return 'bg-emerald-100 text-emerald-850 border-emerald-200'
    case 'cancelled':
      return 'bg-rose-100 text-rose-850 border-rose-200'
    default:
      return 'bg-slate-100 text-slate-850 border-slate-200'
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

  // Input states initialised from URL parameters
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '')
  const [statusVal, setStatusVal] = useState(searchParams.get('status') || '')

  // Current page derived from URL
  const currentPage = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const totalPages = Math.ceil(totalCount / pageSize)

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters({ page: 1 })
  }

  const goToPage = (page: number) => {
    applyFilters({ page })
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200"
      >
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-300 bg-white text-sm placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            placeholder="Search by order number, customer name, or phone..."
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
            <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Status Dropdown */}
          <select
            value={statusVal}
            onChange={(e) => {
              const val = e.target.value
              setStatusVal(val)
              applyFilters({ status: val, page: 1 })
            }}
            className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Search button */}
          <button
            type="submit"
            disabled={isPending}
            className="h-10 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Filtering…' : 'Search'}
          </button>

          {/* CSV Export */}
          <button
            type="button"
            onClick={() => downloadCSV(orders)}
            disabled={orders.length === 0}
            title="Export this page as CSV"
            className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </form>

      {/* Orders Table */}
      <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-250 bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="px-6 py-3.5">Order Number</th>
                <th className="px-6 py-3.5">Placed On</th>
                <th className="px-6 py-3.5">Customer Name</th>
                <th className="px-6 py-3.5">Fulfillment</th>
                <th className="px-6 py-3.5 text-center">Items</th>
                <th className="px-6 py-3.5 text-right">Total Cost</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                    No orders matching selected criteria were found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const dateStr = new Date(o.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{o.order_number}</td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{dateStr}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        <div>
                          <p>{o.customer_name}</p>
                          <p className="text-xs text-slate-400 font-normal">{o.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-slate-600 font-medium">{o.fulfillment_type}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{o.item_count}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">৳{o.total.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${getStatusBadgeStyle(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          id={`admin-view-order-${o.order_number}`}
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex h-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 px-3 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                          Details
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

      {/* Pagination bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-2">
          <p className="text-sm text-slate-500">
            Page{' '}
            <span className="font-semibold text-slate-700">{currentPage}</span>{' '}
            of{' '}
            <span className="font-semibold text-slate-700">{totalPages}</span>
            {' '}·{' '}
            <span className="font-semibold text-slate-700">{totalCount.toLocaleString()}</span>{' '}
            total orders
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={isPending || currentPage <= 1}
              className="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={isPending || currentPage >= totalPages}
              className="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
