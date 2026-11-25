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
      {/* Status & Visibility Card */}
      <div className="rounded-2xl border border-paper-300 bg-paper-50 p-5 shadow-subtle space-y-4">
        <div>
          <p className="admin-kicker text-ink-500 mb-0.5">Distribution</p>
          <h2 className="text-sm font-bold text-ink-950">Visibility &amp; Status</h2>
          <p className="text-xs text-ink-600 mt-0.5">
            Control product availability on the storefront.
          </p>
        </div>

        {/* Published Switch */}
        <label
          htmlFor="product-active"
          className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-paper-300 bg-paper-100/80 transition-colors hover:bg-paper-200/70 cursor-pointer"
        >
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-ink-950">Publish to Store</span>
            <p className="text-[11px] text-ink-600">
              {formData.active
                ? 'Visible and purchasable by customers'
                : 'Hidden from storefront catalog (Draft)'}
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
            <span className="w-10 h-6 bg-paper-300 border border-ink-400/70 rounded-full peer peer-focus-visible:outline-2 peer-focus-visible:outline-ink-950 peer-focus-visible:outline-offset-2 peer-checked:bg-ink-950 peer-checked:border-ink-950 transition-colors relative after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:h-4 after:w-4 after:rounded-full after:bg-paper-50 after:border after:border-ink-400/40 after:transition-transform peer-checked:after:translate-x-4 peer-checked:after:border-paper-50" />
          </span>
        </label>

        {/* Featured Switch */}
        <label
          htmlFor="product-featured"
          className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-paper-300 bg-paper-100/80 transition-colors hover:bg-paper-200/70 cursor-pointer"
        >
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-ink-950">Featured Product</span>
            <p className="text-[11px] text-ink-600">
              Promote on homepage showcase sections
            </p>
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
            <span className="w-10 h-6 bg-paper-300 border border-ink-400/70 rounded-full peer peer-focus-visible:outline-2 peer-focus-visible:outline-ink-950 peer-focus-visible:outline-offset-2 peer-checked:bg-ink-950 peer-checked:border-ink-950 transition-colors relative after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:h-4 after:w-4 after:rounded-full after:bg-paper-50 after:border after:border-ink-400/40 after:transition-transform peer-checked:after:translate-x-4 peer-checked:after:border-paper-50" />
          </span>
        </label>
      </div>

      {/* Pricing & Inventory Card */}
      <div className="rounded-2xl border border-paper-300 bg-paper-50 p-5 shadow-subtle space-y-4">
        <div>
          <p className="admin-kicker text-ink-500 mb-0.5">Valuation</p>
          <h2 className="text-sm font-bold text-ink-950">
            {mode === 'create' ? 'Pricing & Inventory' : 'Base Price'}
          </h2>
          <p className="text-xs text-ink-600 mt-0.5">
            {mode === 'create'
              ? 'Set base selling price and starting stock.'
              : 'Default selling price in Bangladeshi Taka.'}
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="product-price"
            className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700"
          >
            Price (BDT) <span className="text-signal-danger">*</span>
          </label>
          <div className="relative rounded-xl border border-ink-400/80 focus-within:outline-2 focus-within:outline-ink-950 focus-within:outline-offset-1 bg-paper-50">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-600 font-mono font-bold text-xs select-none">
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
              className="block w-full min-h-[44px] rounded-xl pl-9 pr-3.5 py-2.5 font-mono text-sm font-bold text-ink-950 placeholder:text-ink-500 outline-none"
            />
          </div>
          <p className="text-[11px] text-ink-600">
            Default price for standard items or variants without overrides.
          </p>
          {activeFieldErrors?.base_price && (
            <p className="text-xs text-signal-danger font-medium">
              {activeFieldErrors.base_price[0]}
            </p>
          )}
        </div>

        {mode === 'create' && (
          <div className="space-y-1.5 pt-3 border-t border-paper-200">
            <label
              htmlFor="product-initial-stock"
              className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700"
            >
              Initial Stock Quantity
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
              className="block w-full min-h-[44px] rounded-xl border border-ink-400/80 bg-paper-50 px-3.5 py-2.5 font-mono text-sm font-bold text-ink-950 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1 transition-colors"
            />
            <p className="text-[11px] text-ink-600">
              Starting inventory count. Configure multi-option variants in the studio right after creating.
            </p>
            {activeFieldErrors?.initial_stock_qty && (
              <p className="text-xs text-signal-danger font-medium">
                {activeFieldErrors.initial_stock_qty[0]}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Organization Card (Category) */}
      <div className="rounded-2xl border border-paper-300 bg-paper-50 p-5 shadow-subtle space-y-4">
        <div>
          <p className="admin-kicker text-ink-500 mb-0.5">Taxonomy</p>
          <h2 className="text-sm font-bold text-ink-950">Organization</h2>
          <p className="text-xs text-ink-600 mt-0.5">
            Categorize this item for storefront browsing.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="product-category"
            className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700"
          >
            Category
          </label>
          <select
            id="product-category"
            name="category_id"
            value={formData.category_id}
            onChange={(e) => onFieldChange('category_id', e.target.value)}
            className="block w-full min-h-[44px] rounded-xl border border-ink-400/80 px-3.5 py-2.5 text-sm font-medium text-ink-950 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1 bg-paper-50 transition-colors cursor-pointer"
          >
            <option value="">Uncategorised</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {activeFieldErrors?.category_id && (
            <p className="text-xs text-signal-danger font-medium">
              {activeFieldErrors.category_id[0]}
            </p>
          )}
        </div>
      </div>

      {/* Danger Zone in Edit Mode */}
      {mode === 'edit' && product && (
        <div className="rounded-2xl border border-signal-danger-border bg-signal-danger-bg/60 p-5 shadow-subtle space-y-3">
          <div>
            <h2 className="admin-kicker text-signal-danger">Danger Zone</h2>
            <p className="text-xs text-ink-700 mt-1">
              Permanently remove or soft-delete this product.
            </p>
          </div>
          <button
            type="button"
            onClick={onDeleteProduct}
            disabled={isDeleting}
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-signal-danger-border bg-paper-50 text-xs font-bold text-signal-danger hover:bg-signal-danger hover:text-paper-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            {isDeleting ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      )}
    </div>
  )
}
