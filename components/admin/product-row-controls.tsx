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
      className={`group inline-flex min-h-[36px] items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] font-bold transition-colors border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-ink-950 text-paper-50 border-ink-950 hover:bg-ink-800'
          : 'bg-paper-50 text-ink-700 border-ink-400 border-dashed hover:bg-paper-200 hover:text-ink-950'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? 'bg-paper-50' : 'bg-ink-500'
        }`}
        aria-hidden="true"
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
      className={`inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl transition-colors border cursor-pointer ${
        isFeatured
          ? 'bg-ink-950 text-paper-50 border-ink-950 hover:bg-ink-800'
          : 'bg-paper-50 text-ink-400 border-paper-300 hover:text-ink-950 hover:border-ink-950'
      }`}
    >
      <Star
        className={`h-4 w-4 ${isFeatured ? 'fill-paper-50 text-paper-50' : ''}`}
        aria-hidden="true"
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
        className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl border border-transparent text-ink-500 hover:text-signal-danger hover:bg-signal-danger-bg hover:border-signal-danger-border transition-colors disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
      {error && (
        <p className="mt-1 text-[11px] text-signal-danger break-words max-w-[180px] ml-auto">
          {error}
        </p>
      )}
    </div>
  )
}
