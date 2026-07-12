import { NextResponse, type NextRequest } from 'next/server'
import { adminGuard } from '@/lib/supabase/middleware'

// In-memory checkout attempts tracking by client IP
const ipAttempts = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const oneMinuteAgo = now - 60000

  const attempts = ipAttempts.get(ip) || []
  const recentAttempts = attempts.filter((timestamp) => timestamp > oneMinuteAgo)

  if (recentAttempts.length >= 5) {
    return true
  }

  recentAttempts.push(now)
  ipAttempts.set(ip, recentAttempts)
  return false
}

/**
 * Next.js root middleware (file must be named proxy.ts for Next.js 16+).
 *
 * Delegates to `adminGuard` and implements checkout rate limiting.
 */
export async function proxy(request: NextRequest) {
  const isCheckoutPost =
    request.nextUrl.pathname === '/checkout' && request.method === 'POST'

  if (isCheckoutPost) {
    // Get client IP address or default to local loopback
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    if (isRateLimited(ip.trim())) {
      return new NextResponse(
        'Too many checkout attempts. Please try again in a minute.',
        { status: 429 }
      )
    }
  }

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
