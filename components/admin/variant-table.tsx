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
    <div className="rounded-2xl border border-adm-border bg-adm-surface p-6 shadow-subtle">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="admin-section-title text-adm-fg">Variants</h2>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleBulkToggle(true)}
            className="min-h-[36px] rounded-xl border border-adm-border bg-adm-surface px-3.5 py-1.5 text-xs font-semibold text-adm-fg hover:bg-adm-surface-2 transition-colors cursor-pointer"
          >
            Publish All
          </button>
          <button
            type="button"
            onClick={() => handleBulkToggle(false)}
            className="min-h-[36px] rounded-xl border border-adm-border bg-adm-surface px-3.5 py-1.5 text-xs font-semibold text-adm-fg hover:bg-adm-surface-2 transition-colors cursor-pointer"
          >
            Draft All
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-adm-danger-border bg-adm-danger-bg px-4 py-3 text-sm font-medium text-adm-danger"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-adm-success-border bg-adm-success-bg px-4 py-3 text-sm font-medium text-adm-success"
        >
          Variants updated.
        </div>
      )}

      <div
        tabIndex={0}
        role="region"
        aria-labelledby="variants-table-caption"
        className="overflow-x-auto rounded-xl border border-adm-border"
      >
        <table className="w-full text-sm text-adm-fg-2">
          <caption id="variants-table-caption" className="sr-only">
            SKU variants pricing and inventory table
          </caption>
          <thead>
            <tr className="border-b border-adm-border bg-adm-surface-2/70 text-left text-xs font-medium text-adm-muted">
              {optionKeys.map((key) => (
                <th scope="col" key={key} className="px-4 py-3">
                  {key}
                </th>
              ))}
              <th scope="col" className="px-4 py-3">SKU</th>
              <th scope="col" className="px-4 py-3">Price (BDT)</th>
              <th scope="col" className="px-4 py-3">Stock</th>
              <th scope="col" className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-adm-border bg-adm-surface">
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

      <div className="mt-5 flex items-center justify-end border-t border-adm-border pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isPending}
          className="min-h-[42px] rounded-xl bg-adm-accent px-5 py-2 text-xs font-semibold text-adm-accent-fg hover:bg-adm-accent-hover disabled:cursor-not-allowed disabled:opacity-45 transition-colors cursor-pointer"
        >
          {isPending ? 'Saving...' : 'Save Variant Changes'}
        </button>
      </div>
    </div>
  )
}
