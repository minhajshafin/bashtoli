'use client'

import type { ProductActionState } from '@/lib/actions/products'
import type { ProductFormValues } from './product-studio-header'

interface ProductGeneralCardProps {
  formData: ProductFormValues
  activeFieldErrors?: ProductActionState['fieldErrors']
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSlugChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDescriptionChange: (value: string) => void
}

export function ProductGeneralCard({
  formData,
  activeFieldErrors,
  onNameChange,
  onSlugChange,
  onDescriptionChange,
}: ProductGeneralCardProps) {
  return (
    <div className="rounded-2xl border border-adm-border bg-adm-surface p-6 shadow-subtle space-y-5">
      <h2 className="admin-section-title text-adm-fg">General</h2>

      {/* Name */}
      <div className="space-y-1.5">
        <label htmlFor="product-name" className="block text-xs font-semibold text-adm-fg-2">
          Product Name <span className="text-adm-danger">*</span>
        </label>
        <input
          id="product-name"
          name="name"
          type="text"
          required
          maxLength={150}
          value={formData.name}
          onChange={onNameChange}
          placeholder="e.g. Fine Bamboo Notebook"
          className="block w-full min-h-[44px] rounded-xl border border-adm-input-border bg-adm-surface px-3.5 py-2.5 text-sm text-adm-fg placeholder:text-adm-muted focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1 transition-colors"
        />
        {activeFieldErrors?.name && (
          <p className="text-xs text-adm-danger font-medium">
            {activeFieldErrors.name[0]}
          </p>
        )}
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <label htmlFor="product-slug" className="block text-xs font-semibold text-adm-fg-2">
          URL Slug <span className="text-adm-danger">*</span>
        </label>
        <div className="flex rounded-xl border border-adm-input-border overflow-hidden focus-within:outline-2 focus-within:outline-adm-accent focus-within:outline-offset-1 bg-adm-surface">
          <span className="inline-flex items-center px-3.5 font-mono text-xs text-adm-muted bg-adm-surface-2 border-r border-adm-border select-none">
            /products/
          </span>
          <input
            id="product-slug"
            name="slug"
            type="text"
            required
            maxLength={150}
            value={formData.slug}
            onChange={onSlugChange}
            placeholder="fine-bamboo-notebook"
            className="block w-full min-h-[44px] px-3.5 py-2 text-sm font-mono text-adm-fg bg-adm-surface placeholder:text-adm-muted outline-none"
          />
        </div>
        {activeFieldErrors?.slug && (
          <p className="text-xs text-adm-danger font-medium">
            {activeFieldErrors.slug[0]}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor="product-description" className="block text-xs font-semibold text-adm-fg-2">
            Description
          </label>
          <span className="font-mono text-[11px] text-adm-muted tabular-nums">
            {formData.description.length}/1000
          </span>
        </div>
        <textarea
          id="product-description"
          name="description"
          rows={5}
          maxLength={1000}
          value={formData.description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe materials, paper weight, or dimensions..."
          className="block w-full rounded-xl border border-adm-input-border bg-adm-surface px-3.5 py-2.5 text-sm text-adm-fg placeholder:text-adm-muted focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1 transition-colors leading-relaxed"
        />
        {activeFieldErrors?.description && (
          <p className="text-xs text-adm-danger font-medium">
            {activeFieldErrors.description[0]}
          </p>
        )}
      </div>
    </div>
  )
}
