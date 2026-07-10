import { type NextRequest } from 'next/server'
import { adminGuard } from '@/lib/supabase/middleware'

/**
 * Next.js root middleware (file must be named proxy.ts for Next.js 16+).
 *
 * Delegates to `adminGuard` which:
 *  1. Refreshes the Supabase session on every request (token rotation).
 *  2. Enforces staff/admin-only access on all `/admin/*` routes.
 *     – Unauthenticated → /login
 *     – Customer role  → /
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
