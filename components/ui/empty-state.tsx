import React from 'react'
import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  icon?: React.ReactNode
}

/**
 * Standard EmptyState Feedback Component.
 */
export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white py-16 px-6 text-center dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
      {/* Icon Frame */}
      {icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500">
          {icon}
        </div>
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500">
          <svg className="h-6 w-6 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      )}

      {/* Narrative */}
      <div className="max-w-xs space-y-1">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
          {title}
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
          {description}
        </p>
      </div>

      {/* CTA Button */}
      {actionLabel && actionHref && (
        <div className="pt-2">
          <Link
            href={actionHref}
            className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            {actionLabel}
          </Link>
        </div>
      )}
    </div>
  )
}
