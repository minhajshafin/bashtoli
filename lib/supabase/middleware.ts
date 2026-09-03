import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'
import {
  checkAuthRateLimit,
  checkOrderLookupRateLimit,
} from './rate-limit'

type UserRole = Database['public']['Enums']['user_role']

const ADMIN_ALLOWED_ROLES: UserRole[] = ['staff', 'admin']

// ── Security Headers ──────────────────────────────────────────
// Applied to every response this middleware returns.
// Adjust the CSP as the app's script/style sources evolve.
function setSecurityHeaders(res: NextResponse): NextResponse {
  // Prevent the app from being embedded in an iframe (clickjacking)
  res.headers.set('X-Frame-Options', 'DENY')

  // Stop browsers from MIME-sniffing the Content-Type
  res.headers.set('X-Content-Type-Options', 'nosniff')

  // Control how much referrer info is sent on navigation
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Enforce HTTPS for 2 years; include subdomains; allow preloading
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  )

  // Disable access to sensitive browser features the app doesn't use
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()',
  )

  // Content Security Policy — defaults to same-origin; loosened only where needed.
  // 'unsafe-inline' for styles is required by Tailwind/Next.js inline styles.
  // 'unsafe-eval' is only included in development (required by Next.js hot-reload / Turbopack).
  // In production it is omitted to prevent eval-based XSS attacks. (L-NEW-3)
  // TODO: replace 'unsafe-inline' on script-src with per-request nonces in production
  //       (Next.js docs: /docs/app/building-your-application/configuring/content-security-policy)
  const isDev = process.env.NODE_ENV === 'development'
  const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com"
    : "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com"
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `img-src 'self' data: blob: ${supabaseOrigin} https://images.unsplash.com https://*.unsplash.com`,
      `connect-src 'self' ${supabaseOrigin} https://vitals.vercel-insights.com https://va.vercel-scripts.com`,
      "font-src 'self' https://fonts.gstatic.com data:",
      "frame-src 'self' https://www.google.com https://maps.google.com https://www.openstreetmap.org",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  )

  return res
}

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
 * 2. Applies HTTP security headers to every response.
 * 3. For `/admin/*` routes, enforces role-based access:
 *    - Unauthenticated users → redirect to `/login`
 *    - `customer` role → redirect to `/` (not authorised)
 *    - `staff` / `admin` → allowed through
 *
 * Public storefront routes are passed through untouched (only token refresh + headers).
 */
export async function adminGuard(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Rate limiting (H-5) ────────────────────────────────────
  // Applied before any session logic so rejected requests never
  // touch the Supabase Auth server.

  // Auth pages: login, signup, forgot-password, reset-password
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'

  if (isAuthPage) {
    const result = await checkAuthRateLimit(request)
    if (result.limited) {
      return setSecurityHeaders(
        new NextResponse('Too many requests. Please try again in a moment.', {
          status: 429,
          headers: { 'Retry-After': String(result.retryAfter) },
        }),
      )
    }
  }

  // Guest order lookup page
  const isOrderLookup = pathname === '/order/lookup' || pathname === '/order-lookup'
  if (isOrderLookup) {
    const result = await checkOrderLookupRateLimit(request)
    if (result.limited) {
      return setSecurityHeaders(
        new NextResponse('Too many requests. Please try again in a moment.', {
          status: 429,
          headers: { 'Retry-After': String(result.retryAfter) },
        }),
      )
    }
  }

  // ── Session refresh ────────────────────────────────────────
  const { supabase, getResponse } = createMiddlewareClient(request)

  // IMPORTANT: do NOT write any logic between createServerClient and
  // supabase.auth.getUser(). A subtle bug can occur if you do.
  // The getUser() call refreshes the session if a token has expired.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdminRoute = pathname.startsWith('/admin')

  if (!isAdminRoute) {
    // Nothing to enforce — return with refreshed cookies and security headers.
    return setSecurityHeaders(getResponse())
  }

  // --- Admin route protection ---

  if (!user) {
    // Unauthenticated: send to login, preserving the intended destination.
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return setSecurityHeaders(redirectWithCookies(loginUrl, getResponse()))
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
    return setSecurityHeaders(redirectWithCookies(homeUrl, getResponse()))
  }

  // Authorised — pass through with refreshed cookies and security headers.
  return setSecurityHeaders(getResponse())
}
