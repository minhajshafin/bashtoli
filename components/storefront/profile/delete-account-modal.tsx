'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAccountAction } from '@/lib/actions/profile'
import { useToast } from '@/components/ui/toast'
import { AlertTriangle, Trash2 } from 'lucide-react'

export function DeleteAccountModal() {
  const router = useRouter()
  const { toast } = useToast()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeletePending, startDeleteTransition] = useTransition()

  const handleDeleteSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setDeleteError(null)
    const formData = new FormData()
    formData.append('confirmation', deleteConfirmation)

    startDeleteTransition(async () => {
      const res = await deleteAccountAction({ error: null }, formData)
      if (res.error) {
        setDeleteError(res.error)
      } else if (res.success) {
        toast('Your account has been deleted successfully.', 'info')
        router.push('/')
      }
    })
  }

  return (
    <>
      {/* Danger Zone Trigger Card */}
      <div className="rounded-2xl border border-terracotta-300/80 bg-cream-50 p-5 sm:p-7 shadow-md text-forest-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-terracotta-100 text-terracotta-700 border border-terracotta-300/80 shadow-2xs">
              <AlertTriangle className="h-5 w-5 stroke-[1.8]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-terracotta-800 tracking-tight font-sans">
                Danger Zone
              </h2>
              <p className="text-xs sm:text-[13px] text-forest-700 mt-1 max-w-xl font-sans leading-relaxed">
                Permanently delete your account and all associated profile details. Past order invoices are preserved securely in store records.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteConfirmation('')
              setDeleteError(null)
              setIsDeleteModalOpen(true)
            }}
            className="btn-danger shrink-0 w-full sm:w-auto inline-flex h-12 sm:h-10 items-center justify-center gap-1.5 rounded-xl px-5 text-xs sm:text-sm font-sans font-semibold active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-forest-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeletePending && setIsDeleteModalOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-forest-200/90 bg-cream-50 p-6 sm:p-8 shadow-2xl animate-fade-in z-10 space-y-6 text-forest-950">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-terracotta-100 text-terracotta-700 border border-terracotta-300/80 shadow-2xs">
                <Trash2 className="h-6 w-6 stroke-[1.8]" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-base sm:text-lg font-medium text-forest-950 font-display">
                  Delete Account Permanently?
                </h3>
                <p className="text-xs text-forest-600 font-sans">
                  This action is permanent and cannot be reversed.
                </p>
              </div>
            </div>

            <div className="space-y-2 rounded-xl bg-cream-100/80 p-4 text-xs text-forest-800 border border-forest-200/80 font-sans">
              <p className="font-semibold text-forest-950">
                What will happen:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-forest-700 leading-relaxed">
                <li>Your login credentials, profile data, and saved addresses will be deleted.</li>
                <li>Your bag and wishlist items will be cleared.</li>
                <li>Store bookkeeping preserves past invoices without personal identification.</li>
              </ul>
            </div>

            {deleteError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl bg-terracotta-100 border border-terracotta-400/40 p-3.5 text-xs font-semibold text-terracotta-800 font-sans"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-terracotta-600" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="deleteConfirmation"
                  className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-forest-700"
                >
                  Type <span className="font-mono font-black text-terracotta-600 select-all">DELETE</span> to confirm:
                </label>
                <input
                  id="deleteConfirmation"
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  disabled={isDeletePending}
                  placeholder="DELETE"
                  className="block w-full h-12 rounded-xl border border-forest-200/90 bg-white px-4 text-sm font-mono font-bold text-forest-950 placeholder:text-forest-400 focus:border-terracotta-500 focus:outline-hidden focus:ring-2 focus:ring-terracotta-500/20 transition-all tracking-wider shadow-2xs"
                  autoComplete="off"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setDeleteConfirmation('')
                    setDeleteError(null)
                  }}
                  disabled={isDeletePending}
                  className="inline-flex h-12 sm:h-11 items-center justify-center rounded-xl border border-forest-200/90 bg-white px-5 text-xs sm:text-sm font-sans font-semibold text-forest-700 hover:text-forest-950 hover:bg-cream-100 disabled:opacity-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmation !== 'DELETE' || isDeletePending}
                  className="btn-danger inline-flex h-12 sm:h-11 items-center justify-center rounded-xl px-6 text-xs sm:text-sm font-sans font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer shadow-md"
                >
                  {isDeletePending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Deleting Account...</span>
                    </div>
                  ) : (
                    'Permanently Delete Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
