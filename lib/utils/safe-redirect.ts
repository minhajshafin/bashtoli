/**
 * lib/utils/safe-redirect.ts
 *
 * Validates and sanitizes redirect target paths to prevent open redirect vulnerabilities.
 * 
 * Rules:
 * 1. Must be a non-empty string.
 * 2. Rejects ANY control character (U+0000–U+001F, U+007F), including tab (\t) and newline (\r, \n),
 *    checked on the raw input and after each URL-decode iteration.
 * 3. Enforces relative path regex /^\/(?![/\\])/ after decoding.
 * 4. Validates with new URL(input, 'http://x.invalid'):
 *    - The origin must match 'http://x.invalid'.
 *    - The pathname must start with a single "/" and NOT start with "//".
 *    - The raw string must not start with "//" or "/\\".
 */

const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/
const SAFE_RELATIVE_REGEX = /^\/(?![/\\])/

/**
 * Returns `raw` if it is a valid, same-origin relative redirect path.
 * Otherwise returns `fallback`.
 */
export function safeRedirectPath(
  raw: string | null | undefined,
  fallback: string = '/'
): string {
  if (!raw || typeof raw !== 'string') {
    return fallback
  }

  // Reject immediate protocol-relative prefixes
  if (raw.startsWith('//') || raw.startsWith('/\\')) {
    return fallback
  }

  // Check raw string for control characters
  if (CONTROL_CHARS_REGEX.test(raw)) {
    return fallback
  }

  // Enforce relative path structure
  if (!SAFE_RELATIVE_REGEX.test(raw)) {
    return fallback
  }

  // Iteratively decode to detect multi-layer encoded bypasses (e.g. /%252f%252fhost)
  let current = raw
  try {
    for (let i = 0; i < 3; i++) {
      const decoded = decodeURIComponent(current)
      if (CONTROL_CHARS_REGEX.test(decoded)) {
        return fallback
      }
      if (!SAFE_RELATIVE_REGEX.test(decoded)) {
        return fallback
      }
      if (decoded === current) break
      current = decoded
    }
  } catch {
    // Malformed URI encoding is rejected
    return fallback
  }

  // Final structural validation via URL parser with a dummy base
  try {
    const parsed = new URL(current, 'http://x.invalid')
    if (parsed.origin !== 'http://x.invalid') {
      return fallback
    }
    if (!parsed.pathname.startsWith('/') || parsed.pathname.startsWith('//')) {
      return fallback
    }
  } catch {
    return fallback
  }

  return raw
}
