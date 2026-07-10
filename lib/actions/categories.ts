'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createCategorySchema,
  updateCategorySchema,
  slugify,
} from '@/lib/validations/category'

export type CategoryActionState = {
  error: string | null
  fieldErrors?: Partial<Record<'name' | 'slug' | 'sort_order', string[]>>
}

const CATEGORIES_PATH = '/admin/categories'

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Server Action: create a new category.
 *
 * If the slug field is left blank, it is derived from the name.
 * Returns field-level Zod errors or a top-level error string on failure.
 */
export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const rawName = (formData.get('name') as string) ?? ''
  const rawSlug = (formData.get('slug') as string) ?? ''

  const parsed = createCategorySchema.safeParse({
    name: rawName,
    slug: rawSlug.trim() || slugify(rawName),
    sort_order: formData.get('sort_order'),
  })

  if (!parsed.success) {
    return {
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten()
        .fieldErrors as CategoryActionState['fieldErrors'],
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('categories').insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    sort_order: parsed.data.sort_order,
  })

  if (error) {
    // Postgres unique-violation code
    if (error.code === '23505') {
      return {
        error: null,
        fieldErrors: {
          slug: ['A category with that slug already exists. Choose a different slug.'],
        },
      }
    }
    return { error: 'Failed to create category. Please try again.' }
  }

  revalidatePath(CATEGORIES_PATH)
  return { error: null }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Server Action: update an existing category.
 *
 * Expects a hidden `id` field alongside name, slug, and sort_order.
 */
export async function updateCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const parsed = updateCategorySchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    slug: formData.get('slug'),
    sort_order: formData.get('sort_order'),
  })

  if (!parsed.success) {
    return {
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten()
        .fieldErrors as CategoryActionState['fieldErrors'],
    }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      sort_order: parsed.data.sort_order,
    })
    .eq('id', parsed.data.id)

  if (error) {
    if (error.code === '23505') {
      return {
        error: null,
        fieldErrors: {
          slug: ['A category with that slug already exists. Choose a different slug.'],
        },
      }
    }
    return { error: 'Failed to update category. Please try again.' }
  }

  revalidatePath(CATEGORIES_PATH)
  return { error: null }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Server Action: delete a category.
 *
 * Blocked if the category has any associated products — returns a descriptive
 * error message including the product count. The DB schema does SET NULL on
 * products.category_id, but we prevent that silently by checking first.
 */
export async function deleteCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const id = (formData.get('id') as string) ?? ''

  if (!id) {
    return { error: 'Category ID is required.' }
  }

  const supabase = await createClient()

  // Guard: count products in this category
  const { count, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (countError) {
    return { error: 'Could not verify associated products. Please try again.' }
  }

  if (count && count > 0) {
    return {
      error: `Cannot delete: this category has ${count} product${count === 1 ? '' : 's'}. Reassign or delete them first.`,
    }
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) {
    return { error: 'Failed to delete category. Please try again.' }
  }

  revalidatePath(CATEGORIES_PATH)
  return { error: null }
}
