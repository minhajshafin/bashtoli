import type { NextRequest } from 'next/server'
import { adminGuard } from '@/lib/supabase/middleware'

/**
 * Next.js 16 root middleware (proxy.ts).
 *
 * NOTE: Next.js 16 uses "proxy.ts" as the middleware file convention.
 * Do NOT rename this file to "middleware.ts" — that convention is deprecated
 * in Next.js 16 and will cause a build warning.
 *
 * Delegates to `adminGuard` for:
 * - Supabase session refresh (token rotation on every request)
 * - HTTP security headers on every response
 * - Rate limiting on auth + order-lookup pages
 * - Role-based access control on /admin/* routes
 */
export async function proxy(request: NextRequest) {
  return await adminGuard(request)
}

export const config = {
  matcher: [
    /*
     * Match every request path EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico   (favicon)
     * - public assets (png, svg, jpg, …)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
