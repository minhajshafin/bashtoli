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

const COLOR_SWATCHES: Record<string, string> = {
  kraft: '#C4A482',
  charcoal: '#333333',
  forest: '#244434',
  chestnut: '#8B4513',
  midnight: '#1A202C',
  natural: '#D8CEBA',
  sage: '#879683',
  steel: '#71797E',
  'matte black': '#222222',
  brass: '#C5A059',
  'dusty rose': '#C99799',
  bamboo: '#C5A059',
  terracotta: '#C86446',
  white: '#F8F9FA',
  cream: '#F5EBE1',
}

function getColorSwatch(val: string): string | null {
  const normalized = val.trim().toLowerCase()
  return COLOR_SWATCHES[normalized] || null
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
    <div id="variant-selector" className="space-y-3.5 sm:space-y-4 my-3 sm:my-4 scroll-mt-20">
      {options.map((opt) => {
        const currentValue = selectedOptions[opt.name]
        const isColorOption = opt.name.toLowerCase().includes('color')

        return (
          <div key={opt.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-600/90">
                  {opt.name}
                </span>
                {currentValue && (
                  <>
                    <span className="text-forest-400 text-[10px]">&bull;</span>
                    <span className="font-sans text-xs text-forest-900 font-semibold">
                      {currentValue}
                    </span>
                  </>
                )}
              </div>
              {!currentValue && (
                <span className="font-sans text-[11px] text-gold-600 font-medium">
                  Select {opt.name.toLowerCase()}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {opt.values.map((val) => {
                const isSelected = selectedOptions[opt.name] === val.value
                const isUnavailable = isCombinationUnavailable(opt.name, val.value)
                const swatch = isColorOption ? getColorSwatch(val.value) : null

                return (
                  <button
                    key={val.id}
                    type="button"
                    disabled={isUnavailable}
                    onClick={() => onChange(opt.name, val.value)}
                    className={`rounded-xl h-10 px-3.5 text-xs sm:text-[13px] font-sans transition-all duration-200 border cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-forest-950 border-gold-400 text-gold-300 shadow-xs ring-1 ring-gold-400/50 font-semibold pointer-events-none'
                        : isUnavailable
                        ? 'bg-forest-100/30 border-dashed border-forest-200/60 text-forest-300 line-through cursor-not-allowed opacity-50'
                        : 'bg-cream-100/60 border-forest-200/80 text-forest-850 hover:border-gold-400/50 hover:bg-cream-100 font-medium'
                    }`}
                  >
                    {swatch && (
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-black/15 shadow-2xs"
                        style={{ backgroundColor: swatch }}
                        aria-hidden="true"
                      />
                    )}
                    <span>{val.value}</span>
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

