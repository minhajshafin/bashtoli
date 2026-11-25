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
      <search>
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center bg-adm-surface p-3.5 rounded-2xl border border-adm-border shadow-subtle"
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
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-adm-input-border bg-adm-surface text-sm text-adm-fg placeholder:text-adm-muted focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1"
              placeholder="Search orders…"
            />
            <div
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-muted pointer-events-none"
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
                className="min-h-[44px] pl-3.5 pr-8 rounded-xl border border-adm-input-border bg-adm-surface text-xs sm:text-sm font-medium text-adm-fg focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1 cursor-pointer"
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
              className="min-h-[44px] px-4 rounded-xl bg-adm-accent text-adm-accent-fg text-xs font-semibold hover:bg-adm-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Filtering…' : 'Filter'}
            </button>

            <button
              type="button"
              onClick={() => downloadOrdersCSV(orders)}
              disabled={orders.length === 0}
              title="Export CSV"
              className="min-h-[44px] px-3.5 rounded-xl border border-adm-border bg-adm-surface text-xs font-semibold text-adm-fg hover:bg-adm-surface-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-adm-muted" aria-hidden="true" />
              <span>Export CSV</span>
            </button>
          </div>
        </form>
      </search>

      <div className="overflow-hidden bg-adm-surface border border-adm-border rounded-2xl shadow-subtle">
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="orders-table-caption"
          className="admin-table-region"
        >
          <table className="admin-responsive-table w-full border-collapse text-left text-sm text-adm-fg-2">
            <caption id="orders-table-caption" className="sr-only">
              Customer orders list
            </caption>
            <thead>
              <tr className="border-b border-adm-border bg-adm-surface-2/70 text-adm-muted text-xs font-medium">
                <th scope="col" className="px-3.5 py-3">Order #</th>
                <th scope="col" className="px-3 py-3">Date</th>
                <th scope="col" className="px-3 py-3">Customer</th>
                <th scope="col" className="px-3 py-3">Fulfillment</th>
                <th scope="col" className="px-2.5 py-3 text-center">Items</th>
                <th scope="col" className="px-3 py-3 text-right">Total</th>
                <th scope="col" className="px-3 py-3 text-center">Status</th>
                <th scope="col" className="px-3.5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-adm-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 px-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-surface-2 border border-adm-border text-adm-muted">
                        <Inbox className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-semibold text-adm-fg">No orders found</p>
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
                    <tr key={o.id} className="hover:bg-adm-surface-2/60 transition-colors">
                      <th scope="row" className="px-3.5 py-3.5 font-semibold text-adm-fg whitespace-nowrap text-left">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-adm-fg bg-adm-surface-2 px-2.5 py-1 rounded-lg border border-adm-border">
                          <span>{o.order_number}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(o.order_number)}
                            aria-label={`Copy order number ${o.order_number}`}
                            title="Copy Order Number"
                            className="p-1 -m-1 text-adm-muted hover:text-adm-fg transition-colors cursor-pointer"
                          >
                            {copiedId === o.order_number ? (
                              <Check className="h-3.5 w-3.5 text-adm-success" aria-hidden="true" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </th>

                      <td data-label="Date" className="px-3 py-3.5 font-mono text-adm-muted text-xs whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td data-label="Customer" className="px-3 py-3.5 font-semibold text-adm-fg">
                        <div>
                          <p className="text-sm font-semibold text-adm-fg">{o.customer_name}</p>
                          <div className="flex items-center justify-end sm:justify-start gap-1.5 text-xs text-adm-muted font-normal mt-0.5">
                            <span className="font-mono">{o.phone}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(o.phone)}
                              aria-label={`Copy phone number ${o.phone}`}
                              title="Copy Phone Number"
                              className="p-1 -m-1 text-adm-muted hover:text-adm-fg transition-colors cursor-pointer"
                            >
                              {copiedId === o.phone ? (
                                <Check className="h-3 w-3 text-adm-success" aria-hidden="true" />
                              ) : (
                                <Copy className="h-3 w-3" aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      <td data-label="Fulfillment" className="px-3 py-3.5 capitalize text-adm-fg-2 text-xs">
                        <span className="inline-flex items-center rounded-lg bg-adm-surface-2 px-2.5 py-1 border border-adm-border font-medium">
                          {o.fulfillment_type}
                        </span>
                      </td>

                      <td data-label="Items" className="px-2.5 py-3.5 text-center font-mono font-semibold text-adm-fg text-xs">
                        {o.item_count}
                      </td>

                      <td data-label="Total" className="px-3 py-3.5 text-right font-mono font-semibold text-adm-fg whitespace-nowrap tabular-nums">
                        Tk {o.total.toLocaleString()}
                      </td>

                      <td data-label="Status" className="px-3 py-3.5 text-center">
                        <OrderStatusBadge status={o.status} />
                      </td>

                      <td data-label="Action" className="px-3.5 py-3.5 text-right">
                        <Link
                          id={`admin-view-order-${o.order_number}`}
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-adm-border bg-adm-surface px-3 py-1.5 text-xs font-semibold text-adm-fg hover:border-adm-accent-border hover:bg-adm-accent-tint hover:text-adm-accent-text transition-colors"
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

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-adm-border pt-4">
          <p className="font-mono text-xs text-adm-muted">
            Page <span className="font-semibold text-adm-fg">{currentPage}</span> of{' '}
            <span className="font-semibold text-adm-fg">{totalPages}</span>
            {' · '}
            <span className="font-semibold text-adm-fg">{totalCount.toLocaleString()}</span> orders
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={isPending || currentPage <= 1}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-adm-border bg-adm-surface px-4 text-xs font-semibold text-adm-fg hover:bg-adm-surface-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={isPending || currentPage >= totalPages}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-adm-border bg-adm-surface px-4 text-xs font-semibold text-adm-fg hover:bg-adm-surface-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
