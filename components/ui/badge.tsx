import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'forest' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
}

/**
 * Standardized Bashtoli Badge Primitive (Phase 2 Step 2)
 */
export function Badge({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[9px]',
    md: 'px-2.5 py-0.5 text-[10px] sm:text-[11px]',
  }[size]

  const variantClasses = {
    default: 'bg-cream-100 text-forest-800 border border-forest-900/10',
    accent: 'bg-gold-200/60 text-gold-700 border border-gold-400/40 font-semibold',
    forest: 'bg-forest-900 text-cream-50 border border-forest-800',
    success: 'bg-forest-500/10 text-forest-700 border border-forest-500/20',
    warning: 'bg-btn-warning-bg/15 text-btn-warning-border border border-btn-warning-border/30',
    danger: 'bg-btn-danger-bg/10 text-btn-danger-bg border border-btn-danger-border/30',
  }[variant]

  return (
    <span
      className={`inline-flex items-center font-sans font-medium uppercase tracking-wider rounded-pill ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
