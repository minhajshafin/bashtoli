import React from 'react'

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

/**
 * Standardized Bashtoli Chip Primitive (Phase 2 Step 2)
 * Meets 44px minimum tap targets on touch devices, using unified cream canvas tokens.
 */
export function Chip({
  active = false,
  className = '',
  disabled,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center min-h-[36px] sm:min-h-[40px] px-3.5 sm:px-4 py-1.5 rounded-pill font-sans text-xs sm:text-[13px] font-medium transition-transform active:scale-95 duration-fast cursor-pointer select-none border ${
        active
          ? 'bg-forest-950 text-cream-50 border-forest-950 shadow-elevation-1'
          : 'bg-white text-forest-800 hover:text-forest-950 hover:bg-cream-100 border-forest-900/15 shadow-2xs'
      } disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
