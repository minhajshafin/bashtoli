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
  const isCombinationUnavailable = (optionName: string, val: string) => {
    const hypothetical = { ...selectedOptions, [optionName]: val }
    
    const matchingVariant = variants.find((variant) => {
      const optVals = (variant.option_values || {}) as Record<string, string>
      return Object.entries(hypothetical).every(([key, value]) => optVals[key] === value)
    })

    return !matchingVariant
  }

  return (
    <div className="space-y-6 my-6">
      {options.map((opt) => {
        return (
          <div key={opt.id} className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-500">
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
                        ? 'bg-forest-800 border-forest-800 text-cream-100 shadow-sm'
                        : isUnavailable
                        ? 'bg-forest-100/50 border-forest-200/60 text-forest-300 line-through'
                        : 'bg-white border-forest-200 text-forest-800 hover:border-gold-500'
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

