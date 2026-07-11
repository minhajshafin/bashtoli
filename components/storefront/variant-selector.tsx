'use client'

import React from 'react'
import type { ProductOptionRow, ProductOptionValueRow, ProductVariantRow } from '@/lib/queries/product-detail'

interface StructuredOption extends ProductOptionRow {
  values: ProductOptionValueRow[]
}

interface VariantSelectorProps {
  options: StructuredOption[]
  variants: ProductVariantRow[]
  selectedOptions: Record<string, string>
  onChange: (optionName: string, value: string) => void
}

export function VariantSelector({
  options,
  variants,
  selectedOptions,
  onChange,
}: VariantSelectorProps) {
  if (options.length === 0) return null

  // Function to determine if selecting a value would result in a combination with zero stock or no active variant
  // This is a nice premium UX enhancement!
  const isCombinationUnavailable = (optionName: string, val: string) => {
    // Check if there exists ANY active variant that has this value for this option
    // AND satisfies the other currently selected options
    const hypothetical = { ...selectedOptions, [optionName]: val }
    
    const matchingVariant = variants.find((variant) => {
      const optVals = (variant.option_values || {}) as Record<string, string>
      // Compare only the keys that have been selected in the hypothetical combination
      return Object.entries(hypothetical).every(([key, value]) => optVals[key] === value)
    })

    return !matchingVariant
  }

  return (
    <div className="space-y-6 my-6">
      {options.map((opt) => {
        return (
          <div key={opt.id} className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {opt.name}
            </span>
            <div className="flex flex-wrap gap-2">
              {opt.values.map((val) => {
                const isSelected = selectedOptions[opt.name] === val.value
                const isUnavailable = isCombinationUnavailable(opt.name, val.value)

                return (
                  <button
                    key={val.id}
                    type="button"
                    onClick={() => onChange(opt.name, val.value)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all border ${
                      isSelected
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-900'
                        : isUnavailable
                        ? 'bg-zinc-50/50 border-zinc-200/60 text-zinc-300 line-through dark:bg-zinc-900/30 dark:border-zinc-800/50 dark:text-zinc-600'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {val.value}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
