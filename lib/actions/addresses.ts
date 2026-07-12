'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { addressSchema } from '@/lib/validations/address'

export type AddressActionState = {
  error: string | null
  success?: boolean
  fieldErrors?: Partial<Record<'label' | 'full_address' | 'phone', string[]>>
}

/**
 * Server Action: Adds a new saved address.
 * Sets as default if requested, unsetting previous defaults.
 */
export async function addAddressAction(
  _prevState: AddressActionState,
  formData: FormData
): Promise<AddressActionState> {
  const label = formData.get('label') as string
  const fullAddress = formData.get('full_address') as string
  const phone = formData.get('phone') as string
  const isDefault = formData.get('is_default') === 'true'

  // Validate fields
  const parsed = addressSchema.safeParse({
    label,
    full_address: fullAddress,
    phone,
    is_default: isDefault,
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
    return { error: 'You must be logged in to manage saved addresses.' }
  }

  try {
    // If setting as default, clear existing default flag for this user
    if (parsed.data.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
    }

    // Insert new address record
    const { error } = await supabase.from('addresses').insert({
      user_id: user.id,
      label: parsed.data.label,
      full_address: parsed.data.full_address,
      phone: parsed.data.phone,
      is_default: parsed.data.is_default,
    })

    if (error) throw error
  } catch (err) {
    console.error('Add address error:', err)
    return { error: 'Failed to save address. Please try again.' }
  }

  // Refresh caching
  revalidatePath('/account/addresses')
  revalidatePath('/checkout')

  return {
    error: null,
    success: true,
  }
}

/**
 * Server Action: Updates an existing saved address.
 */
export async function editAddressAction(
  addressId: string,
  _prevState: AddressActionState,
  formData: FormData
): Promise<AddressActionState> {
  const label = formData.get('label') as string
  const fullAddress = formData.get('full_address') as string
  const phone = formData.get('phone') as string
  const isDefault = formData.get('is_default') === 'true'

  // Validate fields
  const parsed = addressSchema.safeParse({
    label,
    full_address: fullAddress,
    phone,
    is_default: isDefault,
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
    return { error: 'You must be logged in to manage saved addresses.' }
  }

  try {
    // If setting as default, clear existing defaults first
    if (parsed.data.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
    }

    // Update matching record
    const { error } = await supabase
      .from('addresses')
      .update({
        label: parsed.data.label,
        full_address: parsed.data.full_address,
        phone: parsed.data.phone,
        is_default: parsed.data.is_default,
      })
      .eq('id', addressId)
      .eq('user_id', user.id)

    if (error) throw error
  } catch (err) {
    console.error('Edit address error:', err)
    return { error: 'Failed to update address. Please try again.' }
  }

  revalidatePath('/account/addresses')
  revalidatePath('/checkout')

  return {
    error: null,
    success: true,
  }
}

/**
 * Server Action: Deletes a saved address.
 */
export async function deleteAddressAction(addressId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to manage saved addresses.' }
  }

  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', user.id)

    if (error) throw error
  } catch (err) {
    console.error('Delete address error:', err)
    return { error: 'Failed to delete address. Please try again.' }
  }

  revalidatePath('/account/addresses')
  revalidatePath('/checkout')

  return { error: null }
}

/**
 * Server Action: Sets a saved address as the default.
 */
export async function setDefaultAddressAction(addressId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to manage saved addresses.' }
  }

  try {
    // 1. Unset existing defaults
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true)

    // 2. Set new default
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', user.id)

    if (error) throw error
  } catch (err) {
    console.error('Set default address error:', err)
    return { error: 'Failed to set default address. Please try again.' }
  }

  revalidatePath('/account/addresses')
  revalidatePath('/checkout')

  return { error: null }
}
