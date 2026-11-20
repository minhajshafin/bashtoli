import React, { forwardRef } from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'paper' | 'elevated' | 'sunken' | 'forest'
  radius?: 'sm' | 'md' | 'lg'
}

/**
 * Standardized Bashtoli Card Primitive (Phase 2 Step 2)
 * Eliminates ad-hoc border/shadow utilities in favor of systematic design tokens.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'paper',
    radius = 'md',
    className = '',
    children,
    ...props
  },
  ref
) {
  const radiusClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
  }[radius]

  const variantClasses = {
    paper: 'bg-white border border-forest-900/10 shadow-elevation-1',
    elevated: 'bg-white border border-forest-900/12 shadow-elevation-2',
    sunken: 'bg-cream-100/90 border border-forest-900/10 shadow-2xs',
    forest: 'bg-forest-950 text-cream-50 border border-forest-800 shadow-elevation-2',
  }[variant]

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${radiusClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})
