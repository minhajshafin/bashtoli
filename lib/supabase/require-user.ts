import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

/**
 * Deduplicated retrieval of the current authenticated user via React cache().
 * Calls supabase.auth.getUser() at most once per incoming server request.
 */
export const getCachedUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/**
 * Requires an authenticated user session in Server Components and Layouts.
 * If no user is logged in, immediately redirects to /login with the exact redirectTo target.
 * Wrapped in React cache() to eliminate duplicate network round trips.
 */
export const requireUser = cache(async (redirectTo: string = '/account'): Promise<User> => {
  const user = await getCachedUser()
  if (!user) {
    redirect(`/login?redirectTo=${redirectTo}`)
  }
  return user
})
