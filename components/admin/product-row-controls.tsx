'use client'

import { useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import {
  toggleProductActive,
  toggleProductFeatured,
} from '@/lib/actions/product-status'
import { deleteProduct } from '@/lib/actions/product-delete'
import { useAdminConfirm } from '@/components/admin/admin-confirm-dialog'
import { useToast } from '@/components/ui/toast'

export function SmartStatusToggle({
  id,
  name,
  active,
}: {
  id: string
  name: string
  active: boolean
}) {
  const { toast } = useToast()
  const [isActive, setIsActive] = useState(active)
  const [isPending, setIsPending] = useState(false)

  async function handleToggle() {
    setIsPending(true)
    const prevVal = isActive
    const nextVal = !isActive
    setIsActive(nextVal)
    const res = await toggleProductActive(id, nextVal)
    if (res.error) {
      toast(res.error, 'error')
      setIsActive(prevVal)
    }
    setIsPending(false)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={`Toggle ${name} status`}
      onClick={handleToggle}
      disabled={isPending}
      title={isActive ? 'Click to set as Draft' : 'Click to publish as Active'}
      className={`group inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold transition-all border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80 hover:border-emerald-300'
          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/80 hover:border-slate-300'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? 'bg-emerald-500' : 'bg-slate-400'
        }`}
      />
      <span>{isActive ? 'Published' : 'Draft'}</span>
    </button>
  )
}

export function FeaturedToggle({
  id,
  name,
  featured,
}: {
  id: string
  name: string
  featured: boolean
}) {
  const { toast } = useToast()
  const [isFeatured, setIsFeatured] = useState(featured)
  const [isPending, setIsPending] = useState(false)

  async function handleToggle() {
    setIsPending(true)
    const prevVal = isFeatured
    const nextVal = !isFeatured
    setIsFeatured(nextVal)
    const res = await toggleProductFeatured(id, nextVal)
    if (res.error) {
      toast(res.error, 'error')
      setIsFeatured(prevVal)
    }
    setIsPending(false)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isFeatured}
      aria-label={`Toggle ${name} featured`}
      onClick={handleToggle}
      disabled={isPending}
      title={isFeatured ? 'Featured product (click to unfeature)' : 'Mark as featured product'}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors border cursor-pointer ${
        isFeatured
          ? 'bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-100'
          : 'bg-white text-slate-300 border-slate-200 hover:text-slate-500 hover:bg-slate-50'
      }`}
    >
      <Star
        className={`h-4 w-4 ${isFeatured ? 'fill-amber-400 text-amber-500' : ''}`}
      />
    </button>
  )
}

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const confirm = useAdminConfirm()

  async function handleDelete() {
    const ok = await confirm({
      title: `Delete product "${name}"?`,
      description:
        'This action is protected. If this product has existing customer orders, the deletion will be safely blocked to preserve financial history. Otherwise, it will be soft-deleted from the store catalog.',
      confirmText: 'Delete Product',
      cancelText: 'Keep Product',
      variant: 'danger',
    })

    if (!ok) return

    setIsPending(true)
    setError(null)
    const res = await deleteProduct(id)
    if (res.error) {
      setError(res.error)
    }
    setIsPending(false)
  }

  return (
    <div className="text-right">
      <button
        id={`delete-product-${id}`}
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        title="Delete product"
        aria-label={`Delete ${name}`}
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {error && (
        <p className="mt-1 text-[11px] text-rose-600 break-words max-w-[180px] ml-auto">
          {error}
        </p>
      )}
    </div>
  )
}
