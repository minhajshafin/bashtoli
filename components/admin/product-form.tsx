'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ExternalLink,
  Star,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductActionState,
} from '@/lib/actions/products'
import { slugify } from '@/lib/validations/category'
import { useAdminConfirm } from '@/components/admin/admin-confirm-dialog'
import { useToast } from '@/components/ui/toast'
import type { Database } from '@/lib/supabase/database.types'

type CategoryRow = Database['public']['Tables']['categories']['Row']
type ProductRow = Database['public']['Tables']['products']['Row']

const initialState: ProductActionState = { error: null }

export function ProductForm({
  mode,
  product,
  categories,
  children,
}: {
  mode: 'create' | 'edit'
  product?: ProductRow
  categories: CategoryRow[]
  children?: React.ReactNode
}) {
  const router = useRouter()
  const { toast } = useToast()
  const confirm = useAdminConfirm()
  const action = mode === 'create' ? createProduct : updateProduct
  const [state, formAction, isPending] = useActionState(action, initialState)

  const initialValues = {
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    category_id: product?.category_id ?? '',
    base_price:
      product?.base_price !== undefined && product?.base_price !== null
        ? String(product.base_price)
        : '',
    active: product?.active ?? false,
    featured: product?.featured ?? false,
  }

  const [formData, setFormData] = useState(initialValues)
  const [isDeleting, setIsDeleting] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const submittedRef = useRef(false)

  // Calculate dirty state
  const isDirty =
    mode === 'create'
      ? formData.name.trim().length > 0 || formData.base_price.length > 0
      : formData.name !== initialValues.name ||
        formData.slug !== initialValues.slug ||
        formData.description !== initialValues.description ||
        formData.category_id !== initialValues.category_id ||
        formData.base_price !== initialValues.base_price ||
        formData.active !== initialValues.active ||
        formData.featured !== initialValues.featured

  // Clean up toast storage on server error
  useEffect(() => {
    if (state.error || state.fieldErrors) {
      try {
        sessionStorage.removeItem('admin_product_toast')
      } catch {
        // Ignore storage errors
      }
    }
  }, [state])

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: mode === 'create' && !slugManuallyEdited ? slugify(val) : prev.slug,
    }))
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManuallyEdited(true)
    setFormData((prev) => ({ ...prev, slug: e.target.value }))
  }

  function handleDiscard() {
    setFormData(initialValues)
    setSlugManuallyEdited(false)
  }

  function handleSubmit() {
    submittedRef.current = true
    try {
      sessionStorage.setItem(
        'admin_product_toast',
        mode === 'create'
          ? 'Product created successfully.'
          : 'Product updated successfully.'
      )
    } catch {
      // Ignore storage errors
    }
  }

  async function handleDeleteProduct() {
    if (!product) return

    const ok = await confirm({
      title: `Delete product "${product.name}"?`,
      description:
        'This action is protected. If this product has existing customer orders, the deletion will be safely blocked to preserve financial history. Otherwise, it will be soft-deleted from the store catalog.',
      confirmText: 'Delete Product',
      cancelText: 'Keep Product',
      variant: 'danger',
    })

    if (!ok) return

    setIsDeleting(true)
    const res = await deleteProduct(product.id)
    if (res.error) {
      toast(res.error, 'error')
      setIsDeleting(false)
    } else {
      toast('Product deleted successfully.', 'success')
      router.push('/admin/products')
      router.refresh()
    }
  }

  const submitLabel = mode === 'create' ? 'Create Product' : 'Save Changes'

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-8">
      {mode === 'edit' && product && (
        <input type="hidden" name="id" value={product.id} />
      )}

      {/* Sticky Header Bar */}
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
                  onClick={
                    mode === 'create'
                      ? () => router.push('/admin/products')
                      : handleDiscard
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-xs transition-colors cursor-pointer"
                >
                  {mode === 'create' ? 'Cancel' : 'Discard'}
                </button>
                <button
                  id="product-form-submit"
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending ? (
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

      {/* Main 2-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
        {/* Left Column (2/3): General Info + Children (Media & Variants) */}
        <div className="lg:col-span-2 space-y-8 min-w-0">
          {/* Error Banner */}
          {state.error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-xs"
            >
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">{state.error}</p>
                {state.fieldErrors && (
                  <ul className="list-disc list-inside text-xs space-y-0.5 text-rose-600">
                    {Object.entries(state.fieldErrors).map(([field, msgs]) => (
                      <li key={field}>
                        <span className="capitalize">{field.replace('_', ' ')}</span>:{' '}
                        {msgs?.join(', ')}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* General Information Card */}
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
                onChange={handleNameChange}
                placeholder="e.g. Fine Bamboo Notebook"
                className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              />
              {state.fieldErrors?.name && (
                <p className="text-xs text-rose-600 font-medium">
                  {state.fieldErrors.name[0]}
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
                  onChange={handleSlugChange}
                  placeholder="fine-bamboo-notebook"
                  className="block w-full px-3 py-2 text-sm font-mono text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Used for customer product links. Unique lowercase letters and hyphens.
              </p>
              {state.fieldErrors?.slug && (
                <p className="text-xs text-rose-600 font-medium">
                  {state.fieldErrors.slug[0]}
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe product materials, specifications, paper weight, binding, craftsmanship..."
                className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors leading-relaxed"
              />
              {state.fieldErrors?.description && (
                <p className="text-xs text-rose-600 font-medium">
                  {state.fieldErrors.description[0]}
                </p>
              )}
            </div>
          </div>

          {/* Children Slot: Media & Image Gallery, Options & Variant Table */}
          {children}
        </div>

        {/* Right Column (1/3): Sidebar */}
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, active: e.target.checked }))
                  }
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Base Price</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Default selling price in Bangladeshi Taka.
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
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold text-sm select-none">
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
                  value={formData.base_price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, base_price: e.target.value }))
                  }
                  placeholder="450"
                  className="block w-full rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Default price for standard items or variants without overrides.
              </p>
              {state.fieldErrors?.base_price && (
                <p className="text-xs text-rose-600 font-medium">
                  {state.fieldErrors.base_price[0]}
                </p>
              )}
            </div>
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category_id: e.target.value }))
                }
                className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white transition-colors"
              >
                <option value="">Uncategorised</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.category_id && (
                <p className="text-xs text-rose-600 font-medium">
                  {state.fieldErrors.category_id[0]}
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
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-300 bg-white text-xs font-bold text-rose-700 hover:bg-rose-50 hover:border-rose-400 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
