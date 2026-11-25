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
  CircleAlert,
} from 'lucide-react'
import type { LowStockItem } from '@/lib/queries/dashboard'

interface LowStockListProps {
  items: LowStockItem[]
  threshold: number
}

export function LowStockList({ items, threshold }: LowStockListProps) {
  const [copiedSku, setCopiedSku] = useState<string | null>(null)

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
    <section
      id="low-stock-panel"
      aria-labelledby="low-stock-heading"
      className="bg-paper-50 border border-paper-300 rounded-2xl overflow-hidden shadow-subtle"
    >
      {/* Header with Title + Integrated Threshold Form */}
      <div className="p-5 sm:p-6 border-b border-paper-300 bg-paper-200/55 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              items.length > 0
                ? 'border-signal-danger-border bg-signal-danger-bg text-signal-danger'
                : 'border-paper-300 bg-paper-50 text-ink-950'
            }`}
          >
            <AlertTriangle className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 id="low-stock-heading" className="admin-section-title text-ink-950">
                Low Stock Inventory Alerts
              </h2>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold ${
                  items.length > 0
                    ? 'border-signal-danger-border bg-signal-danger-bg text-signal-danger'
                    : 'border-paper-300 bg-paper-50 text-ink-700'
                }`}
              >
                {items.length} {items.length === 1 ? 'alert' : 'alerts'}
              </span>
            </div>
            <p className="text-xs text-ink-600 mt-1">
              Product variants with available stock at or below your safety threshold.
            </p>
          </div>
        </div>

        {/* Threshold setting form */}
        <form
          method="get"
          className="flex items-center gap-2 bg-paper-50 px-3 py-1.5 rounded-xl border border-ink-400/60 shrink-0 self-start lg:self-auto"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-ink-500" aria-hidden="true" />
          <label
            htmlFor="threshold"
            className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700 whitespace-nowrap"
          >
            Threshold
          </label>
          <input
            id="threshold"
            name="threshold"
            type="number"
            min="0"
            max="100"
            defaultValue={threshold}
            className="w-14 min-h-[36px] text-center rounded-lg border border-ink-400/80 bg-paper-50 font-mono text-xs font-bold text-ink-950 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1"
          />
          <button
            type="submit"
            className="min-h-[36px] px-3.5 rounded-lg bg-ink-950 text-paper-50 text-xs font-bold hover:bg-ink-800 transition-colors cursor-pointer"
          >
            Update
          </button>
        </form>
      </div>

      {/* Responsive Table */}
      <div
        tabIndex={0}
        role="region"
        aria-labelledby="low-stock-caption"
        className="admin-table-region focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-inset"
      >
        <table className="admin-responsive-table w-full border-collapse text-left text-sm">
          <caption id="low-stock-caption" className="sr-only">
            Low stock inventory variants at or below threshold {threshold}
          </caption>
          <thead>
            <tr className="border-b border-paper-300 bg-paper-200/70 text-ink-600 font-mono text-[11px] font-semibold uppercase tracking-[0.12em]">
              <th scope="col" className="px-6 py-3.5">Product &amp; Variant</th>
              <th scope="col" className="px-6 py-3.5">SKU</th>
              <th scope="col" className="px-6 py-3.5">Attributes</th>
              <th scope="col" className="px-6 py-3.5 text-center">Remaining Stock</th>
              <th scope="col" className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-14 px-4">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-950 text-paper-50">
                      <PackageSearch className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-bold text-ink-950">
                      All inventory levels are healthy
                    </p>
                    <p className="text-xs text-ink-600">
                      No product variants are currently at or below the threshold of {threshold}.
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
                    className="hover:bg-paper-100/80 transition-colors"
                  >
                    <th scope="row" className="px-6 py-4 font-bold text-ink-950 text-left">
                      {item.product_name}
                    </th>

                    <td data-label="SKU" className="px-6 py-4">
                      {item.sku ? (
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-800 bg-paper-200 px-2.5 py-1 rounded-lg border border-paper-300">
                          <span>{item.sku}</span>
                          <button
                            type="button"
                            onClick={() => handleCopySku(item.sku!)}
                            aria-label={`Copy SKU ${item.sku}`}
                            title="Copy SKU"
                            className="p-1 -m-1 text-ink-500 hover:text-ink-950 transition-colors cursor-pointer"
                          >
                            {copiedSku === item.sku ? (
                              <Check className="h-3.5 w-3.5 text-signal-success" aria-hidden="true" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-ink-500 font-mono text-xs">N/A</span>
                      )}
                    </td>

                    <td data-label="Attributes" className="px-6 py-4 text-xs text-ink-700 font-medium">
                      {optionStr ? (
                        <span className="inline-block rounded-lg bg-paper-100 px-2.5 py-1 border border-paper-300 text-ink-800">
                          {optionStr}
                        </span>
                      ) : (
                        <span className="italic text-ink-500">Standard</span>
                      )}
                    </td>

                    <td data-label="Remaining" className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold ${
                          isOut
                            ? 'bg-signal-danger-bg text-signal-danger border-signal-danger-border'
                            : 'bg-signal-warning-bg text-signal-warning border-signal-warning-border'
                        }`}
                      >
                        <CircleAlert className="h-3 w-3" aria-hidden="true" />
                        <span>{isOut ? 'Out of Stock (0)' : `${item.stock_qty} left`}</span>
                      </span>
                    </td>

                    <td data-label="Action" className="px-6 py-4 text-right">
                      <Link
                        id={`admin-edit-low-stock-${item.id}`}
                        href={`/admin/products/${item.product_id}`}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-ink-400/70 bg-paper-50 px-3 py-1.5 text-xs font-bold text-ink-950 hover:bg-ink-950 hover:text-paper-50 hover:border-ink-950 transition-colors"
                      >
                        <span>Restock</span>
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
    </section>
  )
}
