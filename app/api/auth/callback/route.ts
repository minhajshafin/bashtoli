import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { safeRedirectPath } from '@/lib/utils/safe-redirect'

/**
 * API route to exchange Supabase authentication codes or verify token hashes
 * for cookie-backed sessions.
 * Prevents open redirect attacks and maps callback URLs safely on the current origin.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const rawTarget = searchParams.get('redirectTo') ?? searchParams.get('next')
  const target = safeRedirectPath(rawTarget, '/')

  if (token_hash && type) {
    const cookieStore = await cookies()
    const redirectResponse = NextResponse.redirect(new URL(target, origin))
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
                redirectResponse.cookies.set(name, value, options)
              })
            } catch {
              // Ignore cookie update exceptions inside server context
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })

    if (!error) {
      return redirectResponse
    }

    console.error({
      tag: 'auth:callback:verifyOtp',
      error: error.message,
      status: error.status,
    })
  } else if (code) {
    const cookieStore = await cookies()
    const redirectResponse = NextResponse.redirect(new URL(target, origin))
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
                redirectResponse.cookies.set(name, value, options)
              })
            } catch {
              // Ignore cookie update exceptions inside server context
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return redirectResponse
    }

    console.error({
      tag: 'auth:callback:exchangeCode',
      error: error.message,
      status: error.status,
    })
  } else {
    const authError = searchParams.get('error_description') || searchParams.get('error')
    if (authError) {
      console.error({
        tag: 'auth:callback:paramError',
        error: authError,
      })
    }
  }

  // Fallback to login with error details
  return NextResponse.redirect(
    new URL('/login?error=Authentication session handshake failed.', origin)
  )
}
