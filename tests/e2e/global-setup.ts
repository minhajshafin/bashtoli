import { pruneStaleTestUsers } from './test-helpers'

/**
 * Global setup for Playwright E2E suite.
 * Prunes stale per-run E2E test users older than 1 hour.
 * Enforces that E2E_SUPABASE_URL safety guard has passed.
 */
export default async function globalSetup(): Promise<void> {
  await pruneStaleTestUsers()
}
