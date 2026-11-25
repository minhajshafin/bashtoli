'use client'

import { useActionState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import {
  createCategory,
  updateCategory,
  type CategoryActionState,
} from '@/lib/actions/categories'
import { slugify } from '@/lib/validations/category'
import type { Database } from '@/lib/supabase/database.types'

type CategoryRow = Database['public']['Tables']['categories']['Row']

const initialState: CategoryActionState = { error: null }

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

  const submittedRef = useRef(false)

  useEffect(() => {
    if (submittedRef.current && !state.error && !state.fieldErrors) {
      router.push('/admin/categories')
    }
  }, [state, router])

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (mode !== 'create') return
    const slugInput = (e.target.form as HTMLFormElement | null)?.elements.namedItem(
      'slug',
    ) as HTMLInputElement | null
    if (slugInput && !slugInput.dataset.userEdited) {
      slugInput.value = slugify(e.target.value)
    }
  }

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
    <div className="rounded-2xl border border-paper-300 bg-paper-50 p-6 shadow-elevation-1">
      <div className="mb-5 flex items-center justify-between border-b border-paper-200 pb-4">
        <div>
          <p className="admin-kicker text-ink-500 mb-0.5">
            {mode === 'create' ? 'Create' : 'Update'}
          </p>
          <h2 className="text-base font-bold text-ink-950">{title}</h2>
        </div>
        <Link
          href="/admin/categories"
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-ink-500 hover:bg-paper-200 hover:text-ink-950 transition-colors"
          aria-label="Close form"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {state.error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-signal-danger-border bg-signal-danger-bg px-4 py-3 text-sm font-medium text-signal-danger"
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
        {mode === 'edit' && category && (
          <input type="hidden" name="id" value={category.id} />
        )}

        <div>
          <label
            htmlFor="category-name"
            className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700"
          >
            Name <span className="text-signal-danger">*</span>
          </label>
          <input
            id="category-name"
            name="name"
            type="text"
            required
            maxLength={80}
            defaultValue={category?.name ?? ''}
            onChange={handleNameChange}
            placeholder="e.g. Fountain Pens"
            className="block w-full min-h-[44px] rounded-xl border border-ink-400/80 bg-paper-50 px-3.5 py-2.5 text-sm text-ink-950 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1"
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs font-medium text-signal-danger">
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="category-slug"
            className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700"
          >
            Slug <span className="text-signal-danger">*</span>
          </label>
          <input
            id="category-slug"
            name="slug"
            type="text"
            required
            maxLength={80}
            defaultValue={category?.slug ?? ''}
            onChange={handleSlugChange}
            placeholder="e.g. fountain-pens"
            className="block w-full min-h-[44px] rounded-xl border border-ink-400/80 bg-paper-50 px-3.5 py-2.5 font-mono text-sm text-ink-950 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1"
          />
          <p className="mt-1 text-xs text-ink-600">
            Used in URLs. Auto-generated from name; editable.
          </p>
          {state.fieldErrors?.slug && (
            <p className="mt-1 text-xs font-medium text-signal-danger">
              {state.fieldErrors.slug[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="category-sort-order"
            className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700"
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
            className="block w-28 min-h-[44px] rounded-xl border border-ink-400/80 bg-paper-50 px-3.5 py-2.5 font-mono text-sm font-bold text-ink-950 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1"
          />
          <p className="mt-1 text-xs text-ink-600">
            Lower numbers appear first. 0 = top.
          </p>
          {state.fieldErrors?.sort_order && (
            <p className="mt-1 text-xs font-medium text-signal-danger">
              {state.fieldErrors.sort_order[0]}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-paper-200">
          <button
            id="category-form-submit"
            type="submit"
            disabled={isPending}
            className="min-h-[44px] rounded-xl bg-ink-950 px-5 py-2 text-xs font-bold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isPending ? 'Saving…' : submitLabel}
          </button>
          <Link
            href="/admin/categories"
            className="inline-flex min-h-[44px] items-center px-3 text-xs font-bold text-ink-600 hover:text-ink-950 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
