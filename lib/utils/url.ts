/**
 * Utility for resolving canonical application URLs.
 * Handles production domain overrides, environment variables,
 * proxy headers (x-forwarded-host, x-forwarded-proto), and local fallbacks.
 */

/**
 * Resolves the application base URL consistently across server contexts.
 * 1. Prefers NEXT_PUBLIC_APP_URL if defined in environment.
 * 2. If reqHeaders is supplied, checks x-forwarded-host / host and x-forwarded-proto.
 * 3. Falls back to http://localhost:3000 in development, or https://bashtoli.com.
 */
export function getBaseUrl(reqHeaders?: Headers | null): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '')
  }

  if (reqHeaders) {
    const host = reqHeaders.get('x-forwarded-host') || reqHeaders.get('host')
    if (host) {
      const proto =
        reqHeaders.get('x-forwarded-proto') ||
        (process.env.NODE_ENV === 'development' ? 'http' : 'https')
      return `${proto}://${host}`
    }
  }

  return process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://bashtoli.com'
}
