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
    <div className="space-y-5 my-5">
      {options.map((opt) => {
        const currentValue = selectedOptions[opt.name]

        return (
          <div key={opt.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-600/90">
                {opt.name}
              </span>
              {currentValue && (
                <span className="font-sans text-xs text-forest-900 font-medium">
                  Selected: <span className="text-gold-600 font-semibold">{currentValue}</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {opt.values.map((val) => {
                const isSelected = selectedOptions[opt.name] === val.value
                const isUnavailable = isCombinationUnavailable(opt.name, val.value)

                return (
                  <button
                    key={val.id}
                    type="button"
                    disabled={isUnavailable}
                    onClick={() => onChange(opt.name, val.value)}
                    className={`rounded-xl px-3.5 py-2 text-xs sm:text-[13px] font-sans font-medium transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-forest-900 border-forest-900 text-cream-50 shadow-xs ring-1 ring-gold-400/50'
                        : isUnavailable
                        ? 'bg-forest-100/30 border-dashed border-forest-200/60 text-forest-300 line-through cursor-not-allowed opacity-60'
                        : 'bg-cream-50/80 hover:bg-white border-forest-200/80 text-forest-800 hover:border-gold-500/80 active:scale-[0.98]'
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

