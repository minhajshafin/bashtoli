'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { addProductImage } from '@/lib/actions/product-images'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 2
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export function ImageUploader({
  productId,
}: {
  productId: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Validate file types and size constraints in client-side JS
  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type "${file.name}". Only JPEG, PNG, and WebP images are allowed.`
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File "${file.name}" is too large. Maximum allowed size is ${MAX_SIZE_MB} MB.`
    }
    return null
  }

  async function uploadFile(file: File) {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const cleanFileName = file.name
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 30)
      const filePath = `${productId}/${Date.now()}_${cleanFileName}.${fileExt}`

      // Upload file directly to Supabase storage bucket
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      const url = publicUrlData.publicUrl

      // Register image URL in product_images database table via Server Action
      const dbResult = await addProductImage(productId, url)

      if (dbResult.error) {
        throw new Error(dbResult.error)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during upload.'
      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      // Process files sequentially
      for (const file of files) {
        await uploadFile(file)
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
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">Upload Product Images</h2>
        <p className="text-xs text-slate-500">
          Add photos of your product. Recommended: 1200×1200 WebP/JPEG, max 2 MB.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-indigo-600 bg-indigo-50/50'
            : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50/50'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <svg
              className="h-8 w-8 animate-spin text-indigo-600"
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
            <p className="text-sm font-semibold text-slate-700">
              Uploading image, please wait...
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-slate-400"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Drag and drop your images here, or{' '}
              <span className="text-indigo-600 hover:text-indigo-700">browse</span>
            </p>
            <p className="text-xs text-slate-400">
              JPEG, PNG, WebP up to {MAX_SIZE_MB}MB
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
