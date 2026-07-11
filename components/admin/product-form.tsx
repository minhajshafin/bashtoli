'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  createProduct,
  updateProduct,
  type ProductActionState,
} from '@/lib/actions/products'
import { slugify } from '@/lib/validations/category'
import type { Database } from '@/lib/supabase/database.types'

type CategoryRow = Database['public']['Tables']['categories']['Row']
type ProductRow = Database['public']['Tables']['products']['Row']

const initialState: ProductActionState = { error: null }

export function ProductForm({
  mode,
  product,
  categories,
}: {
  mode: 'create' | 'edit'
  product?: ProductRow
  categories: CategoryRow[]
}) {
  const router = useRouter()
  const action = mode === 'create' ? createProduct : updateProduct
  const [state, formAction, isPending] = useActionState(action, initialState)

  const submittedRef = useRef(false)

  useEffect(() => {
    if (submittedRef.current && !state.error && !state.fieldErrors) {
      router.push('/admin/products')
      router.refresh()
    }
  }, [state, router])

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (mode !== 'create') return
    const slugInput = (e.target.form as HTMLFormElement | null)?.elements.namedItem(
      'slug'
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

  const title = mode === 'create' ? 'Add New Product' : 'Edit Product'
  const submitLabel = mode === 'create' ? 'Create Product' : 'Save Changes'

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>

      {state.error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {state.error}
        </div>
      )}

      <form
        action={formAction}
        onSubmit={() => {
          submittedRef.current = true
        }}
        className="space-y-6"
      >
        {mode === 'edit' && product && (
          <input type="hidden" name="id" value={product.id} />
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="product-name"
            className="block text-sm font-medium text-slate-700"
          >
            Product Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="product-name"
            name="name"
            type="text"
            required
            maxLength={150}
            defaultValue={product?.name ?? ''}
            onChange={handleNameChange}
            placeholder="e.g. Fine Bamboo Table"
            className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {state.fieldErrors?.name && (
            <p className="text-xs text-rose-600">
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <label
            htmlFor="product-slug"
            className="block text-sm font-medium text-slate-700"
          >
            Slug <span className="text-rose-500">*</span>
          </label>
          <input
            id="product-slug"
            name="slug"
            type="text"
            required
            maxLength={150}
            defaultValue={product?.slug ?? ''}
            onChange={handleSlugChange}
            placeholder="e.g. fine-bamboo-table"
            className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <p className="text-xs text-slate-400">
            Used in the storefront URL. Must be unique and kebab-cased.
          </p>
          {state.fieldErrors?.slug && (
            <p className="text-xs text-rose-600">
              {state.fieldErrors.slug[0]}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label
            htmlFor="product-category"
            className="block text-sm font-medium text-slate-700"
          >
            Category
          </label>
          <select
            id="product-category"
            name="category_id"
            defaultValue={product?.category_id ?? ''}
            className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">Uncategorised</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {state.fieldErrors?.category_id && (
            <p className="text-xs text-rose-600">
              {state.fieldErrors.category_id[0]}
            </p>
          )}
        </div>

        {/* Base Price */}
        <div className="space-y-1.5">
          <label
            htmlFor="product-price"
            className="block text-sm font-medium text-slate-700"
          >
            Base Price (BDT) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-sm">
              ৳
            </span>
            <input
              id="product-price"
              name="base_price"
              type="number"
              step="0.01"
              min="0"
              max="1000000"
              required
              defaultValue={product?.base_price ?? ''}
              placeholder="e.g. 2499"
              className="block w-full rounded-lg border border-slate-300 pl-8 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          {state.fieldErrors?.base_price && (
            <p className="text-xs text-rose-600">
              {state.fieldErrors.base_price[0]}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label
            htmlFor="product-description"
            className="block text-sm font-medium text-slate-700"
          >
            Description
          </label>
          <textarea
            id="product-description"
            name="description"
            rows={5}
            maxLength={1000}
            defaultValue={product?.description ?? ''}
            placeholder="Describe the product material, dimensions, etc..."
            className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {state.fieldErrors?.description && (
            <p className="text-xs text-rose-600">
              {state.fieldErrors.description[0]}
            </p>
          )}
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Active Toggle */}
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50">
            <div className="flex h-5 items-center">
              <input
                id="product-active"
                name="active"
                type="checkbox"
                defaultChecked={product?.active ?? false}
                className="h-4 w-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="product-active"
                className="block text-sm font-semibold text-slate-900"
              >
                Published
              </label>
              <p className="text-xs text-slate-500">
                Visible to customers on the storefront.
              </p>
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50">
            <div className="flex h-5 items-center">
              <input
                id="product-featured"
                name="featured"
                type="checkbox"
                defaultChecked={product?.featured ?? false}
                className="h-4 w-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="product-featured"
                className="block text-sm font-semibold text-slate-900"
              >
                Featured Product
              </label>
              <p className="text-xs text-slate-500">
                Promote on home page featured sections.
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            id="product-form-submit"
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
