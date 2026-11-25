import { createClient } from '@/lib/supabase/client'

export const ADMIN_IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const ADMIN_IMAGE_MAX_SIZE_MB = 5
export const ADMIN_IMAGE_MAX_SIZE_BYTES = ADMIN_IMAGE_MAX_SIZE_MB * 1024 * 1024

/**
 * Validates image MIME type and byte size before uploading to Supabase Storage.
 * Returns a human-readable error string or null when valid.
 */
export function validateAdminImageFile(file: File): string | null {
  if (!ADMIN_IMAGE_ALLOWED_TYPES.includes(file.type as (typeof ADMIN_IMAGE_ALLOWED_TYPES)[number])) {
    return `Invalid file type "${file.name}". Only JPEG, PNG, and WebP images are allowed.`
  }
  if (file.size > ADMIN_IMAGE_MAX_SIZE_BYTES) {
    return `File "${file.name}" is too large. Maximum allowed size is ${ADMIN_IMAGE_MAX_SIZE_MB} MB.`
  }
  return null
}

/**
 * Uploads a validated image file to the `product-images` Supabase Storage bucket
 * and returns its public URL.
 */
export async function uploadAdminImageFile({
  folder,
  file,
  filePrefix = '',
}: {
  folder: string
  file: File
  filePrefix?: string
}): Promise<string> {
  const validationError = validateAdminImageFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const supabase = createClient()
  const fileExt = file.name.split('.').pop() || 'webp'
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
  const filePath = `${folder}/${filePrefix}${Date.now()}_${cleanFileName}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return publicUrlData.publicUrl
}
