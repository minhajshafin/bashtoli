'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'
import { addProductImage } from '@/lib/actions/product-images'
import {
  ADMIN_IMAGE_MAX_SIZE_MB,
  uploadAdminImageFile,
} from '@/lib/utils/admin-upload'

export function ImageUploader({
  productId,
}: {
  productId: string
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  async function uploadFile(file: File) {
    setIsUploading(true)
    setError(null)

    try {
      const url = await uploadAdminImageFile({
        folder: productId,
        file,
      })

      const dbResult = await addProductImage(productId, url)

      if (dbResult.error) {
        throw new Error(dbResult.error)
      }

      router.refresh()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred during upload.'
      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      for (const file of files) {
        await uploadFile(file)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      for (const file of files) {
        await uploadFile(file)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-adm-fg-2">Upload Images</h3>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-adm-danger-border bg-adm-danger-bg px-4 py-3 text-sm font-medium text-adm-danger"
        >
          {error}
        </div>
      )}

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className="w-full"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            dragActive
              ? 'border-adm-accent bg-adm-accent-tint/50'
              : 'border-adm-input-border/70 bg-adm-surface-2/40 hover:border-adm-accent hover:bg-adm-surface-2/80'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <svg
                className="h-7 w-7 animate-spin text-adm-accent"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span className="text-sm font-medium text-adm-fg">
                Uploading...
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-adm-accent-tint border border-adm-accent-border text-adm-accent-text">
                <Upload className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-adm-fg">
                Drop images or <span className="text-adm-accent-text underline underline-offset-4">browse</span>
              </p>
              <p className="font-mono text-xs text-adm-muted">
                JPEG, PNG, WebP up to {ADMIN_IMAGE_MAX_SIZE_MB}MB
              </p>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
