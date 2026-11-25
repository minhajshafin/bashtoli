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

  async function handleSave() {
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">SKU Variants</h2>
          <p className="text-xs text-slate-500">
            Define pricing, inventory stock level, and SKUs per variant combination.
          </p>
        </div>

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
