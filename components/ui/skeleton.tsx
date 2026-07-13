import React from 'react'

/**
 * Skeleton placeholder loader.
 * Renders a pulsing container to indicate active fetching states.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 ${className}`}
      {...props}
    />
  )
}
