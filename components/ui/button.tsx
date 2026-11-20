import React, { forwardRef } from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  pill?: boolean
}

/**
 * Standardized Bashtoli Button Primitive (Phase 2 Step 2)
 * Adheres strictly to design tokens, 44px minimum tap targets, and composite-only transitions.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    pill = false,
    className = '',
    disabled,
    children,
    ...props
  },
  ref
) {
  const baseClasses =
    'inline-flex items-center justify-center font-sans font-semibold cursor-pointer select-none ' +
    'transition-transform active:scale-[0.98] duration-fast ease-smooth ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/30 focus-visible:ring-offset-1 ' +
    'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed'

  const sizeClasses = {
    sm: 'h-8 px-3 text-[11px] uppercase tracking-wider',
    md: 'min-h-[44px] px-4 py-2 text-xs sm:text-[13px]',
    lg: 'min-h-[48px] px-6 py-2.5 text-sm uppercase tracking-wider',
    icon: 'h-11 w-11 p-2 flex items-center justify-center',
  }[size]

  const radiusClasses = pill ? 'rounded-pill' : size === 'sm' ? 'rounded-sm' : 'rounded-md'

  const variantClasses = {
    primary:
      'bg-forest-950 text-cream-50 hover:bg-forest-900 border border-forest-800 shadow-elevation-1',
    secondary:
      'bg-white text-forest-900 hover:bg-cream-100 border border-forest-900/15 shadow-elevation-1',
    accent:
      'bg-btn-accent-bg text-btn-accent-text hover:bg-gold-400 border border-gold-600 shadow-elevation-1 font-bold',
    ghost:
      'bg-transparent text-forest-800 hover:bg-forest-900/5 hover:text-forest-950 border border-transparent',
    danger:
      'bg-btn-danger-bg text-cream-50 hover:bg-terracotta-700 border border-terracotta-800 shadow-elevation-1',
    outline:
      'bg-transparent text-forest-900 hover:bg-forest-900/5 border border-forest-900/20',
  }[variant]

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${radiusClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})
