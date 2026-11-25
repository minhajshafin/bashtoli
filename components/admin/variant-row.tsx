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
  const variantLabel =
    optionKeys.map((k) => optionValues[k]).filter(Boolean).join(' / ') ||
    state.sku ||
    'Default variant'

  function preventEnterSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <tr
      className={`hover:bg-paper-100/80 transition-colors ${
        isDirty ? 'bg-paper-200/70' : ''
      }`}
    >
      {optionKeys.map((key) => (
        <td key={key} className="px-4 py-3.5 font-bold text-ink-950 whitespace-nowrap">
          {optionValues[key] || '-'}
        </td>
      ))}

      <td className="px-4 py-3.5">
        <input
          type="text"
          value={state.sku ?? ''}
          aria-label={`SKU for ${variantLabel}`}
          onKeyDown={preventEnterSubmit}
          onChange={(e) => onChange(variant.id, 'sku', e.target.value)}
          placeholder="e.g. TBL-BAMB-S"
          className="w-36 min-h-[38px] rounded-lg border border-ink-400/80 bg-paper-50 px-2.5 py-1.5 font-mono text-xs text-ink-950 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1"
        />
      </td>

      <td className="px-4 py-3.5">
        <div className="relative w-32">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-ink-600 font-mono text-[10px] font-bold pointer-events-none">
            Tk
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={state.price}
            aria-label={`Price in BDT for ${variantLabel}`}
            onKeyDown={preventEnterSubmit}
            onChange={(e) => onChange(variant.id, 'price', e.target.value)}
            className="w-full min-h-[38px] rounded-lg border border-ink-400/80 bg-paper-50 pl-7 pr-2.5 py-1.5 font-mono text-xs font-bold text-ink-950 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1"
          />
        </div>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={state.stock_qty}
            aria-label={`Stock quantity for ${variantLabel}`}
            onKeyDown={preventEnterSubmit}
            onChange={(e) => onChange(variant.id, 'stock_qty', e.target.value)}
            className={`w-22 min-h-[38px] rounded-lg border px-2.5 py-1.5 font-mono text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-1 ${
              isZeroStock
                ? 'border-signal-danger-border bg-signal-danger-bg text-signal-danger focus-visible:outline-signal-danger'
                : 'border-ink-400/80 bg-paper-50 text-ink-950 focus-visible:outline-ink-950'
            }`}
          />
          {isZeroStock && (
            <span className="inline-flex items-center rounded-md bg-signal-danger-bg border border-signal-danger-border px-2 py-0.5 font-mono text-[10px] font-bold text-signal-danger whitespace-nowrap">
              Out of Stock
            </span>
          )}
        </div>
      </td>

      <td className="px-4 py-3.5 text-center">
        <div className="flex items-center justify-center">
          <button
            type="button"
            role="switch"
            aria-checked={state.active}
            aria-label={`Toggle ${variantLabel} active`}
            onClick={() => onChange(variant.id, 'active', !state.active)}
            className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-2 ${
              state.active
                ? 'bg-ink-950 border-ink-950'
                : 'bg-paper-300 border-ink-400/70'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-paper-50 shadow-subtle transition-transform duration-150 mt-[3px] ${
                state.active ? 'translate-x-[18px]' : 'translate-x-[3px]'
              }`}
            />
          </button>
        </div>
      </td>
    </tr>
  )
}
