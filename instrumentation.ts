/**
 * Next.js Instrumentation hook.
 * Runs once at application boot to validate environment variables in Node.js runtime.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/env')
    validateEnv()
  }
}
