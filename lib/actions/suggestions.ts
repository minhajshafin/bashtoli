'use server'

import { suggestionSchema, type SuggestionInput } from '@/lib/validations/suggestion'
import { sendSuggestionEmail } from '@/lib/email/resend'
import { sanitizeActionError } from '@/lib/utils/action-error'

export type SuggestionActionResponse = {
  success: boolean
  error?: string | null
  fieldErrors?: Partial<Record<keyof SuggestionInput, string[]>>
}

/**
 * Server Action: Submit a customer product suggestion.
 * Validates the inputs, filters bot submissions via honeypot, and delivers email.
 */
export async function submitSuggestionAction(
  data: unknown
): Promise<SuggestionActionResponse> {
  const result = suggestionSchema.safeParse(data)

  if (!result.success) {
    const errorMap = result.error.flatten().fieldErrors
    const firstErrorMessage =
      errorMap.suggestion?.[0] ||
      errorMap.contact?.[0] ||
      errorMap.name?.[0] ||
      'Invalid suggestion submission.'

    return {
      success: false,
      error: firstErrorMessage,
      fieldErrors: errorMap,
    }
  }

  const { name, contact, suggestion, honeypot } = result.data

  // Honeypot check: If filled, silently acknowledge to mislead bots without sending email
  if (honeypot && honeypot.trim().length > 0) {
    console.warn('[Suggestion] Honeypot triggered. Silently ignoring bot submission.')
    return { success: true }
  }

  const emailResult = await sendSuggestionEmail({
    name,
    contact,
    suggestion,
  })

  if (!emailResult.success) {
    return {
      success: false,
      error: sanitizeActionError('suggestion:send', emailResult.error, 'Failed to send suggestion. Please try again.'),
    }
  }

  return { success: true }
}
