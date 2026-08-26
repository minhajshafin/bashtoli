import type { NextRequest } from 'next/server'
import { adminGuard } from '@/lib/supabase/middleware'

/**
 * Next.js root middleware.
 *
 * Delegates to `adminGuard` for:
 * - Supabase session refresh (token rotation on every request)
 * - HTTP security headers on every response
 * - Rate limiting on auth + order-lookup pages
 * - Role-based access control on /admin/* routes
 *
 * IMPORTANT: This file MUST be named `middleware.ts` (not proxy.ts or anything else)
 * for Next.js to pick it up as the edge middleware.
 */
export async function middleware(request: NextRequest) {
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
