import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Reads/writes auth cookies via next/headers.
 *
 * Usage:
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('products').select()
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The `setAll` method is called from a Server Component.
            // Cookies can only be set from Server Actions or Route Handlers.
            // This error can be safely ignored if a middleware refreshes
            // user sessions.
          }
        },
      },
    },
  )
}
