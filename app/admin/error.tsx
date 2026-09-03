'use client'

export default function AdminError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-red-600 mb-4">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-zinc-900 mb-2">Admin Error</h2>
      <p className="text-sm text-zinc-500 max-w-md mb-6">
        An error occurred in the admin panel. Please try again.
      </p>
      <button
        onClick={reset}
        className="h-10 px-5 rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer"
      >
        Try Again
      </button>
    </div>
  )
}
