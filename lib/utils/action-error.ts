/**
 * Action Error Sanitization Utility.
 * Logs raw error objects securely on the server with contextual tags (excluding PII and env values)
 * and guarantees that raw DB error messages, hints, details, or table/constraint names are NEVER returned to the client.
 */

const DEFAULT_GENERIC_ERROR = 'An unexpected error occurred. Please try again.'

export interface SafeErrorInfo {
  tag: string
  name: string
  code: string | number | undefined
  message: string
}

/**
 * Extracts only safe, non-PII attributes { tag, name, code, message } from an error,
 * truncating message to 300 characters.
 * Postgres details, hint, where/row data are strictly discarded.
 */
export function extractSafeErrorInfo(tag: string, error: unknown): SafeErrorInfo {
  if (typeof error === 'string') {
    return {
      tag,
      name: 'Error',
      code: undefined,
      message: error.slice(0, 300),
    }
  }

  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>
    const name = typeof errObj.name === 'string' && errObj.name ? errObj.name : 'Error'
    const code =
      typeof errObj.code === 'string' || typeof errObj.code === 'number'
        ? errObj.code
        : typeof (errObj as { status?: unknown }).status === 'number'
          ? (errObj as { status: number }).status
          : undefined
    const rawMessage = typeof errObj.message === 'string' ? errObj.message : String(error)
    return {
      tag,
      name,
      code,
      message: rawMessage.slice(0, 300),
    }
  }

  return {
    tag,
    name: 'UnknownError',
    code: undefined,
    message: String(error).slice(0, 300),
  }
}

/**
 * Logs only { tag, name, code, message } to console.error, strictly excluding details, hint, or where/row data.
 */
export function logSafeError(tag: string, error: unknown): void {
  console.error(extractSafeErrorInfo(tag, error))
}

/**
 * Sanitizes an error by logging the safe error server-side with a tag and returning a user-safe message.
 */
export function sanitizeActionError(
  contextTag: string,
  error: unknown,
  fallbackMessage: string = DEFAULT_GENERIC_ERROR
): string {
  logSafeError(contextTag, error)
  return fallbackMessage
}

/**
 * Maps place_order database RPC exceptions to friendly customer-facing messages.
 * Maps known prefix patterns: INSUFFICIENT_STOCK, ITEM_INACTIVE, ITEM_NOT_FOUND,
 * INVALID_ZONE, INVALID_QTY, INVALID_ITEMS.
 * Unknown errors strictly return "We couldn't place your order. Please try again."
 */
export function mapCheckoutError(error: unknown): string {
  logSafeError('checkout', error)

  const rawMessage =
    typeof error === 'string'
      ? error
      : (error as { message?: string })?.message || ''

  if (rawMessage.includes('INSUFFICIENT_STOCK')) {
    return 'One or more items in your cart do not have enough stock. Please adjust quantities and try again.'
  }
  if (rawMessage.includes('ITEM_INACTIVE')) {
    return 'One or more items in your cart are no longer available. Please refresh and try again.'
  }
  if (rawMessage.includes('ITEM_NOT_FOUND')) {
    return 'One or more items in your cart could not be found. Please check your cart and try again.'
  }
  if (rawMessage.includes('INVALID_ZONE')) {
    return 'Please select a valid delivery zone.'
  }
  if (rawMessage.includes('INVALID_QTY')) {
    return 'Please enter a valid item quantity.'
  }
  if (rawMessage.includes('INVALID_ITEMS')) {
    return 'Your cart is empty or contains invalid items.'
  }

  return "We couldn't place your order. Please try again."
}

/**
 * Whitelists the exact messages raised by cancel_order RPC and maps them to user-friendly text.
 * Whitelisted:
 * - 'Order not found'
 * - 'Unauthorized: Not the order owner'
 * - 'Only pending orders can be cancelled'
 * - 'Orders can only be cancelled within 24 hours of placement.'
 * Any other error returns a generic message.
 */
export function mapCancelOrderError(error: unknown): string {
  logSafeError('customer-cancel-order', error)

  const rawMessage =
    typeof error === 'string'
      ? error
      : (error as { message?: string })?.message || ''

  if (rawMessage.includes('Order not found')) {
    return 'Order not found. Please verify the order details.'
  }
  if (rawMessage.includes('Unauthorized: Not the order owner')) {
    return 'You are not authorized to cancel this order.'
  }
  if (rawMessage.includes('Only pending orders can be cancelled')) {
    return 'Only pending orders can be cancelled.'
  }
  if (rawMessage.includes('Orders can only be cancelled within 24 hours of placement.')) {
    return 'Orders can only be cancelled within 24 hours of placement.'
  }

  return 'Failed to cancel the order. Please try again.'
}

/**
 * Maps Supabase Auth errors to friendly user messages based on whitelisted error.code:
 * - weak_password
 * - same_password
 * - over_request_rate_limit
 * - over_email_send_rate_limit
 * - otp_expired (or flow_state_expired)
 * Anything else returns generic fallback.
 */
export function mapAuthError(
  error: unknown,
  fallbackMessage: string = 'An unexpected authentication error occurred. Please try again.'
): string {
  logSafeError('auth', error)

  const code = (error as { code?: unknown })?.code
  if (typeof code === 'string') {
    if (code === 'weak_password') {
      return 'The password provided is too weak. Please choose a stronger password.'
    }
    if (code === 'same_password') {
      return 'New password must be different from your current password.'
    }
    if (code === 'over_request_rate_limit') {
      return 'Too many requests. Please wait a few moments and try again.'
    }
    if (code === 'over_email_send_rate_limit') {
      return 'Too many email attempts. Please wait a few moments before trying again.'
    }
    if (code === 'otp_expired' || code === 'flow_state_expired') {
      return 'Your reset link has expired. Please request a new one.'
    }
  }

  return fallbackMessage
}
