import crypto from 'node:crypto'

/**
 * Constant-time comparison between two strings to prevent timing attacks.
 * If either string is missing or invalid, or if their lengths differ,
 * the comparison safely evaluates in constant time and returns false.
 */
export function timingSafeEqualStrings(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false
  }

  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')

  if (bufA.length !== bufB.length) {
    // Perform dummy timing safe compare to avoid early exit timing leaks
    crypto.timingSafeEqual(bufA, bufA)
    return false
  }

  return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * Returns the validated secret key used for signing and verifying order verification cookies.
 * Strictly requires ORDER_COOKIE_SECRET to be defined and at least 32 characters long.
 * Fails closed (returns null) if missing or insufficient length.
 */
function getSigningSecret(secretOverride?: string): string | null {
  const secret = secretOverride ?? process.env.ORDER_COOKIE_SECRET
  if (!secret || typeof secret !== 'string' || secret.length < 32) {
    if (process.env.NODE_ENV === 'production' && !secretOverride) {
      throw new Error(
        'ORDER_COOKIE_SECRET is misconfigured in production: must be set and at least 32 characters long.'
      )
    }
    return null
  }
  return secret
}

/**
 * Generates the scoped cookie name for a given order number.
 */
export function getOrderVerificationCookieName(orderNumber: string): string {
  const sanitized = orderNumber.replace(/[^a-zA-Z0-9_-]/g, '_')
  return `otv_${sanitized}`
}

/**
 * Signs an order number with a timestamp using HMAC-SHA256.
 * Payload format: `${issuedAt}.${signature}`
 * Throws a clear error if ORDER_COOKIE_SECRET is missing or < 32 characters.
 */
export function signOrderVerification(
  orderNumber: string,
  secretOverride?: string
): string {
  const secret = getSigningSecret(secretOverride)
  if (!secret) {
    throw new Error('ORDER_COOKIE_SECRET is not configured or is shorter than 32 characters')
  }

  const issuedAt = Date.now().toString()
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(`${orderNumber}:${issuedAt}`)
    .digest('hex')

  return `${issuedAt}.${hmac}`
}

/**
 * Verifies that a signed cookie payload is valid, untampered, and unexpired.
 * Max age defaults to 24 hours (86,400,000 ms).
 * Fails closed (returns false) if ORDER_COOKIE_SECRET is missing or < 32 characters.
 */
export function verifyOrderVerification(
  orderNumber: string,
  signedValue: string | null | undefined,
  secretOverride?: string,
  maxAgeMs = 24 * 60 * 60 * 1000
): boolean {
  if (!signedValue || typeof signedValue !== 'string') {
    return false
  }

  const secret = getSigningSecret(secretOverride)
  if (!secret) {
    return false
  }

  const dotIndex = signedValue.indexOf('.')
  if (dotIndex === -1) {
    return false
  }

  const issuedAtStr = signedValue.slice(0, dotIndex)
  const signature = signedValue.slice(dotIndex + 1)

  const issuedAt = parseInt(issuedAtStr, 10)
  if (Number.isNaN(issuedAt)) {
    return false
  }

  const now = Date.now()
  // Reject tokens from the future (>60s leeway for clock skew) or older than maxAge
  if (issuedAt > now + 60 * 1000 || now - issuedAt > maxAgeMs) {
    return false
  }

  const expectedHmac = crypto
    .createHmac('sha256', secret)
    .update(`${orderNumber}:${issuedAtStr}`)
    .digest('hex')

  return timingSafeEqualStrings(expectedHmac, signature)
}

/**
 * Sets an httpOnly signed cookie verifying phone ownership of the given order number.
 * Throws a clear error if ORDER_COOKIE_SECRET is missing or < 32 characters.
 */
export function setOrderVerificationCookie(
  cookieStore: { set: (name: string, value: string, options: Record<string, unknown>) => void },
  orderNumber: string,
  secretOverride?: string
): void {
  const secret = getSigningSecret(secretOverride)
  if (!secret) {
    throw new Error('ORDER_COOKIE_SECRET is not configured or is shorter than 32 characters')
  }

  const cookieName = getOrderVerificationCookieName(orderNumber)
  const signedValue = signOrderVerification(orderNumber, secret)

  cookieStore.set(cookieName, signedValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

/**
 * Checks whether the incoming request cookies have a valid verification signature for the order.
 */
export function isOrderCookieVerified(
  cookieStore: { get: (name: string) => { value: string } | undefined },
  orderNumber: string,
  secretOverride?: string
): boolean {
  const cookieName = getOrderVerificationCookieName(orderNumber)
  const cookie = cookieStore.get(cookieName)
  if (!cookie?.value) {
    return false
  }

  return verifyOrderVerification(orderNumber, cookie.value, secretOverride)
}
