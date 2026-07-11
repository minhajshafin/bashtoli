'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateVariantsBulk } from '@/lib/actions/variants'
import type { Database } from '@/lib/supabase/database.types'

type VariantRow = Database['public']['Tables']['product_variants']['Row']

type VariantChange = {
  id: string
  price: number
  stock_qty: number
  sku: string | null
  active: boolean
}

export function VariantTable({
  productId,
  variants,
}: {
  productId: string
  variants: VariantRow[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Track changed variants locally before saving
  const [changes, setChanges] = useState<Record<string, VariantChange>>({})

  // Dynamically extract option keys present across all variants
  const optionKeys: string[] = []
  variants.forEach((v) => {
    if (v.option_values && typeof v.option_values === 'object') {
      Object.keys(v.option_values).forEach((k) => {
        if (!optionKeys.includes(k)) {
          optionKeys.push(k)
        }
      })
    }
  })

  function getVariantState(variant: VariantRow): VariantChange {
    if (changes[variant.id]) {
      return changes[variant.id]
    }
    return {
      id: variant.id,
      price: variant.price,
      stock_qty: variant.stock_qty,
      sku: variant.sku,
      active: variant.active,
    }
  }

  function handleChange(
    variantId: string,
    field: keyof VariantChange,
    value: string | number | boolean | null
  ) {
    setSuccess(false)
    const variant = variants.find((v) => v.id === variantId)
    if (!variant) return

    const currentState = getVariantState(variant)
    setChanges({
      ...changes,
      [variantId]: {
        ...currentState,
        [field]: value,
      },
    })
  }

  async function handleSave() {
    setError(null)
    setSuccess(false)

    const updates = Object.values(changes)
    if (updates.length === 0) {
      return
    }

    startTransition(async () => {
      const res = await updateVariantsBulk(productId, updates)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setChanges({})
        router.refresh()
      }
    })
  }

  async function handleBulkToggle(active: boolean) {
    setSuccess(false)
    const nextChanges = { ...changes }
    variants.forEach((v) => {
      const current = getVariantState(v)
      nextChanges[v.id] = {
        ...current,
        active,
      }
    })
    setChanges(nextChanges)
  }

  const hasChanges = Object.keys(changes).length > 0

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">SKU Variants</h2>
          <p className="text-xs text-slate-500">
            Define pricing, inventory stock level, and SKUs per variant combination.
          </p>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleBulkToggle(true)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Publish All
          </button>
          <button
            type="button"
            onClick={() => handleBulkToggle(false)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Draft All
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          Variants updated successfully!
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-500">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              {optionKeys.map((key) => (
                <th key={key} className="px-4 py-3">
                  {key}
                </th>
              ))}
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Price (BDT)</th>
              <th className="px-4 py-3">Stock Level</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {variants.map((v) => {
              const state = getVariantState(v)
              const isZeroStock = state.stock_qty === 0
              const isDirty = !!changes[v.id]

              const optionValues = (v.option_values as Record<string, string>) || {}

              return (
                <tr
                  key={v.id}
                  className={`hover:bg-slate-50/50 transition-colors ${
                    isDirty ? 'bg-indigo-50/20' : ''
                  }`}
                >
                  {/* Dynamic Dimension Value Cells */}
                  {optionKeys.map((key) => (
                    <td key={key} className="px-4 py-3 font-semibold text-slate-900">
                      {optionValues[key] || '-'}
                    </td>
                  ))}

                  {/* SKU Input */}
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={state.sku ?? ''}
                      onChange={(e) =>
                        handleChange(v.id, 'sku', e.target.value)
                      }
                      placeholder="e.g. TBL-BAMB-S"
                      className="w-32 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>

                  {/* Price Input */}
                  <td className="px-4 py-3">
                    <div className="relative w-28">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 text-xs">
                        ৳
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={state.price}
                        onChange={(e) =>
                          handleChange(v.id, 'price', e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 pl-6 pr-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </td>

                  {/* Stock Input & Zero Stock Indicator */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={state.stock_qty}
                        onChange={(e) =>
                          handleChange(v.id, 'stock_qty', e.target.value)
                        }
                        className={`w-20 rounded-lg border px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 ${
                          isZeroStock
                            ? 'border-rose-300 bg-rose-50 text-rose-700 focus:border-rose-500 focus:ring-rose-500'
                            : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                      />
                      {isZeroStock && (
                        <span className="inline-flex items-center rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 ring-1 ring-inset ring-rose-600/10">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status Toggle Switch */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(v.id, 'active', !state.active)
                        }
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-1 ${
                          state.active ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            state.active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isPending}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Saving Changes...' : 'Save Variant Changes'}
        </button>
      </div>
    </div>
  )
}
