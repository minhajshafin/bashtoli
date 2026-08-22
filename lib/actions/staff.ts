'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { promoteUserSchema, demoteUserSchema } from '@/lib/validations/staff'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

export type PromoteState = {
  error: string | null
  success?: boolean
  fieldErrors?: Partial<Record<'email', string[]>>
}

export type StaffMember = {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  role: 'customer' | 'staff' | 'admin'
}

/**
 * Helper: Asserts that the calling user has the 'admin' role.
 * Only administrators are authorized to manage staff roles.
 */
async function assertCallerIsAdmin(client: SupabaseClient<Database>): Promise<string> {
  const {
    data: { user },
  } = await client.auth.getUser()

  if (!user) {
    throw new Error('Unauthenticated: You must be logged in.')
  }

  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized: Only administrators can manage staff accounts.')
  }

  return user.id
}

/**
 * Retrieves the list of all accounts with 'staff' or 'admin' roles.
 *
 * M-4 fix: the previous implementation called auth.admin.listUsers() which
 * loads every single user in the project before filtering. For a large user
 * base this is slow, expensive, and will silently truncate past Supabase's
 * default page size. We now query profiles first (cheap index scan on role)
 * and then fetch only the matching auth users by their IDs.
 */
export async function fetchStaffList(): Promise<StaffMember[]> {
  const client = await createClient()

  try {
    await assertCallerIsAdmin(client)

    const adminClient = createAdminClient()

    // 1. Find only staff/admin profiles (small set — role is indexed)
    const { data: staffProfiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('id, role, full_name, phone')
      .in('role', ['staff', 'admin'])

    if (profilesError) throw profilesError
    if (!staffProfiles || staffProfiles.length === 0) return []

    // 2. Fetch auth user records only for those specific IDs
    const staffMembers: StaffMember[] = []

    for (const profile of staffProfiles) {
      const { data: { user }, error: userError } = await adminClient.auth.admin.getUserById(profile.id)

      if (userError || !user) continue

      staffMembers.push({
        id: user.id,
        email: user.email || null,
        full_name: profile.full_name || 'Anonymous User',
        phone: profile.phone || null,
        role: profile.role as 'customer' | 'staff' | 'admin',
      })
    }

    return staffMembers
  } catch (err) {
    console.error('Error fetching staff list:', err)
    return []
  }
}

/**
 * Server Action: Promotes a customer account to 'staff' by their email.
 */
export async function promoteUserAction(
  _prevState: PromoteState,
  formData: FormData
): Promise<PromoteState> {
  const client = await createClient()

  try {
    await assertCallerIsAdmin(client)

    const email = formData.get('email') as string

    // Validate inputs
    const parsed = promoteUserSchema.safeParse({ email })
    if (!parsed.success) {
      return {
        error: 'Please fix the errors below.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      }
    }

    const adminClient = createAdminClient()

    // Find the auth user with matching email
    const {
      data: { users },
      error: listError,
    } = await adminClient.auth.admin.listUsers()

    if (listError) throw listError

    const targetUser = users?.find(
      (u) => u.email?.toLowerCase() === parsed.data.email.toLowerCase()
    )

    if (!targetUser) {
      // Return the same success shape regardless of whether the user exists.
      // A distinct "not found" message would let an attacker enumerate registered emails.
      revalidatePath('/admin/staff')
      return { error: null, success: true }
    }

    // Retrieve current role profile
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', targetUser.id)
      .maybeSingle()

    if (profile?.role === 'staff' || profile?.role === 'admin') {
      return {
        error: 'This user already has a staff or admin role.',
      }
    }

    // Perform promotion update
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ role: 'staff' })
      .eq('id', targetUser.id)

    if (updateError) throw updateError

    // Audit log: record who promoted whom (L-4)
    await adminClient.from('admin_audit_log').insert({
      performed_by: (await client.auth.getUser()).data.user?.id,
      action: 'promote',
      target_user_id: targetUser.id,
      target_email: targetUser.email ?? null,
      old_role: profile?.role ?? 'customer',
      new_role: 'staff',
    })

    revalidatePath('/admin/staff')

    return {
      error: null,
      success: true,
    }
  } catch (err) {
    console.error('Error promoting user:', err)
    const errMsg = err instanceof Error ? err.message : 'Failed to promote the user. Please try again.'
    return {
      error: errMsg,
    }
  }
}

/**
 * Server Action: Demotes a staff account back to 'customer'.
 * Prevents administrators from demoting their own accounts.
 */
export async function demoteUserAction(
  userId: string
): Promise<{ error: string | null; success?: boolean }> {
  const client = await createClient()

  try {
    const callerId = await assertCallerIsAdmin(client)

    // Validate request parameter
    const parsed = demoteUserSchema.safeParse({ userId })
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors.userId?.[0] || 'Invalid inputs.' }
    }

    const targetUserId = parsed.data.userId

    // Prevent self-demotion
    if (callerId === targetUserId) {
      return { error: 'Access Denied: You cannot demote your own administrator account.' }
    }

    const adminClient = createAdminClient()

    // Retrieve target profile details
    const { data: targetProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', targetUserId)
      .maybeSingle()

    if (profileError || !targetProfile) {
      return { error: 'User profile not found.' }
    }

    if (targetProfile.role === 'admin') {
      return { error: 'Access Denied: Other administrator accounts cannot be demoted.' }
    }

    // Demote role to customer
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ role: 'customer' })
      .eq('id', targetUserId)

    if (updateError) throw updateError

    // Audit log: record demotion (L-4)
    const { data: authUserData } = await adminClient.auth.admin.getUserById(targetUserId)
    await adminClient.from('admin_audit_log').insert({
      performed_by: callerId,
      action: 'demote',
      target_user_id: targetUserId,
      target_email: authUserData?.user?.email ?? null,
      old_role: targetProfile.role ?? 'staff',
      new_role: 'customer',
    })

    revalidatePath('/admin/staff')

    return {
      error: null,
      success: true,
    }
  } catch (err) {
    console.error('Error demoting user:', err)
    const errMsg = err instanceof Error ? err.message : 'Failed to demote the user. Please try again.'
    return {
      error: errMsg,
    }
  }
}
