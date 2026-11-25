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
    <div className="rounded-2xl border border-paper-300 bg-paper-50 p-6 shadow-subtle space-y-5">
      <div>
        <p className="admin-kicker text-ink-500 mb-1">Core Specification</p>
        <h2 className="admin-section-title text-ink-950">General Information</h2>
        <p className="text-xs text-ink-600 mt-1">
          Configure the product title, storefront slug, and description.
        </p>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="product-name"
          className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700"
        >
          Product Name <span className="text-signal-danger">*</span>
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
          className="block w-full min-h-[44px] rounded-xl border border-ink-400/80 bg-paper-50 px-3.5 py-2.5 text-sm text-ink-950 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1 transition-colors"
        />
        {activeFieldErrors?.name && (
          <p className="text-xs text-signal-danger font-medium">
            {activeFieldErrors.name[0]}
          </p>
        )}
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <label
          htmlFor="product-slug"
          className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700"
        >
          Slug / URL Handle <span className="text-signal-danger">*</span>
        </label>
        <div className="flex rounded-xl border border-ink-400/80 overflow-hidden focus-within:outline-2 focus-within:outline-ink-950 focus-within:outline-offset-1 bg-paper-50">
          <span className="inline-flex items-center px-3.5 font-mono text-xs text-ink-600 bg-paper-200 border-r border-paper-300 select-none">
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
            aria-describedby="product-slug-help"
            className="block w-full min-h-[44px] px-3.5 py-2 text-sm font-mono text-ink-950 bg-paper-50 placeholder:text-ink-500 outline-none"
          />
        </div>
        <p id="product-slug-help" className="text-xs text-ink-600">
          Used for customer product links. Unique lowercase letters and hyphens.
        </p>
        {activeFieldErrors?.slug && (
          <p className="text-xs text-signal-danger font-medium">
            {activeFieldErrors.slug[0]}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label
            htmlFor="product-description"
            className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700"
          >
            Description
          </label>
          <span className="font-mono text-[11px] text-ink-500 tabular-nums">
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
          placeholder="Describe product materials, specifications, paper weight, binding, craftsmanship..."
          className="block w-full rounded-xl border border-ink-400/80 bg-paper-50 px-3.5 py-2.5 text-sm text-ink-950 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1 transition-colors leading-relaxed"
        />
        {activeFieldErrors?.description && (
          <p className="text-xs text-signal-danger font-medium">
            {activeFieldErrors.description[0]}
          </p>
        )}
      </div>
    </div>
  )
}
