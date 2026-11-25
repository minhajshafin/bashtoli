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
    <div className="rounded-2xl border border-adm-border bg-adm-surface p-6 shadow-subtle">
      <div className="mb-5 flex items-center justify-between border-b border-adm-border pb-4">
        <h2 className="text-base font-semibold text-adm-fg">{title}</h2>
        <Link
          href="/admin/categories"
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-adm-muted hover:bg-adm-surface-2 hover:text-adm-fg transition-colors"
          aria-label="Close form"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {state.error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-adm-danger-border bg-adm-danger-bg px-4 py-3 text-sm font-medium text-adm-danger"
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
            className="mb-1.5 block text-xs font-semibold text-adm-fg-2"
          >
            Name <span className="text-adm-danger">*</span>
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
            className="block w-full min-h-[44px] rounded-xl border border-adm-input-border bg-adm-surface px-3.5 py-2.5 text-sm text-adm-fg placeholder:text-adm-muted focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1"
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs font-medium text-adm-danger">
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="category-slug"
            className="mb-1.5 block text-xs font-semibold text-adm-fg-2"
          >
            Slug <span className="text-adm-danger">*</span>
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
            className="block w-full min-h-[44px] rounded-xl border border-adm-input-border bg-adm-surface px-3.5 py-2.5 font-mono text-sm text-adm-fg placeholder:text-adm-muted focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1"
          />
          {state.fieldErrors?.slug && (
            <p className="mt-1 text-xs font-medium text-adm-danger">
              {state.fieldErrors.slug[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="category-sort-order"
            className="mb-1.5 block text-xs font-semibold text-adm-fg-2"
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
            className="block w-28 min-h-[44px] rounded-xl border border-adm-input-border bg-adm-surface px-3.5 py-2.5 font-mono text-sm font-semibold text-adm-fg focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1"
          />
          {state.fieldErrors?.sort_order && (
            <p className="mt-1 text-xs font-medium text-adm-danger">
              {state.fieldErrors.sort_order[0]}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-adm-border">
          <button
            id="category-form-submit"
            type="submit"
            disabled={isPending}
            className="min-h-[42px] rounded-xl bg-adm-accent px-5 py-2 text-xs font-semibold text-adm-accent-fg transition-colors hover:bg-adm-accent-hover disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isPending ? 'Saving…' : submitLabel}
          </button>
          <Link
            href="/admin/categories"
            className="inline-flex min-h-[42px] items-center px-3 text-xs font-medium text-adm-muted hover:text-adm-fg transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
