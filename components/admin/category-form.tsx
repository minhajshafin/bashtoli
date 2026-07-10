'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  createCategory,
  updateCategory,
  type CategoryActionState,
} from '@/lib/actions/categories'
import { slugify } from '@/lib/validations/category'
import type { Database } from '@/lib/supabase/database.types'

type CategoryRow = Database['public']['Tables']['categories']['Row']

const initialState: CategoryActionState = { error: null }

/**
 * Category create/edit form panel.
 *
 * - `mode='create'` → calls createCategory, shows blank fields
 * - `mode='edit'`   → calls updateCategory, pre-fills with `category` data
 *
 * On successful save (error === null and no fieldErrors after at least one
 * submission), the router navigates back to the clean list URL.
 */
export function CategoryForm({
  mode,
  category,
}: {
  mode: 'create' | 'edit'
  category?: CategoryRow
}) {
  const router = useRouter()
  const action = mode === 'create' ? createCategory : updateCategory
  const [state, formAction, isPending] = useActionState(action, initialState)

  // Track whether the form has been submitted at least once so we don't
  // navigate away on the initial render (when error is also null).
  const submittedRef = useRef(false)

  useEffect(() => {
    if (submittedRef.current && !state.error && !state.fieldErrors) {
      // Success — close the panel by clearing search params
      router.push('/admin/categories')
    }
  }, [state, router])

  /** Auto-populate slug from name while user is typing (create mode only). */
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (mode !== 'create') return
    const slugInput = (e.target.form as HTMLFormElement | null)?.elements.namedItem(
      'slug',
    ) as HTMLInputElement | null
    if (slugInput && !slugInput.dataset.userEdited) {
      slugInput.value = slugify(e.target.value)
    }
  }

  /** Mark slug as manually edited so auto-fill stops overwriting it. */
  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value) {
      e.target.dataset.userEdited = 'true'
    } else {
      delete e.target.dataset.userEdited
    }
  }

  const title = mode === 'create' ? 'New Category' : 'Edit Category'
  const submitLabel = mode === 'create' ? 'Create' : 'Save changes'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <a
          href="/admin/categories"
          className="text-sm text-slate-400 hover:text-slate-600"
          aria-label="Close form"
        >
          ✕
        </a>
      </div>

      {/* Top-level error banner */}
      {state.error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {state.error}
        </div>
      )}

      <form
        action={formAction}
        onSubmit={() => {
          submittedRef.current = true
        }}
        className="space-y-4"
      >
        {/* Hidden id for edit mode */}
        {mode === 'edit' && category && (
          <input type="hidden" name="id" value={category.id} />
        )}

        {/* Name */}
        <div>
          <label
            htmlFor="category-name"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="category-name"
            name="name"
            type="text"
            required
            maxLength={80}
            defaultValue={category?.name ?? ''}
            onChange={handleNameChange}
            placeholder="e.g. Men's T-Shirts"
            className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="category-slug"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Slug <span className="text-rose-500">*</span>
          </label>
          <input
            id="category-slug"
            name="slug"
            type="text"
            required
            maxLength={80}
            defaultValue={category?.slug ?? ''}
            onChange={handleSlugChange}
            placeholder="e.g. mens-t-shirts"
            className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <p className="mt-1 text-xs text-slate-400">
            Used in URLs. Auto-generated from name; editable.
          </p>
          {state.fieldErrors?.slug && (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.slug[0]}
            </p>
          )}
        </div>

        {/* Sort order */}
        <div>
          <label
            htmlFor="category-sort-order"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Sort order
          </label>
          <input
            id="category-sort-order"
            name="sort_order"
            type="number"
            min={0}
            max={9999}
            defaultValue={category?.sort_order ?? 0}
            className="block w-24 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <p className="mt-1 text-xs text-slate-400">
            Lower numbers appear first. 0 = top.
          </p>
          {state.fieldErrors?.sort_order && (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.sort_order[0]}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            id="category-form-submit"
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Saving…' : submitLabel}
          </button>
          <a
            href="/admin/categories"
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
