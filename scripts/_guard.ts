import fs from 'node:fs'
import path from 'node:path'

/**
 * Loads environment variables from .env.local and .env if present,
 * without overwriting variables already set in process.env.
 * Does not run during Vitest test suites to preserve test isolation.
 */
export function loadScriptEnv(): void {
  if (process.env.VITEST) return

  const envFiles = ['.env.local', '.env']
  for (const file of envFiles) {
    const envPath = path.resolve(process.cwd(), file)
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim()
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
          if (process.env[key] === undefined) {
            process.env[key] = val
          }
        }
      }
    }
  }
}

/**
 * Shared safety guard for standalone database scripts.
 * Refuses execution unless process.env.SCRIPT_TARGET_URL is explicitly set
 * and strictly matches process.env.NEXT_PUBLIC_SUPABASE_URL.
 * Prints the target project hostname before proceeding.
 * Never prints or leaks credentials, tokens, or keys.
 */
export function assertScriptTarget(
  targetUrl: string | undefined = process.env.SCRIPT_TARGET_URL,
  supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL
): string {
  if (!targetUrl || !supabaseUrl) {
    loadScriptEnv()
    targetUrl = targetUrl ?? process.env.SCRIPT_TARGET_URL
    supabaseUrl = supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  }

  const target = targetUrl?.trim()
  const current = supabaseUrl?.trim()

  if (!target) {
    throw new Error(
      'Safety check failed: SCRIPT_TARGET_URL is not set. ' +
        'Set SCRIPT_TARGET_URL to match NEXT_PUBLIC_SUPABASE_URL to confirm target database.'
    )
  }

  if (!current) {
    throw new Error(
      'Safety check failed: NEXT_PUBLIC_SUPABASE_URL is not set in environment.'
    )
  }

  if (target !== current) {
    let targetHost = target
    let currentHost = current
    try {
      targetHost = new URL(target).hostname
    } catch {}
    try {
      currentHost = new URL(current).hostname
    } catch {}

    throw new Error(
      `Safety check failed: SCRIPT_TARGET_URL (${targetHost}) does not match ` +
        `NEXT_PUBLIC_SUPABASE_URL (${currentHost}). Execution aborted.`
    )
  }

  let hostname: string
  try {
    hostname = new URL(current).hostname
  } catch {
    hostname = current
  }

  console.log(`[script guard] Target project hostname: ${hostname}`)
  return hostname
}
