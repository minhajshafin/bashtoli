/**
 * lib/utils/safe-redirect.ts
 *
 * Validates and sanitizes redirect target paths to prevent open redirect vulnerabilities.
 * Enforces that paths start with a single forward slash and are NOT protocol-relative
 * (e.g. //evil.com or /\evil.com) and do not contain newline / carriage return characters.
 *
 * Accepts only: /^\/(?![/\\])[^\r\n]*$/
 */

const SAFE_REDIRECT_REGEX = /^\/(?![/\\])[^\r\n]*$/

/**
 * Returns `raw` if it is a valid, same-origin relative redirect path.
 * Otherwise returns `fallback`.
 *
 * Checks both the raw string and its URL-decoded equivalent to prevent
 * obfuscated open-redirect bypasses (e.g. `/%5Cevil.com` or `/%2fevil.com`).
 */
export function safeRedirectPath(
  raw: string | null | undefined,
  fallback: string = '/'
): string {
  if (!raw || typeof raw !== 'string') {
    return fallback
  }

  // Enforce basic relative path structure
  if (!SAFE_REDIRECT_REGEX.test(raw)) {
    return fallback
  }

  // Prevent URL-decoded bypasses (e.g. /%5Cevil.com -> /\evil.com)
  try {
    const decoded = decodeURIComponent(raw)
    if (!SAFE_REDIRECT_REGEX.test(decoded)) {
      return fallback
    }
  } catch {
    // Malformed URI encoding is rejected
    return fallback
  }

  return raw
}
