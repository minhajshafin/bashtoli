'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { AdminOrderSummary } from '@/lib/queries/orders'

interface OrderListProps {
  orders: AdminOrderSummary[]
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

export function OrderList({ orders }: OrderListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Input states initialized from URL parameters
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '')
  const [statusVal, setStatusVal] = useState(searchParams.get('status') || '')

  // Applies search and filter states to URL query params
  const applyFilters = (newStatus?: string, newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    const activeStatus = newStatus !== undefined ? newStatus : statusVal
    const activeSearch = newSearch !== undefined ? newSearch : searchVal

    if (activeStatus) {
      params.set('status', activeStatus)
    } else {
      params.delete('status')
    }

    if (activeSearch) {
      params.set('search', activeSearch)
    } else {
      params.delete('search')
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Form */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200">
        {/* Search Term Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-300 bg-white text-sm placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            placeholder="Search by order number, customer name, or phone..."
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Status Dropdown */}
          <select
            value={statusVal}
            onChange={(e) => {
              const val = e.target.value
              setStatusVal(val)
              applyFilters(val, undefined)
            }}
            className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Search trigger button */}
          <button
            type="submit"
            disabled={isPending}
            className="h-10 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Filtering...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Orders Table view */}
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
    </div>
  )
}
