import type { NextRequest } from 'next/server'
import { adminGuard } from '@/lib/supabase/middleware'

/**
 * Next.js root middleware (proxy.ts).
 *
 * Delegates to `adminGuard` for Supabase auth session refreshing
 * and role-based access control on /admin routes.
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
