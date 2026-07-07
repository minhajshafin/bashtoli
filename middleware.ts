import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js root middleware.
 * Calls updateSession on every matched request to keep Supabase auth
 * tokens refreshed. No redirects here — auth-gating is done inside
 * each layout/page so the logic stays co-located with the route.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match every request path EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico   (favicon)
     * - public assets (png, svg, jpg, …)
     *
     * This ensures the session is refreshed on every server-rendered
     * page, API route, and Server Action.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
