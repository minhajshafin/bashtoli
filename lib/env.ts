if (typeof window !== 'undefined') {
  throw new Error('lib/env.ts must never be imported in client components.')
}

import { z } from 'zod'

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid URL format'),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, 'Required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Required'),
  ORDER_COOKIE_SECRET: z.string().min(32, 'Must be at least 32 characters'),
  // Optional outside production
  UPSTASH_REDIS_REST_URL: z.string().url('Invalid URL format').optional().or(z.literal('')),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'Required').optional().or(z.literal('')),
  RESEND_API_KEY: z.string().min(1, 'Required').optional().or(z.literal('')),
  ADMIN_NOTIFICATION_EMAIL: z.string().email('Invalid email address').optional().or(z.literal('')),
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid URL format').optional().or(z.literal('')),
  E2E_SUPABASE_URL: z.string().optional(),
})

export const productionEnvSchema = baseEnvSchema.extend({
  UPSTASH_REDIS_REST_URL: z.string().url('Invalid URL format'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'Required'),
  RESEND_API_KEY: z.string().min(1, 'Required'),
  ADMIN_NOTIFICATION_EMAIL: z.string().email('Invalid email address'),
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid URL format'),
})

export type ValidatedEnv = z.infer<typeof productionEnvSchema>

let validatedEnvCache: ValidatedEnv | null = null

/**
 * Validates the environment variables against the appropriate schema.
 * Throws an error listing ONLY missing or invalid variable names (never values).
 */
export function validateEnv(
  rawEnv: Record<string, string | undefined> = process.env
): ValidatedEnv {
  const isProd = rawEnv.NODE_ENV === 'production'
  const schema = isProd ? productionEnvSchema : baseEnvSchema

  const result = schema.safeParse(rawEnv)

  if (!result.success) {
    const errorIssues = result.error.issues
    const invalidVarNames = Array.from(
      new Set(
        errorIssues.map((issue) => {
          const varName = issue.path.join('.') || 'UNKNOWN_VAR'
          return `${varName} (${issue.message})`
        })
      )
    )

    throw new Error(
      `Environment validation failed [${isProd ? 'production' : 'non-production'}]. Missing or invalid variable names: ${invalidVarNames.join(', ')}`
    )
  }

  validatedEnvCache = result.data as ValidatedEnv
  return validatedEnvCache
}

/**
 * Returns the cached validated environment, or runs validation if not yet cached.
 */
export function getValidatedEnv(): ValidatedEnv {
  if (!validatedEnvCache) {
    return validateEnv()
  }
  return validatedEnvCache
}
