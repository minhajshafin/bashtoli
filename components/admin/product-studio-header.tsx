'use client'

import Link from 'next/link'
import { ArrowLeft, ExternalLink, Star, Check } from 'lucide-react'
import type { Database } from '@/lib/supabase/database.types'

type ProductRow = Database['public']['Tables']['products']['Row']

export interface ProductFormValues {
  name: string
  slug: string
  description: string
  category_id: string
  base_price: string
  active: boolean
  featured: boolean
  initial_stock_qty: string
}

interface ProductStudioHeaderProps {
  mode: 'create' | 'edit'
  product?: ProductRow
  formData: ProductFormValues
  isDirty: boolean
  isPending: boolean
  isSaving: boolean
  submitLabel: string
  onCancelCreate: () => void
  onDiscard: () => void
  onUnifiedSave: () => void
}

export function ProductStudioHeader({
  mode,
  product,
  formData,
  isDirty,
  isPending,
  isSaving,
  submitLabel,
  onCancelCreate,
  onDiscard,
  onUnifiedSave,
}: ProductStudioHeaderProps) {
  return (
    <div className="sticky top-0 z-30 -mt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-3.5 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Breadcrumbs + Product Name + Badges */}
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link
              href="/admin/products"
              className="hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 truncate max-w-[200px]">
              {mode === 'create' ? 'New Product' : product?.name}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate max-w-md">
              {mode === 'create' ? 'Create Product' : product?.name}
            </h1>

            {mode === 'edit' && (
              <>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors ${
                    formData.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      formData.active ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  {formData.active ? 'Published' : 'Draft'}
                </span>

                {formData.featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                    Featured
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: Dynamic Save / Cancel Action Group */}
        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          {mode === 'edit' && product?.active && (
            <a
              href={`/products/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden md:inline">View in Store</span>
            </a>
          )}

          {/* Contextual Action Group: Appears when changes are made, or always on create */}
          {isDirty || mode === 'create' ? (
            <div className="flex items-center gap-2 animate-fade-in">
              <button
                type="button"
                onClick={mode === 'create' ? onCancelCreate : onDiscard}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-xs transition-colors cursor-pointer"
              >
                {mode === 'create' ? 'Cancel' : 'Discard'}
              </button>
              <button
                id="product-form-submit"
                type={mode === 'create' ? 'submit' : 'button'}
                onClick={mode === 'edit' ? onUnifiedSave : undefined}
                disabled={isPending || isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending || isSaving ? (
                  <>
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium py-2 px-2">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>All changes saved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
