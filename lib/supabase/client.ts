import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

/**
 * Creates a Supabase client for use in Browser / Client Components.
 * Reads credentials from NEXT_PUBLIC_* env vars (safe to expose).
 * Call this inside a component, not at module level, so each render
 * gets a fresh singleton managed by @supabase/ssr.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
