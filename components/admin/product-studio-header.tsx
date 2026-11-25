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
    <div className="sticky top-0 z-30 -mt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-4 bg-adm-bg/95 backdrop-blur-md border-b border-adm-border transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-xs text-adm-muted">
            <Link
              href="/admin/products"
              className="hover:text-adm-fg transition-colors flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Products
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-adm-fg font-semibold truncate max-w-[200px]">
              {mode === 'create' ? 'New Product' : product?.name}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="admin-section-title sm:text-2xl font-bold text-adm-fg tracking-tight truncate max-w-md">
              {mode === 'create' ? 'Create Product' : product?.name}
            </h1>

            {mode === 'edit' && (
              <>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${
                    formData.active
                      ? 'bg-adm-success-bg text-adm-success border-adm-success-border'
                      : 'bg-adm-surface-2 text-adm-muted border-adm-border'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      formData.active ? 'bg-adm-success' : 'bg-adm-muted'
                    }`}
                    aria-hidden="true"
                  />
                  {formData.active ? 'Published' : 'Draft'}
                </span>

                {formData.featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-adm-warning-bg text-adm-warning border border-adm-warning-border">
                    <Star className="h-3 w-3 fill-adm-warning text-adm-warning" aria-hidden="true" />
                    Featured
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          {mode === 'edit' && product?.active && (
            <a
              href={`/products/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-adm-border bg-adm-surface px-3.5 py-2 text-xs font-semibold text-adm-fg hover:bg-adm-surface-2 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-adm-muted" aria-hidden="true" />
              <span className="hidden md:inline">View Store</span>
            </a>
          )}

          {isDirty || mode === 'create' ? (
            <div className="flex items-center gap-2 animate-fade-in">
              <button
                type="button"
                onClick={mode === 'create' ? onCancelCreate : onDiscard}
                className="min-h-[42px] rounded-xl border border-adm-border bg-adm-surface px-4 py-2 text-xs font-semibold text-adm-fg-2 hover:bg-adm-surface-2 hover:text-adm-fg transition-colors cursor-pointer"
              >
                {mode === 'create' ? 'Cancel' : 'Discard'}
              </button>
              <button
                id="product-form-submit"
                type={mode === 'create' ? 'submit' : 'button'}
                onClick={mode === 'edit' ? onUnifiedSave : undefined}
                disabled={isPending || isSaving}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-adm-accent px-5 py-2 text-xs font-semibold text-adm-accent-fg hover:bg-adm-accent-hover shadow-elevation-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending || isSaving ? (
                  <>
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-adm-accent-fg border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-adm-muted font-medium py-2 px-2">
              <Check className="h-3.5 w-3.5 text-adm-success" aria-hidden="true" />
              <span>Saved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
