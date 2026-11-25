'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { updateVariantsBulk } from '@/lib/actions/variants-bulk'
import { useProductStudio } from '@/components/admin/product-studio-context'
import { VariantRow, type VariantChange } from '@/components/admin/variant-row'
import type { Database } from '@/lib/supabase/database.types'

type VariantRowData = Database['public']['Tables']['product_variants']['Row']

export type { VariantChange }

export function VariantTable({
  productId,
  variants,
}: {
  productId: string
  variants: VariantRowData[]
}) {
  const router = useRouter()
  const studio = useProductStudio()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [changes, setChanges] = useState<Record<string, VariantChange>>({})

  useEffect(() => {
    studio?.setHasVariantChanges(Object.keys(changes).length > 0)
  }, [changes, studio])

  const executeSave = useCallback(async (): Promise<boolean> => {
    setError(null)
    setSuccess(false)
    const updates = Object.values(changes)
    if (updates.length === 0) return true

    const res = await updateVariantsBulk(productId, updates)
    if (res.error) {
      setError(res.error)
      return false
    }
    setSuccess(true)
    setChanges({})
    router.refresh()
    return true
  }, [changes, productId, router])

  useEffect(() => {
    if (studio?.registerVariantSaveHandler) {
      studio.registerVariantSaveHandler(executeSave)
    }
  }, [studio, executeSave])

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

  function getVariantState(variant: VariantRowData): VariantChange {
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

    setChanges((prev) => {
      const currentState = prev[variantId] || {
        id: variant.id,
        price: variant.price,
        stock_qty: variant.stock_qty,
        sku: variant.sku,
        active: variant.active,
      }
      return {
        ...prev,
        [variantId]: {
          ...currentState,
          [field]: value,
        },
      }
    })
  }

  function handleSave() {
    startTransition(async () => {
      await executeSave()
    })
  }

  function handleBulkToggle(active: boolean) {
    setSuccess(false)
    setChanges((prev) => {
      const nextChanges = { ...prev }
      variants.forEach((v) => {
        const current = prev[v.id] || {
          id: v.id,
          price: v.price,
          stock_qty: v.stock_qty,
          sku: v.sku,
          active: v.active,
        }
        nextChanges[v.id] = {
          ...current,
          active,
        }
      })
      return nextChanges
    })
  }

  const hasChanges = Object.keys(changes).length > 0

  return (
    <div className="rounded-2xl border border-paper-300 bg-paper-50 p-6 shadow-subtle">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="admin-kicker text-ink-500 mb-1">Inventory Matrix</p>
          <h2 className="admin-section-title text-ink-950">SKU Variants</h2>
          <p className="text-xs text-ink-600 mt-1">
            Define pricing, inventory stock level, and SKUs per variant combination.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleBulkToggle(true)}
            className="min-h-[38px] rounded-xl border border-ink-400/70 bg-paper-50 px-3.5 py-1.5 text-xs font-bold text-ink-950 hover:bg-paper-200 transition-colors cursor-pointer"
          >
            Publish All
          </button>
          <button
            type="button"
            onClick={() => handleBulkToggle(false)}
            className="min-h-[38px] rounded-xl border border-ink-400/70 bg-paper-50 px-3.5 py-1.5 text-xs font-bold text-ink-950 hover:bg-paper-200 transition-colors cursor-pointer"
          >
            Draft All
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-signal-danger-border bg-signal-danger-bg px-4 py-3 text-sm font-medium text-signal-danger"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-ink-800 bg-ink-950 px-4 py-3 text-sm font-medium text-paper-50"
        >
          Variants updated successfully!
        </div>
      )}

      <div
        tabIndex={0}
        role="region"
        aria-labelledby="variants-table-caption"
        className="overflow-x-auto rounded-xl border border-paper-300 focus-visible:outline-2 focus-visible:outline-ink-950"
      >
        <table className="w-full text-sm text-ink-700">
          <caption id="variants-table-caption" className="sr-only">
            SKU variants pricing and inventory table
          </caption>
          <thead>
            <tr className="border-b border-paper-300 bg-paper-200/70 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-600">
              {optionKeys.map((key) => (
                <th scope="col" key={key} className="px-4 py-3">
                  {key}
                </th>
              ))}
              <th scope="col" className="px-4 py-3">SKU</th>
              <th scope="col" className="px-4 py-3">Price (BDT)</th>
              <th scope="col" className="px-4 py-3">Stock Level</th>
              <th scope="col" className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-200 bg-paper-50">
            {variants.map((v) => (
              <VariantRow
                key={v.id}
                variant={v}
                state={getVariantState(v)}
                optionKeys={optionKeys}
                isDirty={!!changes[v.id]}
                onChange={handleChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center justify-end border-t border-paper-200 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isPending}
          className="min-h-[44px] rounded-xl bg-ink-950 px-5 py-2.5 text-xs font-bold text-paper-50 hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-45 transition-colors cursor-pointer"
        >
          {isPending ? 'Saving Changes...' : 'Save Variant Changes'}
        </button>
      </div>
    </div>
  )
}
