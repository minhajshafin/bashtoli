'use client'

import React from 'react'
import Link from 'next/link'
import type { LowStockItem } from '@/lib/queries/dashboard'

interface LowStockListProps {
  items: LowStockItem[]
  threshold: number
}

export function LowStockList({ items, threshold }: LowStockListProps) {
  // Format variant option values json nicely (e.g. Size: M, Color: Black)
  const formatOptions = (options: Record<string, unknown> | null | undefined) => {
    if (!options || typeof options !== 'object') return ''
    return Object.entries(options)
      .map(([key, val]) => `${key}: ${val}`)
      .join(', ')
  }

  return (
    <div id="low-stock-panel" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-4">
      <div className="p-5 border-b border-slate-150 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Low Stock Alerts</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Active product variants with stock levels at or below the threshold ({threshold}).
          </p>
        </div>
        <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800 border border-rose-200">
          {items.length} Alerts
        </span>
      </div>

      <div className="p-5 pt-0">
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="px-5 py-3">Product / Variant Name</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Attributes</th>
                <th className="px-5 py-3 text-center">Remaining Stock</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400 font-medium">
                    All product variants are healthy and above the stock threshold.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const optionStr = formatOptions(item.option_values)
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">{item.product_name}</td>
                      <td className="px-5 py-3.5 text-slate-500 font-mono text-xs whitespace-nowrap">
                        {item.sku || 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs font-medium italic">
                        {optionStr || 'Standard'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                          item.stock_qty === 0
                            ? 'bg-rose-100 text-rose-900 border border-rose-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {item.stock_qty} left
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          id={`admin-edit-low-stock-${item.id}`}
                          href={`/admin/products/${item.product_id}`}
                          className="inline-flex h-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 px-3 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                          Restock Product
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
