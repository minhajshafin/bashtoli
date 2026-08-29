/**
 * @file tests/unit/profile-validation.test.ts
 *
 * Unit tests for profile and password change validation schemas.
 */
import { describe, it, expect } from 'vitest'
import { profileSchema, passwordChangeSchema } from '@/lib/validations/profile'

describe('profileSchema', () => {
  describe('Full Name validation', () => {
    it('accepts valid full names and trims whitespace', () => {
      const result = profileSchema.safeParse({
        fullName: '  Shafi Rahman  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.fullName).toBe('Shafi Rahman')
      }
    })

    it('rejects full names with less than 2 characters', () => {
      const result = profileSchema.safeParse({
        fullName: 'A',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.fullName).toBeDefined()
      }
    })

    it('rejects empty full name', () => {
      const result = profileSchema.safeParse({
        fullName: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('Optional Phone Number validation', () => {
    it('allows phone number to be empty, null, or undefined and transforms to null', () => {
      const resUndefined = profileSchema.safeParse({ fullName: 'Shafi Rahman' })
      expect(resUndefined.success).toBe(true)
      if (resUndefined.success) {
        expect(resUndefined.data.phone).toBeNull()
      }

      const resEmpty = profileSchema.safeParse({ fullName: 'Shafi Rahman', phone: '   ' })
      expect(resEmpty.success).toBe(true)
      if (resEmpty.success) {
        expect(resEmpty.data.phone).toBeNull()
      }
    })

    it('accepts valid 11-digit Bangladeshi phone numbers and normalizes them', () => {
      const result = profileSchema.safeParse({
        fullName: 'Shafi Rahman',
        phone: '01712345678',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.phone).toBe('01712345678')
      }
    })

    it('normalizes +880 and 880 prefix formats', () => {
      const res1 = profileSchema.safeParse({
        fullName: 'Shafi Rahman',
        phone: '+8801812345678',
      })
      expect(res1.success).toBe(true)
      if (res1.success) {
        expect(res1.data.phone).toBe('01812345678')
      }

      const res2 = profileSchema.safeParse({
        fullName: 'Shafi Rahman',
        phone: '8801912345678',
      })
      expect(res2.success).toBe(true)
      if (res2.success) {
        expect(res2.data.phone).toBe('01912345678')
      }
    })

    it('rejects invalid Bangladeshi phone numbers', () => {
      const resInvalid = profileSchema.safeParse({
        fullName: 'Shafi Rahman',
        phone: '123456',
      })
      expect(resInvalid.success).toBe(false)
      if (!resInvalid.success) {
        expect(resInvalid.error.flatten().fieldErrors.phone).toBeDefined()
      }
    })
  })

  describe('Optional Address validation', () => {
    it('allows address to be empty, null, or undefined and transforms to null', () => {
      const resEmpty = profileSchema.safeParse({
        fullName: 'Shafi Rahman',
        address: '  ',
      })
      expect(resEmpty.success).toBe(true)
      if (resEmpty.success) {
        expect(resEmpty.data.address).toBeNull()
      }
    })

    it('accepts valid address strings and trims them', () => {
      const address = 'House 12, Road 4, Sector 7, Uttara, Dhaka'
      const result = profileSchema.safeParse({
        fullName: 'Shafi Rahman',
        address: `  ${address}  `,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.address).toBe(address)
      }
    })

    it('rejects too short non-empty addresses', () => {
      const result = profileSchema.safeParse({
        fullName: 'Shafi Rahman',
        address: 'Dh',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.address).toBeDefined()
      }
    })
  })
})

describe('passwordChangeSchema', () => {
  it('accepts matching passwords with at least 8 characters', () => {
    const result = passwordChangeSchema.safeParse({
      newPassword: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    })
    expect(result.success).toBe(true)
  })

  it('rejects passwords shorter than 8 characters', () => {
    const result = passwordChangeSchema.safeParse({
      newPassword: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.newPassword).toBeDefined()
    }
  })

  it('rejects passwords when confirmation does not match', () => {
    const result = passwordChangeSchema.safeParse({
      newPassword: 'StrongPassword123!',
      confirmPassword: 'DifferentPassword456!',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toBeDefined()
      expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toBe('Passwords do not match')
    }
  })
})
