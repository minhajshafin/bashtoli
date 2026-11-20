import React, { forwardRef } from 'react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  helperText?: string
}

/**
 * Standardized Bashtoli Form Select Primitive (Phase 2 Step 2)
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    error = false,
    helperText,
    className = '',
    disabled,
    children,
    ...props
  },
  ref
) {
  return (
    <div className="w-full space-y-1 relative">
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          className={`w-full min-h-[44px] pl-3.5 pr-9 py-2 text-xs sm:text-[13px] font-sans text-forest-950 bg-white rounded-md border appearance-none cursor-pointer transition-colors duration-fast ${
            error
              ? 'border-terracotta-500 focus:border-terracotta-600 focus:ring-1 focus:ring-terracotta-500/30'
              : 'border-forest-900/15 hover:border-forest-900/30 focus:border-forest-800 focus:ring-2 focus:ring-forest-800/15'
          } focus:outline-none disabled:bg-cream-100 disabled:text-forest-400 disabled:cursor-not-allowed shadow-2xs ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-forest-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
      {helperText && (
        <p className={`text-[11px] font-sans ${error ? 'text-terracotta-600' : 'text-forest-600/70'}`}>
          {helperText}
        </p>
      )}
    </div>
  )
})
