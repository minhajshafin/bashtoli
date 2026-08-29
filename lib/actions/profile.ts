'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { profileSchema, passwordChangeSchema } from '@/lib/validations/profile'

export type ProfileUpdateState = {
  error: string | null
  success?: boolean
  fieldErrors?: Partial<Record<'fullName' | 'phone' | 'address', string[]>>
}

export type PasswordChangeState = {
  error: string | null
  success?: boolean
  fieldErrors?: Partial<Record<'newPassword' | 'confirmPassword', string[]>>
}

export type DeleteAccountState = {
  error: string | null
  success?: boolean
}

/**
 * Server Action: Update user profile information (name, phone, address).
 * Synchronizes with profiles table and default saved address if present.
 */
export async function updateProfileAction(
  _prevState: ProfileUpdateState,
  formData: FormData
): Promise<ProfileUpdateState> {
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  // Validate inputs
  const parsed = profileSchema.safeParse({
    fullName,
    phone,
    address,
  })

  if (!parsed.success) {
    return {
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to update your profile.' }
  }

  try {
    // 1. Update auth.users metadata so name is synchronized in auth session
    await supabase.auth.updateUser({
      data: {
        full_name: parsed.data.fullName,
      },
    })

    // 2. Update profiles table (full_name and phone)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile table update error:', profileError)
      throw profileError
    }

    // 3. Synchronize address with addresses table
    if (parsed.data.address) {
      const { data: defaultAddress } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .maybeSingle()

      if (defaultAddress) {
        // Update existing default address
        await supabase
          .from('addresses')
          .update({
            full_address: parsed.data.address,
            phone: parsed.data.phone,
          })
          .eq('id', defaultAddress.id)
      } else {
        // Check if user has any addresses saved
        const { data: firstAddress } = await supabase
          .from('addresses')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle()

        if (firstAddress) {
          // Update the first address to be default
          await supabase
            .from('addresses')
            .update({
              full_address: parsed.data.address,
              phone: parsed.data.phone,
              is_default: true,
            })
            .eq('id', firstAddress.id)
        } else {
          // Insert initial default address
          await supabase.from('addresses').insert({
            user_id: user.id,
            label: 'Primary Address',
            full_address: parsed.data.address,
            phone: parsed.data.phone,
            is_default: true,
          })
        }
      }
    }
  } catch (err) {
    console.error('Update profile error:', err)
    return { error: 'Failed to update profile. Please try again.' }
  }

  // Invalidate caches
  revalidatePath('/account/profile')
  revalidatePath('/account')
  revalidatePath('/account/addresses')
  revalidatePath('/checkout')

  return {
    error: null,
    success: true,
  }
}

/**
 * Server Action: Update authenticated user's password.
 */
export async function updatePasswordAction(
  _prevState: PasswordChangeState,
  formData: FormData
): Promise<PasswordChangeState> {
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate inputs
  const parsed = passwordChangeSchema.safeParse({
    newPassword,
    confirmPassword,
  })

  if (!parsed.success) {
    return {
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to update your password.' }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    })

    if (error) {
      return {
        error: error.message || 'Failed to update password. Please try again.',
      }
    }

    return {
      error: null,
      success: true,
    }
  } catch (err) {
    console.error('Update password error:', err)
    return {
      error: 'An unexpected error occurred while updating your password.',
    }
  }
}

/**
 * Server Action: Permanently and safely delete user account.
 * Removes user from auth.users (cascades to profiles, addresses, carts, wishlist),
 * while foreign key ON DELETE SET NULL keeps past/completed orders intact.
 */
export async function deleteAccountAction(
  _prevState: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const confirmation = (formData.get('confirmation') as string || '').trim()

  if (confirmation !== 'DELETE') {
    return { error: 'Please type DELETE exactly to confirm account deletion.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to delete your account.' }
  }

  try {
    // 1. Check if user is an admin. If so, prevent deletion if they are the sole admin.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role === 'admin') {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')

      if ((count ?? 0) <= 1) {
        return {
          error: 'Cannot delete the sole administrator account on the system. Please promote another administrator first.',
        }
      }
    }

    // 2. Delete user using Supabase Admin Client
    const adminClient = createAdminClient()
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Delete user admin error:', deleteError)
      return {
        error: deleteError.message || 'Failed to delete account. Please try again.',
      }
    }

    // 3. Sign out session & clear cookies
    await supabase.auth.signOut()
  } catch (err) {
    console.error('Delete account action unexpected error:', err)
    return {
      error: 'An unexpected error occurred while deleting your account. Please try again.',
    }
  }

  revalidatePath('/', 'layout')

  return {
    error: null,
    success: true,
  }
}

