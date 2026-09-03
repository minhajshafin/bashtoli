import { describe, it, expect, vi, beforeEach } from 'vitest'
import { suggestionSchema } from '@/lib/validations/suggestion'
import { submitSuggestionAction } from '@/lib/actions/suggestions'
import * as resendModule from '@/lib/email/resend'

describe('suggestionSchema validation', () => {
  it('accepts a valid suggestion with all fields', () => {
    const data = {
      name: 'Rahim Ahmed',
      contact: 'rahim@example.com',
      suggestion: 'Please stock mechanical keyboards with brown switches.',
      honeypot: '',
    }
    const result = suggestionSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Rahim Ahmed')
      expect(result.data.contact).toBe('rahim@example.com')
      expect(result.data.suggestion).toBe(
        'Please stock mechanical keyboards with brown switches.'
      )
    }
  })

  it('accepts an anonymous suggestion without name and contact', () => {
    const data = {
      suggestion: 'Keychron wireless mouse',
    }
    const result = suggestionSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBeNull()
      expect(result.data.contact).toBeNull()
      expect(result.data.suggestion).toBe('Keychron wireless mouse')
    }
  })

  it('trims whitespace and converts empty name/contact to null', () => {
    const data = {
      name: '   ',
      contact: '   ',
      suggestion: '  Ergonomic chair headrest  ',
    }
    const result = suggestionSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBeNull()
      expect(result.data.contact).toBeNull()
      expect(result.data.suggestion).toBe('Ergonomic chair headrest')
    }
  })

  it('rejects suggestions shorter than 3 characters', () => {
    const data = {
      suggestion: 'hi',
    }
    const result = suggestionSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.suggestion).toBeDefined()
    }
  })

  it('rejects suggestions that are just whitespace', () => {
    const data = {
      suggestion: '     ',
    }
    const result = suggestionSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects overly long suggestions exceeding 2000 characters', () => {
    const data = {
      suggestion: 'a'.repeat(2001),
    }
    const result = suggestionSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects name exceeding 100 characters', () => {
    const data = {
      name: 'a'.repeat(101),
      suggestion: 'Desk mat',
    }
    const result = suggestionSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('submitSuggestionAction', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns field errors when validation fails', async () => {
    const response = await submitSuggestionAction({
      name: '',
      suggestion: '',
    })

    expect(response.success).toBe(false)
    expect(response.error).toBeDefined()
    expect(response.fieldErrors?.suggestion).toBeDefined()
  })

  it('silently ignores submissions when honeypot field is filled (bot trap)', async () => {
    const sendSpy = vi.spyOn(resendModule, 'sendSuggestionEmail')

    const response = await submitSuggestionAction({
      name: 'Spam Bot',
      suggestion: 'Buy cheap watches here at spam.link',
      honeypot: 'http://spam.com',
    })

    expect(response.success).toBe(true)
    // Email should not have been called
    expect(sendSpy).not.toHaveBeenCalled()
  })

  it('invokes sendSuggestionEmail and returns success on valid submission', async () => {
    const sendSpy = vi.spyOn(resendModule, 'sendSuggestionEmail').mockResolvedValue({
      success: true,
    })

    const response = await submitSuggestionAction({
      name: 'Karim',
      contact: '01712345678',
      suggestion: 'Logitech MX Master 3S mouse in pale grey',
    })

    expect(response.success).toBe(true)
    expect(sendSpy).toHaveBeenCalledWith({
      name: 'Karim',
      contact: '01712345678',
      suggestion: 'Logitech MX Master 3S mouse in pale grey',
    })
  })

  it('propagates email sending failures gracefully', async () => {
    vi.spyOn(resendModule, 'sendSuggestionEmail').mockResolvedValue({
      success: false,
      error: 'Resend API error: Rate limit reached',
    })

    const response = await submitSuggestionAction({
      name: 'Karim',
      suggestion: 'Logitech MX Master 3S',
    })

    expect(response.success).toBe(false)
    expect(response.error).toBe('Resend API error: Rate limit reached')
  })
})
