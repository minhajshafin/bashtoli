/**
 * lib/actions/admin-guard.ts
 *
 * Shared helper for Server Actions that require staff or admin access.
 * Provides defence-in-depth on top of RLS — gives a clear 401/403
 * instead of a confusing DB error if an unauthorised caller reaches
 * an admin action directly.
 *
 * Usage:
 *   const supabase = await createClient()
 *   await assertStaffOrAdmin(supabase)   // throws on failure
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

/**
 * Asserts that the currently authenticated user has the 'staff' or 'admin' role.
 * Throws a descriptive Error on failure; the caller should let it propagate
 * (or catch it and return a typed error to the UI).
 *
 * Returns the authenticated user's ID on success.
 */
export async function assertStaffOrAdmin(
  client: SupabaseClient<Database>,
): Promise<string> {
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

  if (
    !profile ||
    (profile.role !== 'staff' && profile.role !== 'admin')
  ) {
    throw new Error('Unauthorized: Staff or admin access required.')
  }

  return user.id
}
