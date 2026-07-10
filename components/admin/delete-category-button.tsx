'use client'

import { useActionState } from 'react'
import { deleteCategory, type CategoryActionState } from '@/lib/actions/categories'

const initialState: CategoryActionState = { error: null }

/**
 * Delete button for a single category row.
 *
 * - Shows a native confirm() dialog before submitting.
 * - Displays an inline error if the server action blocks the delete
 *   (e.g. category has associated products).
 * - Disabled while the action is in-flight.
 */
export function DeleteCategoryButton({
  id,
  name,
  productCount,
}: {
  id: string
  name: string
  productCount: number
}) {
  const [state, formAction, isPending] = useActionState(
    deleteCategory,
    initialState,
  )

  const hasProducts = productCount > 0
  const tooltip = hasProducts
    ? `${productCount} product${productCount === 1 ? '' : 's'} — reassign them first`
    : 'Delete category'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (hasProducts) {
      e.preventDefault()
      return
    }
    const confirmed = window.confirm(
      `Delete category "${name}"? This cannot be undone.`,
    )
    if (!confirmed) {
      e.preventDefault()
    }
  }

  return (
    <div>
      <form action={formAction} onSubmit={handleSubmit}>
        <input type="hidden" name="id" value={id} />
        <button
          id={`delete-category-${id}`}
          type="submit"
          disabled={isPending || hasProducts}
          title={tooltip}
          className="rounded-md px-2.5 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? 'Deleting…' : 'Delete'}
        </button>
      </form>
      {/* Inline error from server (e.g. product count guard fired server-side) */}
      {state.error && (
        <p className="mt-1 text-xs text-rose-600">{state.error}</p>
      )}
    </div>
  )
}
