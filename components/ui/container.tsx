import React from 'react'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

/**
 * Standardized Bashtoli Container Primitive (Phase 2 Step 2)
 */
export function Container({
  size = 'lg',
  className = '',
  children,
  ...props
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-[1360px]',
    xl: 'max-w-[1520px]',
    full: 'max-w-full',
  }[size]

  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'canvas' | 'surface' | 'forest'
}

export function Section({
  variant = 'canvas',
  className = '',
  children,
  ...props
}: SectionProps) {
  const variantClasses = {
    canvas: 'bg-cream-50 bg-laid-paper text-forest-950',
    surface: 'bg-cream-100 bg-laid-paper text-forest-950',
    forest: 'bg-forest-950 bg-laid-paper-dark text-cream-50',
  }[variant]

  return (
    <section
      className={`relative w-full overflow-hidden ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}
