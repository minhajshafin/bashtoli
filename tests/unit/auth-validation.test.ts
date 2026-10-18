import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth'

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid credentials', () => {
      const res = loginSchema.safeParse({
        email: 'customer@example.com',
        password: 'ValidPassword123!',
      })
      expect(res.success).toBe(true)
    })

    it('rejects invalid email formats', () => {
      const res = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'ValidPassword123!',
      })
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(res.error.flatten().fieldErrors.email).toContain(
          'Please enter a valid email address'
        )
      }
    })

    it('rejects empty password', () => {
      const res = loginSchema.safeParse({
        email: 'customer@example.com',
        password: '',
      })
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(res.error.flatten().fieldErrors.password).toContain(
          'Password is required'
        )
      }
    })
  })

  describe('signupSchema', () => {
    it('accepts valid customer registration details and transforms email/name', () => {
      const res = signupSchema.safeParse({
        fullName: '  Nafis Fuad  ',
        email: '  NAFIS@Example.COM ',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
      })
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.fullName).toBe('Nafis Fuad')
        expect(res.data.email).toBe('nafis@example.com')
      }
    })

    it('rejects names shorter than 2 characters', () => {
      const res = signupSchema.safeParse({
        fullName: 'A',
        email: 'nafis@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
      })
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(res.error.flatten().fieldErrors.fullName).toContain(
          'Full name must be at least 2 characters long'
        )
      }
    })

    it('rejects passwords shorter than 8 characters', () => {
      const res = signupSchema.safeParse({
        fullName: 'Nafis Fuad',
        email: 'nafis@example.com',
        password: 'short',
        confirmPassword: 'short',
      })
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(res.error.flatten().fieldErrors.password).toContain(
          'Password must be at least 8 characters long'
        )
      }
    })

    it('rejects mismatched password and confirmation', () => {
      const res = signupSchema.safeParse({
        fullName: 'Nafis Fuad',
        email: 'nafis@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'DifferentPassword456!',
      })
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(res.error.flatten().fieldErrors.confirmPassword).toContain(
          'Passwords do not match'
        )
      }
    })
  })

  describe('forgotPasswordSchema', () => {
    it('accepts and normalizes valid emails', () => {
      const res = forgotPasswordSchema.safeParse({
        email: '  TEST.USER@GMAIL.COM  ',
      })
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.email).toBe('test.user@gmail.com')
      }
    })

    it('rejects empty and malformed emails', () => {
      const resEmpty = forgotPasswordSchema.safeParse({ email: '' })
      expect(resEmpty.success).toBe(false)

      const resMalformed = forgotPasswordSchema.safeParse({ email: 'notanemail' })
      expect(resMalformed.success).toBe(false)
    })
  })

  describe('resetPasswordSchema', () => {
    it('accepts valid matching passwords', () => {
      const res = resetPasswordSchema.safeParse({
        password: 'BrandNewPassword123',
        confirmPassword: 'BrandNewPassword123',
      })
      expect(res.success).toBe(true)
    })

    it('rejects mismatched confirmation password', () => {
      const res = resetPasswordSchema.safeParse({
        password: 'BrandNewPassword123',
        confirmPassword: 'TypoInPassword123',
      })
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(res.error.flatten().fieldErrors.confirmPassword).toContain(
          'Passwords do not match'
        )
      }
    })

    it('rejects password below minimum length', () => {
      const res = resetPasswordSchema.safeParse({
        password: '1234',
        confirmPassword: '1234',
      })
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(res.error.flatten().fieldErrors.password).toContain(
          'Password must be at least 8 characters long'
        )
      }
    })
  })
})
