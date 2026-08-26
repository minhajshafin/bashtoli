import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export type ServerProfile = {
  id: string
  full_name: string | null
  role: string
  email: string | null
}

/**
 * Returns the currently authenticated user's profile including their role.
 *
 * Wrapped in React cache() so multiple server components rendered in the same
 * request (e.g. admin Header + admin dashboard page) deduplicate to a single
 * auth.getUser() + profiles SELECT round-trip instead of two separate calls.
 *
 * Returns null for unauthenticated requests.
 */
export const getServerProfile = cache(async (): Promise<ServerProfile | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    id: user.id,
    full_name: profile?.full_name ?? null,
    role: profile?.role ?? 'customer',
    email: user.email ?? null,
  }
})
