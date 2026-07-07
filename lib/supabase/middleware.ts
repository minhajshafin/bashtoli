import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refreshes the Supabase auth session inside Next.js middleware.
 * Must be called on every request so short-lived access tokens are
 * silently rotated before reaching Server Components / Actions.
 *
 * Returns the (possibly-modified) NextResponse so the caller can
 * pass it straight back to the Next.js runtime.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Apply to the outgoing request (so server helpers see updated cookies)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          // 2. Re-create the response with the updated request
          supabaseResponse = NextResponse.next({ request })
          // 3. Apply to the outgoing response (so the browser receives new tokens)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: do NOT write any logic between createServerClient and
  // supabase.auth.getUser(). A subtle bug can occur if you do.
  // The getUser() call refreshes the session if a token has expired.
  await supabase.auth.getUser()

  return supabaseResponse
}
