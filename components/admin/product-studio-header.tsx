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
    <div className="sticky top-0 z-30 -mt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-4 bg-paper-100/95 backdrop-blur-md border-b border-paper-300 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Breadcrumbs + Product Name + Badges */}
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink-500">
            <Link
              href="/admin/products"
              className="hover:text-ink-950 transition-colors flex items-center gap-1.5 font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to Products
            </Link>
            <span className="text-ink-400" aria-hidden="true">/</span>
            <span className="text-ink-900 font-bold truncate max-w-[200px]">
              {mode === 'create' ? 'New Product' : product?.name}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="admin-section-title sm:text-2xl font-extrabold text-ink-950 tracking-tight truncate max-w-md">
              {mode === 'create' ? 'Create Product' : product?.name}
            </h1>

            {mode === 'edit' && (
              <>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border transition-colors ${
                    formData.active
                      ? 'bg-ink-950 text-paper-50 border-ink-950'
                      : 'bg-paper-50 text-ink-700 border-ink-400 border-dashed'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      formData.active ? 'bg-paper-50' : 'bg-ink-500'
                    }`}
                    aria-hidden="true"
                  />
                  {formData.active ? 'Published' : 'Draft'}
                </span>

                {formData.featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-paper-200 text-ink-950 border border-ink-400/60">
                    <Star className="h-3 w-3 fill-ink-950 text-ink-950" aria-hidden="true" />
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
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-ink-400/70 bg-paper-50 px-3.5 py-2 text-xs font-bold text-ink-950 hover:bg-paper-200 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-ink-600" aria-hidden="true" />
              <span className="hidden md:inline">View in Store</span>
            </a>
          )}

          {isDirty || mode === 'create' ? (
            <div className="flex items-center gap-2 animate-fade-in">
              <button
                type="button"
                onClick={mode === 'create' ? onCancelCreate : onDiscard}
                className="min-h-[44px] rounded-xl border border-ink-400/70 bg-paper-50 px-4 py-2 text-xs font-bold text-ink-900 hover:bg-paper-200 transition-colors cursor-pointer"
              >
                {mode === 'create' ? 'Cancel' : 'Discard'}
              </button>
              <button
                id="product-form-submit"
                type={mode === 'create' ? 'submit' : 'button'}
                onClick={mode === 'edit' ? onUnifiedSave : undefined}
                disabled={isPending || isSaving}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-ink-950 px-5 py-2 text-xs font-bold text-paper-50 hover:bg-ink-800 shadow-elevation-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending || isSaving ? (
                  <>
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-paper-50 border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-xs text-ink-600 font-medium py-2 px-2">
              <Check className="h-3.5 w-3.5 text-ink-950" aria-hidden="true" />
              <span>All changes saved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
