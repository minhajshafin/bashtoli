'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteCategory } from '@/lib/actions/categories'
import { useAdminConfirm } from '@/components/admin/admin-confirm-dialog'

export function DeleteCategoryButton({
  id,
  name,
  productCount,
}: {
  id: string
  name: string
  productCount: number
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const confirm = useAdminConfirm()

  const hasProducts = productCount > 0
  const tooltip = hasProducts
    ? `${productCount} product${productCount === 1 ? '' : 's'} — reassign them first`
    : 'Delete category'

  async function handleDeleteClick() {
    if (hasProducts) return

    const ok = await confirm({
      title: `Delete category "${name}"?`,
      description:
        'This action cannot be undone. Categories with associated products cannot be deleted until products are reassigned.',
      confirmText: 'Delete Category',
      cancelText: 'Cancel',
      variant: 'danger',
    })

    if (!ok) return

    startTransition(async () => {
      setError(null)
      const formData = new FormData()
      formData.set('id', id)
      const res = await deleteCategory({ error: null }, formData)
      if (res.error) {
        setError(res.error)
      }
    })
  }

  return (
    <div>
      <button
        id={`delete-category-${id}`}
        type="button"
        onClick={handleDeleteClick}
        disabled={isPending || hasProducts}
        title={tooltip}
        aria-label={`Delete ${name}`}
        className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl border border-transparent text-ink-500 hover:text-signal-danger hover:bg-signal-danger-bg hover:border-signal-danger-border transition-colors disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>

      {error && (
        <p className="mt-1 text-[11px] text-signal-danger text-right max-w-[200px] ml-auto">
          {error}
        </p>
      )}
    </div>
  )
}
