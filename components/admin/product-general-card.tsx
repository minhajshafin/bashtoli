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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      <div>
        <h2 className="text-base font-bold text-slate-900">General Information</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure the product title, storefront slug, and description.
        </p>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="product-name"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Product Name <span className="text-rose-500">*</span>
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
          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
        />
        {activeFieldErrors?.name && (
          <p className="text-xs text-rose-600 font-medium">
            {activeFieldErrors.name[0]}
          </p>
        )}
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <label
          htmlFor="product-slug"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Slug / URL Handle <span className="text-rose-500">*</span>
        </label>
        <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all bg-white">
          <span className="inline-flex items-center px-3 text-xs text-slate-400 bg-slate-50 border-r border-slate-200 select-none">
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
            className="block w-full px-3 py-2 text-sm font-mono text-slate-900 placeholder-slate-400 outline-none"
          />
        </div>
        <p className="text-[11px] text-slate-400">
          Used for customer product links. Unique lowercase letters and hyphens.
        </p>
        {activeFieldErrors?.slug && (
          <p className="text-xs text-rose-600 font-medium">
            {activeFieldErrors.slug[0]}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label
            htmlFor="product-description"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Description
          </label>
          <span className="text-[11px] text-slate-400">
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
          className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors leading-relaxed"
        />
        {activeFieldErrors?.description && (
          <p className="text-xs text-rose-600 font-medium">
            {activeFieldErrors.description[0]}
          </p>
        )}
      </div>
    </div>
  )
}
