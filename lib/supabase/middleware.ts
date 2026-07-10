import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'

type UserRole = Database['public']['Enums']['user_role']

const ADMIN_ALLOWED_ROLES: UserRole[] = ['staff', 'admin']

/**
 * Creates a Supabase client scoped to the middleware context,
 * wires up cookie read/write on both request and response,
 * and returns the client alongside the current supabaseResponse.
 *
 * The caller MUST use the returned `supabaseResponse` as the base
 * for any redirects so that refreshed auth cookies are preserved.
 */
function createMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
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

  return { supabase, getResponse: () => supabaseResponse }
}

/**
 * Copies all cookies from a source response into a redirect response
 * so that refreshed Supabase auth tokens are not lost on redirect.
 */
function redirectWithCookies(
  url: URL,
  sourceResponse: NextResponse,
): NextResponse {
  const redirectResponse = NextResponse.redirect(url)
  sourceResponse.cookies.getAll().forEach(({ name, value }) => {
    redirectResponse.cookies.set(name, value)
  })
  return redirectResponse
}

/**
 * Main middleware guard.
 *
 * 1. Refreshes the Supabase session on every matched request (token rotation).
 * 2. For `/admin/*` routes, enforces role-based access:
 *    - Unauthenticated users → redirect to `/login`
 *    - `customer` role → redirect to `/` (not authorised)
 *    - `staff` / `admin` → allowed through
 *
 * Public storefront routes are passed through untouched (only token refresh).
 */
export async function adminGuard(request: NextRequest) {
  const { supabase, getResponse } = createMiddlewareClient(request)

  // IMPORTANT: do NOT write any logic between createServerClient and
  // supabase.auth.getUser(). A subtle bug can occur if you do.
  // The getUser() call refreshes the session if a token has expired.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  if (!isAdminRoute) {
    // Nothing to enforce — return with refreshed cookies only.
    return getResponse()
  }

  // --- Admin route protection ---

  if (!user) {
    // Unauthenticated: send to login, preserving the intended destination.
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return redirectWithCookies(loginUrl, getResponse())
  }

  // Fetch the role from the profiles table.
  // We do a single .select() with .single() — fast primary-key lookup.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role as UserRole | undefined

  if (!role || !ADMIN_ALLOWED_ROLES.includes(role)) {
    // Authenticated but not staff/admin (e.g. customer) → home page.
    const homeUrl = new URL('/', request.url)
    return redirectWithCookies(homeUrl, getResponse())
  }

  // Authorised — pass through with refreshed cookies.
  return getResponse()
}
