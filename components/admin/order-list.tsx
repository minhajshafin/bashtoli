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
} from 'lucide-react'
import type { AdminOrderSummary } from '@/lib/queries/orders'
import { downloadOrdersCSV } from '@/lib/utils/order-csv'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'

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

export function OrderList({ orders, totalCount, pageSize }: OrderListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '')
  const [statusVal, setStatusVal] = useState(searchParams.get('status') || '')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const currentPage = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const totalPages = Math.ceil(totalCount / pageSize)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 1800)
  }

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
      <search>
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center bg-paper-50 p-3.5 rounded-2xl border border-paper-300 shadow-subtle"
        >
          <div className="relative flex-1">
            <label htmlFor="admin-orders-search" className="sr-only">
              Search orders by order number, customer name, or phone
            </label>
            <input
              id="admin-orders-search"
              type="search"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-ink-400/70 bg-paper-50 text-sm text-ink-950 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1"
              placeholder="Search by order number, customer name, or phone…"
            />
            <div
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none"
              aria-hidden="true"
            >
              <Search className="h-4 w-4" />
            </div>
          </div>

          <div className="flex gap-2.5 flex-wrap items-center">
            <div>
              <label htmlFor="admin-orders-status-filter" className="sr-only">
                Filter by order status
              </label>
              <select
                id="admin-orders-status-filter"
                value={statusVal}
                onChange={(e) => {
                  const val = e.target.value
                  setStatusVal(val)
                  applyFilters({ status: val, page: 1 })
                }}
                className="min-h-[44px] pl-3.5 pr-8 rounded-xl border border-ink-400/70 bg-paper-50 text-xs sm:text-sm font-semibold text-ink-950 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1 cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="min-h-[44px] px-4 rounded-xl bg-ink-950 text-paper-50 text-xs font-bold hover:bg-ink-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Filtering…' : 'Filter'}
            </button>

            <button
              type="button"
              onClick={() => downloadOrdersCSV(orders)}
              disabled={orders.length === 0}
              title="Export this page as CSV"
              className="min-h-[44px] px-3.5 rounded-xl border border-ink-400/70 bg-paper-50 text-xs font-semibold text-ink-900 hover:bg-paper-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-ink-700" aria-hidden="true" />
              <span>Export CSV</span>
            </button>
          </div>
        </form>
      </search>

      {/* Orders Ledger Table */}
      <div className="overflow-hidden bg-paper-50 border border-paper-300 rounded-2xl shadow-subtle">
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="orders-table-caption"
          className="admin-table-region focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-inset"
        >
          <table className="admin-responsive-table w-full border-collapse text-left text-sm text-ink-700">
            <caption id="orders-table-caption" className="sr-only">
              Customer orders list
            </caption>
            <thead>
              <tr className="border-b border-paper-300 bg-paper-200/70 text-ink-600 font-mono text-[11px] font-semibold uppercase tracking-[0.12em]">
                <th scope="col" className="px-6 py-3.5">Order #</th>
                <th scope="col" className="px-6 py-3.5">Date</th>
                <th scope="col" className="px-6 py-3.5">Customer</th>
                <th scope="col" className="px-6 py-3.5">Fulfillment</th>
                <th scope="col" className="px-6 py-3.5 text-center">Items</th>
                <th scope="col" className="px-6 py-3.5 text-right">Total</th>
                <th scope="col" className="px-6 py-3.5 text-center">Status</th>
                <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 px-4">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-950 text-paper-50">
                        <Inbox className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-bold text-ink-950">
                        No orders found
                      </p>
                      <p className="text-xs text-ink-600 max-w-sm">
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
                    <tr key={o.id} className="hover:bg-paper-100/80 transition-colors">
                      <th scope="row" className="px-6 py-4 font-bold text-ink-950 whitespace-nowrap text-left">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-950 bg-paper-200 px-2.5 py-1 rounded-lg border border-paper-300">
                          <span>{o.order_number}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(o.order_number)}
                            aria-label={`Copy order number ${o.order_number}`}
                            title="Copy Order Number"
                            className="p-1 -m-1 text-ink-500 hover:text-ink-950 transition-colors cursor-pointer"
                          >
                            {copiedId === o.order_number ? (
                              <Check className="h-3.5 w-3.5 text-signal-success" aria-hidden="true" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </th>

                      <td data-label="Date" className="px-6 py-4 font-mono text-ink-600 text-xs whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td data-label="Customer" className="px-6 py-4 font-semibold text-ink-950">
                        <div>
                          <p className="text-sm font-bold text-ink-950">{o.customer_name}</p>
                          <div className="flex items-center justify-end sm:justify-start gap-1.5 text-xs text-ink-600 font-normal mt-0.5">
                            <span className="font-mono">{o.phone}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(o.phone)}
                              aria-label={`Copy phone number ${o.phone}`}
                              title="Copy Phone Number"
                              className="p-1 -m-1 text-ink-500 hover:text-ink-950 transition-colors cursor-pointer"
                            >
                              {copiedId === o.phone ? (
                                <Check className="h-3 w-3 text-signal-success" aria-hidden="true" />
                              ) : (
                                <Copy className="h-3 w-3" aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      <td data-label="Fulfillment" className="px-6 py-4 capitalize text-ink-700 font-medium text-xs">
                        <span className="inline-flex items-center rounded-lg bg-paper-200 px-2.5 py-1 border border-paper-300 text-ink-900 font-semibold">
                          {o.fulfillment_type}
                        </span>
                      </td>

                      <td data-label="Items" className="px-6 py-4 text-center font-mono font-bold text-ink-900 text-xs">
                        {o.item_count}
                      </td>

                      <td data-label="Total" className="px-6 py-4 text-right font-mono font-bold text-ink-950 whitespace-nowrap tabular-nums">
                        Tk {o.total.toLocaleString()}
                      </td>

                      <td data-label="Status" className="px-6 py-4 text-center">
                        <OrderStatusBadge status={o.status} />
                      </td>

                      <td data-label="Action" className="px-6 py-4 text-right">
                        <Link
                          id={`admin-view-order-${o.order_number}`}
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-ink-400/70 bg-paper-50 px-3 py-1.5 text-xs font-bold text-ink-950 hover:bg-ink-950 hover:text-paper-50 hover:border-ink-950 transition-colors"
                        >
                          <span>Details</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-paper-300 pt-4">
          <p className="font-mono text-xs text-ink-600">
            Page{' '}
            <span className="font-bold text-ink-950">{currentPage}</span>{' '}
            of{' '}
            <span className="font-bold text-ink-950">{totalPages}</span>
            {' '}·{' '}
            <span className="font-bold text-ink-950">{totalCount.toLocaleString()}</span>{' '}
            orders
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={isPending || currentPage <= 1}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-ink-400/70 bg-paper-50 px-4 text-xs font-bold text-ink-950 hover:bg-paper-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={isPending || currentPage >= totalPages}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-ink-400/70 bg-paper-50 px-4 text-xs font-bold text-ink-950 hover:bg-paper-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
