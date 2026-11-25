'use client'

import type { Database } from '@/lib/supabase/database.types'

type VariantRowData = Database['public']['Tables']['product_variants']['Row']

export type VariantChange = {
  id: string
  price: number | string
  stock_qty: number | string
  sku: string | null
  active: boolean
}

interface VariantRowProps {
  variant: VariantRowData
  state: VariantChange
  optionKeys: string[]
  isDirty: boolean
  onChange: (
    variantId: string,
    field: keyof VariantChange,
    value: string | number | boolean | null
  ) => void
}

export function VariantRow({
  variant,
  state,
  optionKeys,
  isDirty,
  onChange,
}: VariantRowProps) {
  const isZeroStock = Number(state.stock_qty) === 0
  const optionValues = (variant.option_values as Record<string, string>) || {}

  function preventEnterSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <tr
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
          onKeyDown={preventEnterSubmit}
          onChange={(e) => onChange(variant.id, 'sku', e.target.value)}
          placeholder="e.g. TBL-BAMB-S"
          className="w-32 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </td>

      {/* Price Input */}
      <td className="px-4 py-3">
        <div className="relative w-28">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400 text-[10px] font-bold">
            Tk
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={state.price}
            onKeyDown={preventEnterSubmit}
            onChange={(e) => onChange(variant.id, 'price', e.target.value)}
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
            onKeyDown={preventEnterSubmit}
            onChange={(e) => onChange(variant.id, 'stock_qty', e.target.value)}
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
            role="switch"
            aria-checked={state.active}
            aria-label={`Toggle variant ${state.sku || variant.id} active`}
            onClick={() => onChange(variant.id, 'active', !state.active)}
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
}
