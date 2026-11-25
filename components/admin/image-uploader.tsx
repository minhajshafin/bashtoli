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
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-ink-950">Upload Product Images</h3>
        <p className="text-xs text-ink-600 mt-0.5">
          Add photos of your product. Recommended: 1200×1200 WebP/JPEG, max {ADMIN_IMAGE_MAX_SIZE_MB} MB.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-signal-danger-border bg-signal-danger-bg px-4 py-3 text-sm font-medium text-signal-danger"
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
          className={`w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            dragActive
              ? 'border-ink-950 bg-paper-200/80'
              : 'border-ink-400/80 bg-paper-100/60 hover:border-ink-950 hover:bg-paper-200/50'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <svg
                className="h-8 w-8 animate-spin text-ink-950"
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
              <span className="text-sm font-semibold text-ink-900">
                Uploading image, please wait...
              </span>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-ink-950 text-paper-50">
                <Upload className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-ink-950">
                Drag and drop your images here, or{' '}
                <span className="underline underline-offset-4">browse files</span>
              </p>
              <p className="font-mono text-xs text-ink-600">
                JPEG, PNG, WebP up to {ADMIN_IMAGE_MAX_SIZE_MB}MB
              </p>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
