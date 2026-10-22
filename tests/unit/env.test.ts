// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { validateEnv } from '@/lib/env'

describe('Environment Variable Validation (lib/env.ts)', () => {
  const VALID_BASE_VARS = {
    NODE_ENV: 'development',
    NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_anon_test_key_123',
    SUPABASE_SERVICE_ROLE_KEY: 'test_service_role_secret_key_abc',
    ORDER_COOKIE_SECRET: 'this_is_a_strictly_32_char_secret_key!',
  }

  const VALID_PROD_VARS = {
    ...VALID_BASE_VARS,
    NODE_ENV: 'production',
    UPSTASH_REDIS_REST_URL: 'https://test-redis.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'upstash_test_token_secret',
    RESEND_API_KEY: 're_test_resend_api_key_123',
    ADMIN_NOTIFICATION_EMAIL: 'orders@bashtoli.com',
    NEXT_PUBLIC_APP_URL: 'https://bashtoli.com',
  }

  describe('Non-Production (development/test)', () => {
    it('successfully validates with only base Supabase and cookie secret variables', () => {
      const result = validateEnv(VALID_BASE_VARS)
      expect(result.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test-project.supabase.co')
      expect(result.ORDER_COOKIE_SECRET).toBe('this_is_a_strictly_32_char_secret_key!')
    })

    it('rejects when ORDER_COOKIE_SECRET is less than 32 characters', () => {
      const invalid = {
        ...VALID_BASE_VARS,
        ORDER_COOKIE_SECRET: 'too_short',
      }
      expect(() => validateEnv(invalid)).toThrowError(
        /ORDER_COOKIE_SECRET \(Must be at least 32 characters\)/
      )
    })

    it('rejects when NEXT_PUBLIC_SUPABASE_URL is missing or invalid', () => {
      const invalid = {
        ...VALID_BASE_VARS,
        NEXT_PUBLIC_SUPABASE_URL: 'not-a-valid-url',
      }
      expect(() => validateEnv(invalid)).toThrowError(
        /NEXT_PUBLIC_SUPABASE_URL \(Invalid URL format\)/
      )
    })

    it('does not require production-only vars (Upstash, Resend, App URL) in dev', () => {
      expect(() => validateEnv(VALID_BASE_VARS)).not.toThrow()
    })
  })

  describe('Production Environment', () => {
    it('successfully validates when all required production variables are present', () => {
      const result = validateEnv(VALID_PROD_VARS)
      expect(result.NODE_ENV).toBe('production')
      expect(result.UPSTASH_REDIS_REST_URL).toBe('https://test-redis.upstash.io')
      expect(result.RESEND_API_KEY).toBe('re_test_resend_api_key_123')
      expect(result.ADMIN_NOTIFICATION_EMAIL).toBe('orders@bashtoli.com')
      expect(result.NEXT_PUBLIC_APP_URL).toBe('https://bashtoli.com')
    })

    it('fails loudly in production when Upstash Redis is missing', () => {
      const invalid = {
        ...VALID_PROD_VARS,
        UPSTASH_REDIS_REST_URL: undefined,
        UPSTASH_REDIS_REST_TOKEN: undefined,
      }
      expect(() => validateEnv(invalid)).toThrowError(/UPSTASH_REDIS_REST_URL/)
      expect(() => validateEnv(invalid)).toThrowError(/UPSTASH_REDIS_REST_TOKEN/)
    })

    it('fails loudly in production when Resend is missing', () => {
      const invalid = {
        ...VALID_PROD_VARS,
        RESEND_API_KEY: '',
      }
      expect(() => validateEnv(invalid)).toThrowError(/RESEND_API_KEY/)
    })

    it('fails loudly in production when ADMIN_NOTIFICATION_EMAIL is invalid', () => {
      const invalid = {
        ...VALID_PROD_VARS,
        ADMIN_NOTIFICATION_EMAIL: 'invalid-email-format',
      }
      expect(() => validateEnv(invalid)).toThrowError(/ADMIN_NOTIFICATION_EMAIL/)
    })

    it('fails loudly in production when NEXT_PUBLIC_APP_URL is missing', () => {
      const invalid = {
        ...VALID_PROD_VARS,
        NEXT_PUBLIC_APP_URL: undefined,
      }
      expect(() => validateEnv(invalid)).toThrowError(/NEXT_PUBLIC_APP_URL/)
    })
  })

  describe('Secret Redaction & Security', () => {
    it('never prints variable values in error messages, only variable names and issues', () => {
      const secretValue = 'super_secret_password_value_123456789'
      const invalid = {
        ...VALID_PROD_VARS,
        NEXT_PUBLIC_SUPABASE_URL: secretValue, // invalid URL
        ADMIN_NOTIFICATION_EMAIL: 'not_an_email',
      }

      try {
        validateEnv(invalid)
        expect.unreachable('Should have thrown an error')
      } catch (err) {
        const errorMsg = (err as Error).message
        expect(errorMsg).toContain('NEXT_PUBLIC_SUPABASE_URL')
        expect(errorMsg).toContain('ADMIN_NOTIFICATION_EMAIL')
        expect(errorMsg).not.toContain(secretValue)
      }
    })
  })
})
