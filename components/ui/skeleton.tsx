import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: 'sm' | 'md' | 'lg' | 'pill'
}

/**
 * Standardized Bashtoli Skeleton Primitive (Phase 2 Step 2)
 */
export function Skeleton({
  radius = 'md',
  className = '',
  ...props
}: SkeletonProps) {
  const radiusClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    pill: 'rounded-pill',
  }[radius]

  return (
    <div
      className={`animate-pulse bg-cream-200/60 ${radiusClasses} ${className}`}
      {...props}
    />
  )
}
