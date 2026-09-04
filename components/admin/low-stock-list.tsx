'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  SlidersHorizontal,
  Copy,
  Check,
  PackageSearch,
  ArrowRight,
} from 'lucide-react'
import type { LowStockItem } from '@/lib/queries/dashboard'

interface LowStockListProps {
  items: LowStockItem[]
  threshold: number
}

export function LowStockList({ items, threshold }: LowStockListProps) {
  const [copiedSku, setCopiedSku] = useState<string | null>(null)

  // Format variant option values JSON (e.g. Size: M, Color: Black)
  const formatOptions = (options: Record<string, unknown> | null | undefined) => {
    if (!options || typeof options !== 'object') return ''
    return Object.entries(options)
      .map(([key, val]) => `${key}: ${val}`)
      .join(', ')
  }

  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku)
    setCopiedSku(sku)
    setTimeout(() => setCopiedSku(null), 1800)
  }

  return (
    <div
      id="low-stock-panel"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0"
    >
      {/* Header with Title + Integrated Threshold Form */}
      <div className="p-5 border-b border-slate-150 bg-slate-50/70 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 border border-rose-200 text-rose-600">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Low Stock Inventory Alerts
              </h2>
              <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.2 text-xs font-bold">
                {items.length} {items.length === 1 ? 'alert' : 'alerts'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Product variants with available stock at or below your safety threshold.
            </p>
          </div>
        </div>

        {/* Threshold setting form — integrated directly in panel */}
        <form
          method="get"
          className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs shrink-0"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
          <label
            htmlFor="threshold"
            className="text-xs font-semibold text-slate-600 whitespace-nowrap"
          >
            Threshold:
          </label>
          <input
            id="threshold"
            name="threshold"
            type="number"
            min="0"
            max="100"
            defaultValue={threshold}
            className="w-12 h-6 text-center rounded border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            className="h-6 px-2.5 rounded bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Update
          </button>
        </form>
      </div>

      {/* Table of items */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <th className="px-6 py-3.5">Product & Variant</th>
              <th className="px-6 py-3.5">SKU</th>
              <th className="px-6 py-3.5">Attributes</th>
              <th className="px-6 py-3.5 text-center">Remaining Stock</th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <PackageSearch className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      All inventory levels are healthy!
                    </p>
                    <p className="text-xs text-slate-400">
                      No product variants are currently below the threshold of {threshold}.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const optionStr = formatOptions(item.option_values)
                const isOut = item.stock_qty === 0

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {item.product_name}
                    </td>

                    <td className="px-6 py-4">
                      {item.sku ? (
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <span>{item.sku}</span>
                          <button
                            type="button"
                            onClick={() => handleCopySku(item.sku!)}
                            title="Copy SKU"
                            className="text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            {copiedSku === item.sku ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">N/A</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {optionStr ? (
                        <span className="inline-block rounded bg-slate-50 px-2 py-0.5 border border-slate-200 text-slate-700">
                          {optionStr}
                        </span>
                      ) : (
                        <span className="italic text-slate-400">Standard</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                          isOut
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isOut ? 'Out of Stock (0)' : `${item.stock_qty} left`}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        id={`admin-edit-low-stock-${item.id}`}
                        href={`/admin/products/${item.product_id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-2xs"
                      >
                        <span>Restock</span>
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
  )
}
