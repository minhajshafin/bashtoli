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
      <div className="w-full max-w-md rounded-2xl border border-paper-300 bg-paper-50 p-8 shadow-elevation-2">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-signal-danger-border bg-signal-danger-bg text-signal-danger">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="admin-kicker text-ink-500 mb-1">System Fault</p>
        <h1 className="admin-section-title text-ink-950 mb-2">Admin Error</h1>
        <p className="text-sm text-ink-600 mb-6">
          An error occurred while rendering this view. Please try reloading the workspace.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-ink-950 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-paper-50 hover:bg-ink-800 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
