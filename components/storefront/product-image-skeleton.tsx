import React from 'react'

interface ProductImageSkeletonProps {
  className?: string
  aspectRatio?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProductImageSkeleton({
  className = '',
  aspectRatio,
  showText = true,
  size = 'md',
}: ProductImageSkeletonProps) {
  const iconSize =
    size === 'sm'
      ? 'h-6 w-6'
      : size === 'lg'
      ? 'h-14 w-14 sm:h-16 sm:w-16'
      : 'h-9 w-9 sm:h-11 sm:w-11'

  const textSize =
    size === 'sm'
      ? 'text-[9px]'
      : size === 'lg'
      ? 'text-xs'
      : 'text-[10px] sm:text-[11px]'

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-cream-100 via-cream-200/90 to-cream-100 select-none animate-pulse ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
      aria-label="No product image uploaded placeholder"
    >
      <div className="flex flex-col items-center justify-center text-forest-700/25">
        <svg
          className={`${iconSize} stroke-[1.2]`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {showText && (
          <span
            className={`mt-2 font-semibold tracking-widest uppercase text-forest-700/30 ${textSize}`}
          >
            No image
          </span>
        )}
      </div>

      {/* Decorative skeleton placeholder bar */}
      {size !== 'sm' && (
        <div className="absolute bottom-3.5 left-5 right-5 h-1.5 rounded-full bg-forest-900/5" />
      )}
    </div>
  )
}
