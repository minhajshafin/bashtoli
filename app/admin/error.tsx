'use client'

import { AlertTriangle } from 'lucide-react'

export default function AdminError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  void _error
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md rounded-2xl border border-adm-border bg-adm-surface p-8 shadow-elevation-2">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-adm-danger-border bg-adm-danger-bg text-adm-danger">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="admin-section-title text-adm-fg mb-2">Something went wrong</h1>
        <p className="text-sm text-adm-muted mb-6">
          An error occurred while loading this page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-adm-accent px-5 py-2.5 text-xs font-semibold text-adm-accent-fg hover:bg-adm-accent-hover transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
