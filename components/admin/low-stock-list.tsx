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
      className="bg-adm-surface border border-adm-border rounded-2xl overflow-hidden shadow-subtle"
    >
      <div className="p-5 sm:px-6 border-b border-adm-border flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
              items.length > 0
                ? 'border-adm-warning-border bg-adm-warning-bg text-adm-warning'
                : 'border-adm-success-border bg-adm-success-bg text-adm-success'
            }`}
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 id="low-stock-heading" className="admin-section-title text-adm-fg">
              Low Stock Alerts
            </h2>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                items.length > 0
                  ? 'border-adm-danger-border bg-adm-danger-bg text-adm-danger'
                  : 'border-adm-success-border bg-adm-success-bg text-adm-success'
              }`}
            >
              {items.length}
            </span>
          </div>
        </div>

        {/* Threshold setting form */}
        <form
          method="get"
          className="flex items-center gap-2 bg-adm-surface-2 px-3 py-1.5 rounded-xl border border-adm-border shrink-0 self-start sm:self-auto"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-adm-muted" aria-hidden="true" />
          <label
            htmlFor="threshold"
            className="text-xs font-medium text-adm-fg-2 whitespace-nowrap"
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
            className="w-14 min-h-[34px] text-center rounded-lg border border-adm-input-border bg-adm-surface font-mono text-xs font-semibold text-adm-fg focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1"
          />
          <button
            type="submit"
            className="min-h-[34px] px-3 rounded-lg bg-adm-accent text-adm-accent-fg text-xs font-semibold hover:bg-adm-accent-hover transition-colors cursor-pointer"
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
        className="admin-table-region"
      >
        <table className="admin-responsive-table w-full border-collapse text-left text-sm">
          <caption id="low-stock-caption" className="sr-only">
            Low stock inventory variants at or below threshold {threshold}
          </caption>
          <thead>
            <tr className="border-b border-adm-border bg-adm-surface-2/70 text-adm-muted text-xs font-medium">
              <th scope="col" className="px-6 py-3">Product</th>
              <th scope="col" className="px-6 py-3">SKU</th>
              <th scope="col" className="px-6 py-3">Attributes</th>
              <th scope="col" className="px-6 py-3 text-center">Stock</th>
              <th scope="col" className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-adm-border">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 px-4">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-success-bg border border-adm-success-border text-adm-success">
                      <PackageSearch className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-semibold text-adm-fg">
                      All stock levels are healthy
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
                    className="hover:bg-adm-surface-2/60 transition-colors"
                  >
                    <th scope="row" className="px-6 py-3.5 font-semibold text-adm-fg text-left">
                      {item.product_name}
                    </th>

                    <td data-label="SKU" className="px-6 py-3.5">
                      {item.sku ? (
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-adm-fg-2 bg-adm-surface-2 px-2.5 py-1 rounded-lg border border-adm-border">
                          <span>{item.sku}</span>
                          <button
                            type="button"
                            onClick={() => handleCopySku(item.sku!)}
                            aria-label={`Copy SKU ${item.sku}`}
                            title="Copy SKU"
                            className="p-1 -m-1 text-adm-muted hover:text-adm-fg transition-colors cursor-pointer"
                          >
                            {copiedSku === item.sku ? (
                              <Check className="h-3.5 w-3.5 text-adm-success" aria-hidden="true" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-adm-muted font-mono text-xs">N/A</span>
                      )}
                    </td>

                    <td data-label="Attributes" className="px-6 py-3.5 text-xs text-adm-fg-2">
                      {optionStr ? (
                        <span className="inline-block rounded-lg bg-adm-surface-2 px-2.5 py-1 border border-adm-border">
                          {optionStr}
                        </span>
                      ) : (
                        <span className="text-adm-muted">Standard</span>
                      )}
                    </td>

                    <td data-label="Stock" className="px-6 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                          isOut
                            ? 'bg-adm-danger-bg text-adm-danger border-adm-danger-border'
                            : 'bg-adm-warning-bg text-adm-warning border-adm-warning-border'
                        }`}
                      >
                        <CircleAlert className="h-3 w-3" aria-hidden="true" />
                        <span>{isOut ? 'Out of Stock (0)' : `${item.stock_qty} left`}</span>
                      </span>
                    </td>

                    <td data-label="Action" className="px-6 py-3.5 text-right">
                      <Link
                        id={`admin-edit-low-stock-${item.id}`}
                        href={`/admin/products/${item.product_id}`}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-adm-border bg-adm-surface px-3 py-1.5 text-xs font-semibold text-adm-fg hover:border-adm-accent-border hover:bg-adm-accent-tint hover:text-adm-accent-text transition-colors"
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
