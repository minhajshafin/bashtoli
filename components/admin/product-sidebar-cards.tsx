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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Visibility & Status</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Control product availability on the storefront.
          </p>
        </div>

        {/* Published Switch */}
        <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 transition-colors hover:bg-slate-50">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800">Publish to Store</span>
            <p className="text-[11px] text-slate-500">
              {formData.active
                ? 'Visible and purchasable by customers'
                : 'Hidden from storefront catalog (Draft)'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
            <input
              type="checkbox"
              id="product-active"
              name="active"
              checked={formData.active}
              onChange={(e) => onFieldChange('active', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Featured Switch */}
        <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 transition-colors hover:bg-slate-50">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800">Featured Product</span>
            <p className="text-[11px] text-slate-500">
              Promote on homepage showcase sections
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
            <input
              type="checkbox"
              id="product-featured"
              name="featured"
              checked={formData.featured}
              onChange={(e) => onFieldChange('featured', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>
      </div>

      {/* Pricing & Inventory Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {mode === 'create' ? 'Pricing & Inventory' : 'Base Price'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'create'
              ? 'Set base selling price and starting stock.'
              : 'Default selling price in Bangladeshi Taka.'}
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="product-price"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Price (BDT) <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl border border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all bg-white">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold text-xs select-none">
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
              className="block w-full rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Default price for standard items or variants without overrides.
          </p>
          {activeFieldErrors?.base_price && (
            <p className="text-xs text-rose-600 font-medium">
              {activeFieldErrors.base_price[0]}
            </p>
          )}
        </div>

        {mode === 'create' && (
          <div className="space-y-1.5 pt-3 border-t border-slate-100">
            <label
              htmlFor="product-initial-stock"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
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
              className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
            />
            <p className="text-[11px] text-slate-400">
              Starting inventory count. You can configure multi-option variants (Size, Color) and individual stock levels in the studio right after creating.
            </p>
            {activeFieldErrors?.initial_stock_qty && (
              <p className="text-xs text-rose-600 font-medium">
                {activeFieldErrors.initial_stock_qty[0]}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Organization Card (Category) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Organization</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Categorize this item for storefront browsing.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="product-category"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Category
          </label>
          <select
            id="product-category"
            name="category_id"
            value={formData.category_id}
            onChange={(e) => onFieldChange('category_id', e.target.value)}
            className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white transition-colors"
          >
            <option value="">Uncategorised</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {activeFieldErrors?.category_id && (
            <p className="text-xs text-rose-600 font-medium">
              {activeFieldErrors.category_id[0]}
            </p>
          )}
        </div>
      </div>

      {/* Danger Zone in Edit Mode */}
      {mode === 'edit' && product && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-xs space-y-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Danger Zone
            </h2>
            <p className="text-xs text-rose-600 mt-0.5">
              Permanently remove or soft-delete this product.
            </p>
          </div>
          <button
            type="button"
            onClick={onDeleteProduct}
            disabled={isDeleting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-300 bg-white text-xs font-bold text-rose-700 hover:bg-rose-50 hover:border-rose-400 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            {isDeleting ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      )}
    </div>
  )
}
