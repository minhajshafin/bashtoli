import React, { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  helperText?: string
}

/**
 * Standardized Bashtoli Form Input Primitive (Phase 2 Step 2)
 * Meets 44px touch target guidelines, WCAG AA contrast, and unified focus styles.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    error = false,
    helperText,
    className = '',
    disabled,
    ...props
  },
  ref
) {
  return (
    <div className="w-full space-y-1">
      <input
        ref={ref}
        disabled={disabled}
        className={`w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-[13px] font-sans text-forest-950 bg-white placeholder:text-forest-600/50 rounded-md border transition-colors duration-fast ${
          error
            ? 'border-terracotta-500 focus:border-terracotta-600 focus:ring-1 focus:ring-terracotta-500/30'
            : 'border-forest-900/15 hover:border-forest-900/30 focus:border-forest-800 focus:ring-2 focus:ring-forest-800/15'
        } focus:outline-none disabled:bg-cream-100 disabled:text-forest-400 disabled:cursor-not-allowed shadow-2xs ${className}`}
        {...props}
      />
      {helperText && (
        <p className={`text-[11px] font-sans ${error ? 'text-terracotta-600' : 'text-forest-600/70'}`}>
          {helperText}
        </p>
      )}
    </div>
  )
})
