import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { safeRedirectPath } from '@/lib/utils/safe-redirect'

/**
 * Creates a server Supabase client wired to both cookieStore and a response object
 * so that Set-Cookie headers are properly attached to outgoing responses.
 */
function createCallbackClient(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  response: NextResponse
) {
  return createServerClient(
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
              response.cookies.set(name, value, options)
            })
          } catch {
            // Ignore cookie update exceptions inside server context
          }
        },
      },
    }
  )
}

function getCallbackFailureRedirect(
  origin: string,
  target: string,
  type: EmailOtpType | null,
  errorMessage: string
): URL {
  if (target === '/reset-password' || type === 'recovery') {
    return new URL('/reset-password', origin)
  }
  return new URL(`/login?error=${encodeURIComponent(errorMessage)}`, origin)
}

/**
 * Generates an HTML response with an inline client script to inspect window.location.hash.
 * Used when Supabase redirects with hash fragment tokens (#access_token=...&refresh_token=...)
 * which are not sent to server Route Handlers over HTTP.
 */
function renderClientHashBridge(target: string): NextResponse {
  const safeTargetJson = JSON.stringify(target)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Authenticating | Bashtoli Stationery</title>
  <style>
    body {
      background-color: #0b1912;
      color: #faf6ee;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(196, 162, 101, 0.2);
      border-top-color: #c4a265;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .card {
      text-align: center;
      padding: 32px;
      background: rgba(18, 41, 29, 0.95);
      border: 1px solid rgba(34, 76, 54, 0.8);
      border-radius: 24px;
      max-width: 380px;
      margin: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    p { margin: 0; font-size: 13px; color: #d0c8b8; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <p id="msg">Verifying your authentication...</p>
  </div>
  <script>
    (function() {
      var hash = window.location.hash ? window.location.hash.substring(1) : '';
      var params = new URLSearchParams(hash);
      var accessToken = params.get('access_token');
      var refreshToken = params.get('refresh_token');
      var type = params.get('type');
      var error = params.get('error_description') || params.get('error');
      var target = ${safeTargetJson};
      var destination = (target === '/' && type === 'recovery') ? '/reset-password' : target;
      var isRecovery = destination === '/reset-password' || type === 'recovery';
      var failureUrl = isRecovery
        ? '/reset-password'
        : '/login?error=' + encodeURIComponent('Authentication session handshake failed.');

      if (error) {
        window.location.replace(isRecovery
          ? '/reset-password'
          : '/login?error=' + encodeURIComponent(error));
        return;
      }

      if (accessToken && refreshToken) {
        fetch('/api/auth/callback', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken
          })
        }).then(function(res) {
          if (res.ok) {
            window.location.replace(destination);
          } else {
            window.location.replace(failureUrl);
          }
        }).catch(function() {
          window.location.replace('/login?error=' + encodeURIComponent('Network error during authentication.'));
        });
        return;
      }

      // No hash fragment tokens present
      window.location.replace(failureUrl);
    })();
  </script>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

/**
 * GET: Handles server-side query code exchange (PKCE), token_hash OTP verification,
 * or serves a client hash bridge for URL hash tokens (#access_token=...).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const rawTarget = searchParams.get('redirectTo') ?? searchParams.get('next')
  const target = safeRedirectPath(rawTarget, '/')

  // Explicit URL query errors returned by Supabase
  const authError = searchParams.get('error_description') || searchParams.get('error')
  if (authError) {
    console.error('[auth:callback:paramError]', authError)
    return NextResponse.redirect(
      getCallbackFailureRedirect(origin, target, type, authError)
    )
  }

  // Server-side token_hash verification (e.g. from custom email templates)
  if (token_hash && type) {
    const cookieStore = await cookies()
    const redirectResponse = NextResponse.redirect(new URL(target, origin))
    const supabase = createCallbackClient(cookieStore, redirectResponse)

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })

    if (!error) {
      return redirectResponse
    }

    console.error('[auth:callback:verifyOtp]', error.message, error.status)
    return NextResponse.redirect(
      getCallbackFailureRedirect(
        origin,
        target,
        type,
        'Authentication session handshake failed.'
      )
    )
  }

  // Server-side PKCE code exchange
  if (code) {
    const cookieStore = await cookies()
    const redirectResponse = NextResponse.redirect(new URL(target, origin))
    const supabase = createCallbackClient(cookieStore, redirectResponse)

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return redirectResponse
    }

    console.error('[auth:callback:exchangeCode]', error.message, error.status)
    // If exchangeCode fails (e.g. cross-device code verifier missing), fallback to client bridge
    // in case hash tokens are available
    return renderClientHashBridge(target)
  }

  // When neither token_hash nor code is in the query parameters, tokens may be in the URL hash
  // (RFC 3986: browsers do not send hash fragments in HTTP requests to the server).
  return renderClientHashBridge(target)
}

/**
 * POST: Client bridge sends extracted hash fragment tokens to be set as HTTP-only cookies
 * on the server response.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { access_token, refresh_token } = body

    if (
      !access_token ||
      typeof access_token !== 'string' ||
      !refresh_token ||
      typeof refresh_token !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid access_token / refresh_token' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const response = NextResponse.json({ success: true })
    const supabase = createCallbackClient(cookieStore, response)

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error || !data?.session) {
      console.error(
        '[auth:callback:setSession]',
        error?.message ?? 'Session missing after setSession',
        error?.status ?? 400
      )
      return NextResponse.json(
        { error: error?.message ?? 'Authentication session handshake failed.' },
        { status: 400 }
      )
    }

    return response
  } catch (err) {
    console.error(
      '[auth:callback:postException]',
      err instanceof Error ? err.message : String(err)
    )
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
