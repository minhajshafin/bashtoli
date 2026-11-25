'use client'

import { Trash2 } from 'lucide-react'
import type { ProductActionState } from '@/lib/actions/products'
import type { Database } from '@/lib/supabase/database.types'
import type { ProductFormValues } from './product-studio-header'

type CategoryRow = Database['public']['Tables']['categories']['Row']
type ProductRow = Database['public']['Tables']['products']['Row']

interface ProductSidebarCardsProps {
  mode: 'create' | 'edit'
  product?: ProductRow
  categories: CategoryRow[]
  formData: ProductFormValues
  activeFieldErrors?: ProductActionState['fieldErrors']
  isDeleting: boolean
  onFieldChange: <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K]
  ) => void
  onDeleteProduct: () => void
}

export function ProductSidebarCards({
  mode,
  product,
  categories,
  formData,
  activeFieldErrors,
  isDeleting,
  onFieldChange,
  onDeleteProduct,
}: ProductSidebarCardsProps) {
  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Visibility */}
      <div className="rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-subtle space-y-3.5">
        <h2 className="text-sm font-semibold text-adm-fg">Visibility</h2>

        <label
          htmlFor="product-active"
          className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-adm-border bg-adm-surface-2/60 transition-colors hover:bg-adm-surface-2 cursor-pointer"
        >
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-adm-fg">Published</span>
            <p className="text-[11px] text-adm-muted">
              {formData.active ? 'Visible on storefront' : 'Saved as draft'}
            </p>
          </div>
          <span className="relative inline-flex items-center shrink-0 mt-0.5">
            <input
              type="checkbox"
              id="product-active"
              name="active"
              checked={formData.active}
              onChange={(e) => onFieldChange('active', e.target.checked)}
              className="sr-only peer"
            />
            <span className="w-10 h-6 bg-adm-border border border-adm-input-border/60 rounded-full peer peer-focus-visible:outline-2 peer-focus-visible:outline-adm-accent peer-focus-visible:outline-offset-2 peer-checked:bg-adm-accent peer-checked:border-adm-accent transition-colors relative after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:h-4 after:w-4 after:rounded-full after:bg-adm-surface after:shadow-2xs after:transition-transform peer-checked:after:translate-x-4" />
          </span>
        </label>

        <label
          htmlFor="product-featured"
          className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-adm-border bg-adm-surface-2/60 transition-colors hover:bg-adm-surface-2 cursor-pointer"
        >
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-adm-fg">Featured</span>
            <p className="text-[11px] text-adm-muted">Show in homepage sections</p>
          </div>
          <span className="relative inline-flex items-center shrink-0 mt-0.5">
            <input
              type="checkbox"
              id="product-featured"
              name="featured"
              checked={formData.featured}
              onChange={(e) => onFieldChange('featured', e.target.checked)}
              className="sr-only peer"
            />
            <span className="w-10 h-6 bg-adm-border border border-adm-input-border/60 rounded-full peer peer-focus-visible:outline-2 peer-focus-visible:outline-adm-accent peer-focus-visible:outline-offset-2 peer-checked:bg-adm-accent peer-checked:border-adm-accent transition-colors relative after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:h-4 after:w-4 after:rounded-full after:bg-adm-surface after:shadow-2xs after:transition-transform peer-checked:after:translate-x-4" />
          </span>
        </label>
      </div>

      {/* Pricing & Inventory */}
      <div className="rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-subtle space-y-4">
        <h2 className="text-sm font-semibold text-adm-fg">
          {mode === 'create' ? 'Pricing & Stock' : 'Pricing'}
        </h2>

        <div className="space-y-1.5">
          <label htmlFor="product-price" className="block text-xs font-medium text-adm-fg-2">
            Base Price (BDT) <span className="text-adm-danger">*</span>
          </label>
          <div className="relative rounded-xl border border-adm-input-border focus-within:outline-2 focus-within:outline-adm-accent focus-within:outline-offset-1 bg-adm-surface">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-adm-muted font-mono font-semibold text-xs select-none">
              Tk
            </span>
            <input
              id="product-price"
              name="base_price"
              type="number"
              step="0.01"
              min="0"
              max="1000000"
              required
              value={formData.base_price}
              onChange={(e) => onFieldChange('base_price', e.target.value)}
              placeholder="450"
              className="block w-full min-h-[44px] rounded-xl pl-9 pr-3.5 py-2.5 font-mono text-sm font-semibold text-adm-fg placeholder:text-adm-muted outline-none bg-transparent"
            />
          </div>
          {activeFieldErrors?.base_price && (
            <p className="text-xs text-adm-danger font-medium">
              {activeFieldErrors.base_price[0]}
            </p>
          )}
        </div>

        {mode === 'create' && (
          <div className="space-y-1.5 pt-3 border-t border-adm-border">
            <label htmlFor="product-initial-stock" className="block text-xs font-medium text-adm-fg-2">
              Initial Stock
            </label>
            <input
              id="product-initial-stock"
              name="initial_stock_qty"
              type="number"
              min="0"
              max="100000"
              step="1"
              value={formData.initial_stock_qty}
              onChange={(e) => onFieldChange('initial_stock_qty', e.target.value)}
              placeholder="0"
              className="block w-full min-h-[44px] rounded-xl border border-adm-input-border bg-adm-surface px-3.5 py-2.5 font-mono text-sm font-semibold text-adm-fg placeholder:text-adm-muted focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1 transition-colors"
            />
            {activeFieldErrors?.initial_stock_qty && (
              <p className="text-xs text-adm-danger font-medium">
                {activeFieldErrors.initial_stock_qty[0]}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Category */}
      <div className="rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-subtle space-y-3.5">
        <h2 className="text-sm font-semibold text-adm-fg">Category</h2>

        <div className="space-y-1.5">
          <label htmlFor="product-category" className="sr-only">
            Category
          </label>
          <select
            id="product-category"
            name="category_id"
            value={formData.category_id}
            onChange={(e) => onFieldChange('category_id', e.target.value)}
            className="block w-full min-h-[44px] rounded-xl border border-adm-input-border px-3.5 py-2.5 text-sm font-medium text-adm-fg focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1 bg-adm-surface transition-colors cursor-pointer"
          >
            <option value="">Uncategorised</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {activeFieldErrors?.category_id && (
            <p className="text-xs text-adm-danger font-medium">
              {activeFieldErrors.category_id[0]}
            </p>
          )}
        </div>
      </div>

      {/* Danger Zone in Edit Mode */}
      {mode === 'edit' && product && (
        <div className="rounded-2xl border border-adm-danger-border bg-adm-danger-bg/60 p-5 shadow-subtle space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-adm-danger">
            Danger Zone
          </h2>
          <button
            type="button"
            onClick={onDeleteProduct}
            disabled={isDeleting}
            className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-adm-danger-border bg-adm-surface text-xs font-semibold text-adm-danger hover:bg-adm-danger hover:text-adm-danger-fg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            {isDeleting ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      )}
    </div>
  )
}
