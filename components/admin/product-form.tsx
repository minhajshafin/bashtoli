'use client'

import { useActionState, useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import {
  createProduct,
  updateProduct,
  type ProductActionState,
} from '@/lib/actions/products'
import { deleteProduct } from '@/lib/actions/product-delete'
import { slugify } from '@/lib/validations/category'
import { useAdminConfirm } from '@/components/admin/admin-confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { ProductStudioContext } from '@/components/admin/product-studio-context'
import {
  ProductStudioHeader,
  type ProductFormValues,
} from '@/components/admin/product-studio-header'
import { ProductGeneralCard } from '@/components/admin/product-general-card'
import { ProductSidebarCards } from '@/components/admin/product-sidebar-cards'
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
  const formRef = useRef<HTMLFormElement>(null)

  const [state, formAction, isPending] = useActionState(
    mode === 'create' ? createProduct : async () => initialState,
    initialState
  )

  const initialValues: ProductFormValues = {
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
    initial_stock_qty: '0',
  }

  const [baselineValues, setBaselineValues] = useState(initialValues)
  const [formData, setFormData] = useState(initialValues)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [serverState, setServerState] = useState<ProductActionState>(initialState)
  const [hasVariantChanges, setHasVariantChanges] = useState(false)
  const [resetSignal, setResetSignal] = useState(0)

  const variantSaveHandlerRef = useRef<(() => Promise<boolean>) | null>(null)
  const registerVariantSaveHandler = useCallback(
    (handler: () => Promise<boolean>) => {
      variantSaveHandlerRef.current = handler
    },
    []
  )

  const isProductDirty =
    mode === 'create'
      ? formData.name.trim().length > 0 || formData.base_price.length > 0
      : formData.name !== baselineValues.name ||
        formData.slug !== baselineValues.slug ||
        formData.description !== baselineValues.description ||
        formData.category_id !== baselineValues.category_id ||
        formData.base_price !== baselineValues.base_price ||
        formData.active !== baselineValues.active ||
        formData.featured !== baselineValues.featured

  const isDirty = mode === 'create' ? isProductDirty : isProductDirty || hasVariantChanges

  const activeError = mode === 'create' ? state.error : serverState.error
  const activeFieldErrors =
    mode === 'create' ? state.fieldErrors : serverState.fieldErrors

  useEffect(() => {
    try {
      const msg = sessionStorage.getItem('admin_product_toast')
      if (msg) {
        sessionStorage.removeItem('admin_product_toast')
        toast(msg, 'success')
      }
    } catch {
      // Ignore storage errors
    }
  }, [toast])

  useEffect(() => {
    if (activeError || activeFieldErrors) {
      try {
        sessionStorage.removeItem('admin_product_toast')
      } catch {
        // Ignore storage errors
      }
    }
  }, [activeError, activeFieldErrors])

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

  function handleFieldChange<K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleDiscard() {
    setFormData(baselineValues)
    setSlugManuallyEdited(false)
    setServerState(initialState)
    setResetSignal((prev) => prev + 1)
    setHasVariantChanges(false)
  }

  function handleSubmit() {
    try {
      sessionStorage.setItem(
        'admin_product_toast',
        'Product created successfully! You can now add images, manage options, and adjust variants.'
      )
    } catch {
      // Ignore storage errors
    }
  }

  async function handleUnifiedSave(e?: React.FormEvent) {
    if (e) e.preventDefault()

    if (mode === 'create') {
      formRef.current?.requestSubmit()
      return
    }

    setIsSaving(true)
    let variantSuccess = true
    let productSuccess = true

    if (hasVariantChanges && variantSaveHandlerRef.current) {
      variantSuccess = await variantSaveHandlerRef.current()
    }

    if (isProductDirty && product) {
      const fd = new FormData()
      fd.set('id', product.id)
      fd.set('name', formData.name)
      fd.set('slug', formData.slug)
      fd.set('description', formData.description)
      fd.set('category_id', formData.category_id)
      fd.set('base_price', formData.base_price)
      if (formData.active) fd.set('active', 'on')
      if (formData.featured) fd.set('featured', 'on')

      const res = await updateProduct({ error: null }, fd)
      if (res.error || res.fieldErrors) {
        productSuccess = false
        setServerState(res)
      } else {
        setBaselineValues(formData)
        setServerState(initialState)
      }
    }

    setIsSaving(false)

    if (variantSuccess && productSuccess) {
      if (isProductDirty && hasVariantChanges) {
        toast('Product and variants updated successfully.', 'success')
      } else if (isProductDirty) {
        toast('Product details updated successfully.', 'success')
      } else if (hasVariantChanges) {
        toast('Variants updated successfully.', 'success')
      }
      router.refresh()
    } else if (!productSuccess) {
      toast('Failed to save product details. Please check the errors.', 'error')
    } else if (!variantSuccess) {
      toast('Failed to save variant changes.', 'error')
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
    <ProductStudioContext.Provider
      value={{
        hasVariantChanges,
        setHasVariantChanges,
        registerVariantSaveHandler,
        resetSignal,
      }}
    >
      <form
        ref={formRef}
        action={mode === 'create' ? formAction : undefined}
        onSubmit={mode === 'edit' ? handleUnifiedSave : handleSubmit}
        className="space-y-8"
      >
        {mode === 'edit' && product && (
          <input type="hidden" name="id" value={product.id} />
        )}

        <ProductStudioHeader
          mode={mode}
          product={product}
          formData={formData}
          isDirty={isDirty}
          isPending={isPending}
          isSaving={isSaving}
          submitLabel={submitLabel}
          onCancelCreate={() => router.push('/admin/products')}
          onDiscard={handleDiscard}
          onUnifiedSave={() => handleUnifiedSave()}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
          <div className="lg:col-span-2 space-y-8 min-w-0">
            {activeError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-xs"
              >
                <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">{activeError}</p>
                  {activeFieldErrors && (
                    <ul className="list-disc list-inside text-xs space-y-0.5 text-rose-600">
                      {Object.entries(activeFieldErrors).map(([field, msgs]) => (
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

            <ProductGeneralCard
              formData={formData}
              activeFieldErrors={activeFieldErrors}
              onNameChange={handleNameChange}
              onSlugChange={handleSlugChange}
              onDescriptionChange={(val) => handleFieldChange('description', val)}
            />

            <div key={resetSignal} className="space-y-8">
              {children}
            </div>
          </div>

          <ProductSidebarCards
            mode={mode}
            product={product}
            categories={categories}
            formData={formData}
            activeFieldErrors={activeFieldErrors}
            isDeleting={isDeleting}
            onFieldChange={handleFieldChange}
            onDeleteProduct={handleDeleteProduct}
          />
        </div>
      </form>
    </ProductStudioContext.Provider>
  )
}
